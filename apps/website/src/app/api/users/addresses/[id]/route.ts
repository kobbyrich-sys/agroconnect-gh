import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from('addresses')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ success: false, error: 'Address not found' }, { status: 404 });
  }

  const body = await request.json();

  if (body.is_default) {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
  }

  const updates: Record<string, unknown> = {};
  const allowedFields = ['label', 'street', 'city', 'region', 'country', 'gps_address', 'landmark', 'lat', 'lng', 'is_default'];
  for (const field of allowedFields) {
    if (body[field] !== undefined) updates[field] = body[field];
  }

  const { data, error } = await supabase
    .from('addresses')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, address: data });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: 'Address deleted' });
}
