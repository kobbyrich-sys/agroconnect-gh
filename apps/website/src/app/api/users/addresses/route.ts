import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@agroconnect/shared';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const adminSupabase = createAdminClient();

  const { data: addresses, error } = await adminSupabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, addresses });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const adminSupabase = createAdminClient();

  const body = await request.json();
  const { label, street, city, region, country, gps_address, landmark, lat, lng, is_default } = body;

  if (!label || !street || !city || !region) {
    return NextResponse.json(
      { success: false, error: 'Label, street, city, and region are required' },
      { status: 400 },
    );
  }

  if (is_default) {
    await adminSupabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id);
  }

  const { data, error } = await adminSupabase
    .from('addresses')
    .insert({
      user_id: user.id,
      label,
      street,
      city,
      region,
      country: country || 'Ghana',
      gps_address,
      landmark,
      lat,
      lng,
      is_default: is_default || false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, address: data }, { status: 201 });
}
