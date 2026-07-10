import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { order_id } = body;

  if (!order_id) {
    return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id, order_number, total, escrow_status, buyer_id')
    .eq('id', order_id)
    .eq('buyer_id', user.id)
    .single();

  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  }

  if (order.escrow_status !== 'pending') {
    return NextResponse.json({ success: false, error: 'Order already processed' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('hold_funds_in_escrow', {
    p_order_id: order_id,
    p_amount: parseFloat(order.total),
    p_actor_id: user.id,
  });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, escrow_tx_id: data });
}
