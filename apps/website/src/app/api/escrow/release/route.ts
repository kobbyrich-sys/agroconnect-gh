import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@agroconnect/shared';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  const body = await request.json();
  const { order_id } = body;

  if (!order_id) {
    return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
  }

  const { data: order } = await admin
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

  const { data: profile } = await admin
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

  const { data, error } = await admin.rpc('release_escrow_to_seller', {
    p_order_id: order_id,
    p_actor_id: user.id,
    p_release_type: isBuyer ? 'completed' : 'dispute_resolved',
  });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, escrow_tx_id: data, message: 'Funds released to seller' });
}
