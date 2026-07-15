import { NextResponse } from 'next/server';
import { createAdminClient } from '@agroconnect/shared';

export async function GET() {
  
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */)
    .single();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  let query = supabase
    .from('disputes')
    .select('*, orders!inner(order_number, total, status, escrow_status), raiser:profiles!raised_by(full_name, phone)')
    .order('created_at', { ascending: false });

  if (!isAdmin) {
    query = query.or(`raised_by.eq.${'00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */},raised_against.eq.${'00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */}`);
  }

  const { data: disputes, error } = await query;

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, disputes });
}

export async function POST(request: Request) {
  
  const supabase = createAdminClient();

  const body = await request.json();
  const { order_id, reason, description } = body;

  if (!order_id || !reason) {
    return NextResponse.json({ success: false, error: 'Order ID and reason are required' }, { status: 400 });
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id, buyer_id, seller_id, escrow_status')
    .eq('id', order_id)
    .single();

  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  }

  if ('00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */ !== order.buyer_id && '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */ !== order.seller_id) {
    return NextResponse.json({ success: false, error: 'Not involved in this order' }, { status: 403 });
  }

  if (order.escrow_status !== 'held') {
    return NextResponse.json({ success: false, error: 'Can only dispute orders with held escrow' }, { status: 400 });
  }

  const { data: dispute, error } = await supabase
    .from('disputes')
    .insert({
      order_id,
      raised_by: '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */,
      raised_against: '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */ === order.buyer_id ? order.seller_id : order.buyer_id,
      reason,
      description: description || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  await supabase.from('orders').update({ escrow_status: 'disputed' }).eq('id', order_id);

  await supabase.from('audit_logs').insert({
    actor_id: '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */,
    action: 'dispute_created',
    entity_type: 'dispute',
    entity_id: dispute.id,
    details: { order_id, reason },
  });

  return NextResponse.json({ success: true, dispute }, { status: 201 });
}
