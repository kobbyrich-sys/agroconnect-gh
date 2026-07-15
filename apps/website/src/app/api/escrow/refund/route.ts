import { NextResponse } from 'next/server';
import { createAdminClient } from '@agroconnect/shared';

export async function POST(request: Request) {
  
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */)
    .single();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
  }

  const body = await request.json();
  const { order_id, reason } = body;

  if (!order_id) {
    return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id, escrow_status')
    .eq('id', order_id)
    .single();

  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  }

  if (order.escrow_status !== 'held' && order.escrow_status !== 'disputed') {
    return NextResponse.json({ success: false, error: 'Escrow not available for refund' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('refund_escrow_to_buyer', {
    p_order_id: order_id,
    p_actor_id: '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */,
    p_refund_type: reason === 'dispute' ? 'dispute_resolved' : 'cancelled',
  });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, escrow_tx_id: data, message: 'Funds refunded to buyer' });
}
