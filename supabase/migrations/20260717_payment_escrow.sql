-- Payment / Manual Escrow columns for orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending','awaiting_payment','paid','escrow_held','escrow_released','refunded')),
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS escrow_held_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS escrow_released_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS platform_fee_rate NUMERIC(4,2) DEFAULT 5.00;

-- SECURITY DEFINER function: admin confirms payment received
CREATE OR REPLACE FUNCTION public.admin_confirm_payment(
  p_order_id UUID,
  p_payment_method TEXT,
  p_payment_reference TEXT,
  p_platform_fee_rate NUMERIC DEFAULT 5.00
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order RECORD;
  v_wallet RECORD;
  v_fee_amount NUMERIC;
BEGIN
  -- Verify caller is admin
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('error', 'Only admins can confirm payments');
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Order not found');
  END IF;

  IF v_order.payment_status NOT IN ('pending', 'awaiting_payment') THEN
    RETURN jsonb_build_object('error', 'Order is not awaiting payment');
  END IF;

  -- Get or create seller wallet
  INSERT INTO public.wallets (user_id, balance, pending_balance, currency)
  VALUES (v_order.seller_id, 0, 0, v_order.currency)
  ON CONFLICT (user_id) DO UPDATE SET user_id = v_order.seller_id
  RETURNING * INTO v_wallet;

  -- Calculate platform fee
  v_fee_amount := ROUND(v_order.total * p_platform_fee_rate / 100, 2);

  -- Update order
  UPDATE public.orders SET
    status = 'confirmed',
    payment_status = 'paid',
    payment_method = p_payment_method,
    payment_reference = p_payment_reference,
    paid_at = now(),
    escrow_held_at = now(),
    platform_fee = v_fee_amount,
    platform_fee_rate = p_platform_fee_rate
  WHERE id = p_order_id;

  -- Credit seller pending_balance (escrow hold)
  UPDATE public.wallets
  SET pending_balance = pending_balance + (v_order.total - v_fee_amount),
      updated_at = now()
  WHERE id = v_wallet.id
  RETURNING * INTO v_wallet;

  -- Ledger entry: escrow_hold
  INSERT INTO public.ledger_entries (wallet_id, type, amount, balance_before, balance_after, reference, description)
  VALUES (
    v_wallet.id, 'escrow_hold', v_order.total - v_fee_amount,
    v_wallet.pending_balance - (v_order.total - v_fee_amount), v_wallet.pending_balance,
    p_payment_reference,
    format('Payment confirmed for order %s (fee: %s %s)', p_order_id, v_fee_amount, v_order.currency)
  );

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id, 'escrow_amount', v_order.total - v_fee_amount, 'platform_fee', v_fee_amount);
END;
$$;

-- SECURITY DEFINER function: admin releases escrow to seller
CREATE OR REPLACE FUNCTION public.admin_release_payment(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order RECORD;
  v_wallet RECORD;
  v_net_amount NUMERIC;
BEGIN
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('error', 'Only admins can release payments');
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Order not found');
  END IF;

  IF v_order.payment_status NOT IN ('paid', 'escrow_held') THEN
    RETURN jsonb_build_object('error', 'Payment is not held in escrow');
  END IF;

  IF v_order.status NOT IN ('delivered') THEN
    RETURN jsonb_build_object('error', 'Order must be delivered before releasing payment');
  END IF;

  v_net_amount := v_order.total - COALESCE(v_order.platform_fee, 0);

  SELECT * INTO v_wallet FROM public.wallets WHERE user_id = v_order.seller_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Seller wallet not found');
  END IF;

  -- Release escrow: move from pending_balance to balance
  UPDATE public.wallets
  SET pending_balance = pending_balance - v_net_amount,
      balance = balance + v_net_amount,
      updated_at = now()
  WHERE id = v_wallet.id
  RETURNING * INTO v_wallet;

  -- Update order
  UPDATE public.orders SET
    payment_status = 'escrow_released',
    escrow_released_at = now()
  WHERE id = p_order_id;

  -- Ledger entry: escrow_release
  INSERT INTO public.ledger_entries (wallet_id, type, amount, balance_before, balance_after, reference, description)
  VALUES (
    v_wallet.id, 'escrow_release', v_net_amount,
    v_wallet.balance - v_net_amount + v_net_amount, v_wallet.balance,
    v_order.id::text,
    format('Escrow released for order %s', p_order_id)
  );

  -- Ledger entry: platform_fee (if any)
  IF COALESCE(v_order.platform_fee, 0) > 0 THEN
    INSERT INTO public.ledger_entries (wallet_id, type, amount, balance_before, balance_after, reference, description)
    VALUES (
      v_wallet.id, 'platform_fee', v_order.platform_fee,
      v_wallet.balance - v_net_amount, v_wallet.balance,
      v_order.id::text,
      format('Platform fee for order %s (%s%%)', p_order_id, v_order.platform_fee_rate)
    );
  END IF;

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id, 'released_amount', v_net_amount);
END;
$$;

-- SECURITY DEFINER function: admin refunds payment (cancels escrow)
CREATE OR REPLACE FUNCTION public.admin_refund_payment(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order RECORD;
  v_wallet RECORD;
  v_net_amount NUMERIC;
BEGIN
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('error', 'Only admins can refund payments');
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Order not found');
  END IF;

  IF v_order.payment_status NOT IN ('paid', 'escrow_held') THEN
    RETURN jsonb_build_object('error', 'Payment is not held in escrow');
  END IF;

  v_net_amount := v_order.total - COALESCE(v_order.platform_fee, 0);

  SELECT * INTO v_wallet FROM public.wallets WHERE user_id = v_order.seller_id;

  IF FOUND THEN
    -- Release from pending_balance back to zero (buyer gets refunded off-platform)
    UPDATE public.wallets
    SET pending_balance = GREATEST(pending_balance - v_net_amount, 0),
        updated_at = now()
    WHERE id = v_wallet.id;

    INSERT INTO public.ledger_entries (wallet_id, type, amount, balance_before, balance_after, reference, description)
    VALUES (
      v_wallet.id, 'refund', -v_net_amount,
      v_wallet.pending_balance, GREATEST(v_wallet.pending_balance - v_net_amount, 0),
      v_order.id::text,
      format('Payment refunded for order %s', p_order_id)
    );
  END IF;

  UPDATE public.orders SET
    status = 'refunded',
    payment_status = 'refunded',
    escrow_released_at = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id, 'refunded_amount', v_net_amount);
END;
$$;

-- RPC wrappers so the supabase client can call them via rpc()
CREATE OR REPLACE FUNCTION public.confirm_payment(
  p_order_id UUID,
  p_payment_method TEXT,
  p_payment_reference TEXT,
  p_platform_fee_rate NUMERIC DEFAULT 5.00
) RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.admin_confirm_payment(p_order_id, p_payment_method, p_payment_reference, p_platform_fee_rate);
$$;

CREATE OR REPLACE FUNCTION public.release_payment(p_order_id UUID)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.admin_release_payment(p_order_id);
$$;

CREATE OR REPLACE FUNCTION public.refund_payment(p_order_id UUID)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.admin_refund_payment(p_order_id);
$$;

-- Allow authenticated users to call these RPCs (the SECURITY DEFINER handles admin check)
GRANT EXECUTE ON FUNCTION public.confirm_payment(UUID, TEXT, TEXT, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.release_payment(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refund_payment(UUID) TO authenticated;

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.orders;
