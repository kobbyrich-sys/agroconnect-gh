import { NextResponse } from 'next/server';
import { createAdminClient } from '@agroconnect/shared';

export async function GET() {
  
  const supabase = createAdminClient();

  const { data: addresses, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, addresses });
}

export async function POST(request: Request) {
  
  const supabase = createAdminClient();

  const body = await request.json();
  const { label, street, city, region, country, gps_address, landmark, lat, lng, is_default } = body;

  if (!label || !street || !city || !region) {
    return NextResponse.json(
      { success: false, error: 'Label, street, city, and region are required' },
      { status: 400 },
    );
  }

  if (is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */);
  }

  const { data, error } = await supabase
    .from('addresses')
    .insert({
      user_id: '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */,
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
