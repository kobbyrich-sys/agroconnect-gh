import { NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@agroconnect/shared';

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
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
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  const isBuyer = user.id === order.buyer_id;
  const isSeller = user.id === order.seller_id;

  if (!isAdmin && !isBuyer) {
    return NextResponse.json({ success: false, error: 'Only buyer or admin can release escrow' }, { status: 403 });
  }

  const { data, error } = await supabase.rpc('release_escrow_to_seller', {
    p_order_id: order_id,
    p_actor_id: user.id,
    p_release_type: isBuyer ? 'completed' : 'dispute_resolved',
  });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, escrow_tx_id: data, message: 'Funds released to seller' });
}
