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
