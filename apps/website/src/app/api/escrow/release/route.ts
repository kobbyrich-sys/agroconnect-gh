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
    .select('id, escrow_status, buyer_id, seller_id')
    .eq('id', order_id)
    .single();

  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  }

  if (order.escrow_status !== 'held') {
    return NextResponse.json({ success: false, error: 'Escrow not held for this order' }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */)
    .single();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  const isBuyer = '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */ === order.buyer_id;
  const isSeller = '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */ === order.seller_id;

  if (!isAdmin && !isBuyer) {
    return NextResponse.json({ success: false, error: 'Only buyer or admin can release escrow' }, { status: 403 });
  }

  const { data, error } = await supabase.rpc('release_escrow_to_seller', {
    p_order_id: order_id,
    p_actor_id: '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */,
    p_release_type: isBuyer ? 'completed' : 'dispute_resolved',
  });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, escrow_tx_id: data, message: 'Funds released to seller' });
}
