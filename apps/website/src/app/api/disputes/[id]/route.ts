import { NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@agroconnect/shared';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createAdminClient();

  const { data: dispute } = await supabase
    .from('disputes')
    .select('*, orders!inner(*), raiser:profiles!raised_by(full_name, phone, email), target:profiles!raised_against(full_name, phone, email)')
    .eq('id', id)
    .single();

  if (!dispute) {
    return NextResponse.json({ success: false, error: 'Dispute not found' }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  const isInvolved = user.id === dispute.raised_by || user.id === dispute.raised_against;

  if (!isAdmin && !isInvolved) {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  return NextResponse.json({ success: true, dispute });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
  }

  const body = await request.json();
  const { status, resolution_notes } = body;

  if (!status) {
    return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
  }

  const { data: dispute } = await supabase
    .from('disputes')
    .select('id, order_id, status')
    .eq('id', id)
    .single();

  if (!dispute) {
    return NextResponse.json({ success: false, error: 'Dispute not found' }, { status: 404 });
  }

  const { data: updated, error } = await supabase
    .from('disputes')
    .update({
      status,
      resolution_notes: resolution_notes || null,
      resolved_by: user.id,
      resolved_at: ['resolved_buyer', 'resolved_seller', 'cancelled'].includes(status) ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'dispute_resolved',
    entity_type: 'dispute',
    entity_id: id,
    details: { status, resolution_notes },
  });

  return NextResponse.json({ success: true, dispute: updated });
}
