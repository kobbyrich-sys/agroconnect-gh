import { NextResponse } from 'next/server';
import { createAdminClient } from '@agroconnect/shared';

export async function POST(request: Request) {
  
  const supabase = createAdminClient();

  const body = await request.json();
  const { order_id } = body;

  if (!order_id) {
    return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id, order_number, total, escrow_status, buyer_id')
    .eq('id', order_id)
    .eq('buyer_id', '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */)
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
    p_actor_id: '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */,
  });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, escrow_tx_id: data });
}
