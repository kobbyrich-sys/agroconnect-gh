import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { action } = body;

  if (!action) {
    return NextResponse.json({ success: false, error: 'Action is required' }, { status: 400 });
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id, status, escrow_status, buyer_id, seller_id')
    .eq('id', id)
    .single();

  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  }

  const validActions: Record<string, { allowed: string[]; from: string[]; updates: Record<string, any> }> = {
    accept: {
      allowed: ['seller'],
      from: ['confirmed'],
      updates: { status: 'processing', seller_accepted_at: new Date().toISOString() },
    },
    mark_ready: {
      allowed: ['seller'],
      from: ['processing'],
      updates: { status: 'ready_for_pickup' },
    },
    confirm_completion: {
      allowed: ['buyer'],
      from: ['ready_for_pickup', 'processing'],
      updates: { buyer_confirmed_at: new Date().toISOString() },
    },
    cancel: {
      allowed: ['buyer', 'seller'],
      from: ['pending', 'confirmed'],
      updates: { status: 'cancelled' },
    },
  };

  const actionDef = validActions[action];
  if (!actionDef) {
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  }

  const isBuyer = user.id === order.buyer_id;
  const isSeller = user.id === order.seller_id;
  const role = isBuyer ? 'buyer' : (isSeller ? 'seller' : null);

  if (!role || !actionDef.allowed.includes(role)) {
    return NextResponse.json({ success: false, error: 'Not authorized for this action' }, { status: 403 });
  }

  if (!actionDef.from.includes(order.status)) {
    return NextResponse.json({ success: false, error: `Cannot ${action} order in ${order.status} status` }, { status: 400 });
  }

  const { error } = await supabase
    .from('orders')
    .update(actionDef.updates)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  if (action === 'confirm_completion' && order.escrow_status === 'held') {
    await supabase.rpc('release_escrow_to_seller', {
      p_order_id: id,
      p_actor_id: user.id,
      p_release_type: 'completed',
    });
  }

  if (action === 'cancel' && order.escrow_status === 'held') {
    await supabase.rpc('refund_escrow_to_buyer', {
      p_order_id: id,
      p_actor_id: user.id,
      p_refund_type: 'cancelled',
    });
  }

  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action: `order_${action}`,
    entity_type: 'order',
    entity_id: id,
    details: { action, previous_status: order.status },
  });

  return NextResponse.json({ success: true, message: `Order ${action} successful` });
}
