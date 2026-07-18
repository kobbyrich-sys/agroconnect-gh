-- confirm_delivery: buyer-only RPC to mark order as delivered
CREATE OR REPLACE FUNCTION public.confirm_delivery(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order RECORD;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Order not found');
  END IF;

  IF v_order.buyer_id <> auth.uid() THEN
    RETURN jsonb_build_object('error', 'Only the buyer can confirm delivery');
  END IF;

  IF v_order.status <> 'shipped' THEN
    RETURN jsonb_build_object('error', 'Order must be shipped before confirming delivery');
  END IF;

  UPDATE public.orders SET
    status = 'delivered',
    delivered_at = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirm_delivery(UUID) TO authenticated;
