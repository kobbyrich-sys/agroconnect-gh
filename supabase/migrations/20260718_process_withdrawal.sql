-- is_admin: returns true if the current user has admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- process_withdrawal: admin processes a withdrawal request
CREATE OR REPLACE FUNCTION public.process_withdrawal(
  p_request_id UUID,
  p_new_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_req RECORD;
  v_wallet RECORD;
BEGIN
  -- Verify caller is admin
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('error', 'Only admins can process withdrawals');
  END IF;

  -- Get withdrawal request
  SELECT * INTO v_req FROM public.withdrawal_requests WHERE id = p_request_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Withdrawal request not found');
  END IF;

  IF p_new_status NOT IN ('approved', 'processed', 'rejected') THEN
    RETURN jsonb_build_object('error', 'Invalid status');
  END IF;

  -- Approve: just update status
  IF p_new_status = 'approved' THEN
    UPDATE public.withdrawal_requests SET
      status = 'approved',
      updated_at = now()
    WHERE id = p_request_id;
    RETURN jsonb_build_object('success', true, 'status', 'approved');
  END IF;

  -- Reject: just update status
  IF p_new_status = 'rejected' THEN
    UPDATE public.withdrawal_requests SET
      status = 'rejected',
      updated_at = now()
    WHERE id = p_request_id;
    RETURN jsonb_build_object('success', true, 'status', 'rejected');
  END IF;

  -- Processed: deduct from wallet balance
  IF p_new_status = 'processed' THEN
    -- Get wallet
    SELECT * INTO v_wallet FROM public.wallets WHERE id = v_req.wallet_id;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('error', 'Wallet not found');
    END IF;

    IF v_wallet.balance < v_req.amount THEN
      RETURN jsonb_build_object('error', 'Insufficient wallet balance');
    END IF;

    -- Deduct from balance
    UPDATE public.wallets SET
      balance = balance - v_req.amount,
      updated_at = now()
    WHERE id = v_wallet.id
    RETURNING * INTO v_wallet;

    -- Ledger entry
    INSERT INTO public.ledger_entries (wallet_id, type, amount, balance_before, balance_after, reference, description)
    VALUES (
      v_wallet.id, 'withdrawal', -v_req.amount,
      v_wallet.balance + v_req.amount, v_wallet.balance,
      p_request_id::text,
      format('Withdrawal processed: %s %s via %s', v_req.amount, 'GHS', v_req.method)
    );

    -- Update request
    UPDATE public.withdrawal_requests SET
      status = 'processed',
      processed_at = now(),
      updated_at = now()
    WHERE id = p_request_id;

    RETURN jsonb_build_object('success', true, 'status', 'processed', 'amount', v_req.amount);
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_withdrawal(UUID, TEXT) TO authenticated;

-- confirm_paystack_payment: buyer confirms payment after successful Paystack checkout
CREATE OR REPLACE FUNCTION public.confirm_paystack_payment(
  p_order_id UUID,
  p_reference TEXT
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
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Order not found');
  END IF;

  IF v_order.buyer_id <> auth.uid() THEN
    RETURN jsonb_build_object('error', 'Only the buyer can confirm payment');
  END IF;

  IF v_order.payment_status NOT IN ('pending', 'awaiting_payment') THEN
    RETURN jsonb_build_object('error', 'Payment already confirmed');
  END IF;

  v_fee_amount := ROUND(v_order.total * 5.00 / 100, 2);

  INSERT INTO public.wallets (user_id, balance, pending_balance, currency)
  VALUES (v_order.seller_id, 0, 0, v_order.currency)
  ON CONFLICT (user_id) DO UPDATE SET user_id = v_order.seller_id
  RETURNING * INTO v_wallet;

  UPDATE public.orders SET
    status = 'confirmed',
    payment_status = 'paid',
    payment_method = 'paystack',
    payment_reference = p_reference,
    paid_at = now(),
    escrow_held_at = now(),
    platform_fee = v_fee_amount,
    platform_fee_rate = 5.00
  WHERE id = p_order_id;

  UPDATE public.wallets
  SET pending_balance = pending_balance + (v_order.total - v_fee_amount),
      updated_at = now()
  WHERE id = v_wallet.id
  RETURNING * INTO v_wallet;

  INSERT INTO public.ledger_entries (wallet_id, type, amount, balance_before, balance_after, reference, description)
  VALUES (
    v_wallet.id, 'escrow_hold', v_order.total - v_fee_amount,
    v_wallet.pending_balance - (v_order.total - v_fee_amount), v_wallet.pending_balance,
    p_reference,
    format('Payment confirmed via Paystack for order %s (fee: %s %s)', p_order_id, v_fee_amount, v_order.currency)
  );

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id, 'escrow_amount', v_order.total - v_fee_amount, 'platform_fee', v_fee_amount);
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirm_paystack_payment(UUID, TEXT) TO authenticated;

-- release_order_escrow: buyer triggers escrow release after confirming delivery
CREATE OR REPLACE FUNCTION public.release_order_escrow(p_order_id UUID)
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
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Order not found');
  END IF;

  IF v_order.buyer_id <> auth.uid() THEN
    RETURN jsonb_build_object('error', 'Only the buyer can release escrow');
  END IF;

  IF v_order.status <> 'delivered' THEN
    RETURN jsonb_build_object('error', 'Order must be delivered');
  END IF;

  IF v_order.payment_status NOT IN ('paid', 'escrow_held') THEN
    RETURN jsonb_build_object('error', 'Payment not held in escrow');
  END IF;

  v_net_amount := v_order.total - COALESCE(v_order.platform_fee, 0);

  SELECT * INTO v_wallet FROM public.wallets WHERE user_id = v_order.seller_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Seller wallet not found');
  END IF;

  UPDATE public.wallets
  SET pending_balance = GREATEST(pending_balance - v_net_amount, 0),
      balance = balance + v_net_amount,
      updated_at = now()
  WHERE id = v_wallet.id
  RETURNING * INTO v_wallet;

  UPDATE public.orders SET
    payment_status = 'escrow_released',
    escrow_released_at = now()
  WHERE id = p_order_id;

  INSERT INTO public.ledger_entries (wallet_id, type, amount, balance_before, balance_after, reference, description)
  VALUES (
    v_wallet.id, 'escrow_release', v_net_amount,
    v_wallet.balance - v_net_amount, v_wallet.balance,
    p_order_id::text,
    format('Escrow released for order %s', p_order_id)
  );

  IF COALESCE(v_order.platform_fee, 0) > 0 THEN
    INSERT INTO public.ledger_entries (wallet_id, type, amount, balance_before, balance_after, reference, description)
    VALUES (
      v_wallet.id, 'platform_fee', v_order.platform_fee,
      v_wallet.balance - v_net_amount, v_wallet.balance,
      p_order_id::text,
      format('Platform fee for order %s (%s%%)', p_order_id, v_order.platform_fee_rate)
    );
  END IF;

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id, 'released_amount', v_net_amount);
END;
$$;

GRANT EXECUTE ON FUNCTION public.release_order_escrow(UUID) TO authenticated;
