import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { status, lat, lng, location_name, notes } = await request.json();
  if (!status) return NextResponse.json({ success: false, error: 'Status required' }, { status: 400 });

  const { data: track, error } = await supabase
    .from('delivery_tracking')
    .insert({ delivery_id: id, status, lat, lng, location_name, notes })
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });

  await supabase.from('deliveries').update({ status }).eq('id', id);

  if (status === 'delivered') {
    await supabase
      .from('deliveries')
      .update({ actual_delivery_time: new Date().toISOString() })
      .eq('id', id);
  }

  return NextResponse.json({ success: true, track }, { status: 201 });
}
