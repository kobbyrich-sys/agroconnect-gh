import { NextResponse } from 'next/server';
import { createAdminClient } from '@agroconnect/shared';

export async function POST(request: Request) {
  try {
    
    const supabase = createAdminClient();

    const body = await request.json();
    const { business_name, business_type, business_phone, business_email, business_address, gps_address, description } = body;

    if (!business_name || !business_type || !business_phone || !business_address) {
      return NextResponse.json(
        { success: false, error: 'Business name, type, phone, and address are required' },
        { status: 400 },
      );
    }

    if (!['farmer', 'manufacturer', 'wholesaler'].includes(business_type)) {
      return NextResponse.json(
        { success: false, error: 'Business type must be farmer, manufacturer, or wholesaler' },
        { status: 400 },
      );
    }

    const { data: existing } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You already have a registered business' },
        { status: 409 },
      );
    }

    const { data: business, error } = await supabase
      .from('businesses')
      .insert({
        owner_id: '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */,
        business_name,
        business_type,
        business_phone,
        business_email,
        business_address,
        gps_address,
        description,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    await supabase.from('user_roles').insert({
      user_id: '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */,
      role: 'seller',
    }).maybeSingle();

    const { data: sellerProfile } = await supabase.from('seller_profiles').insert({
      user_id: '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */,
      business_name,
      business_phone,
      business_email: business_email || null,
      business_address,
      gps_address: gps_address || null,
      description: description || null,
      status: 'pending',
    }).select('id').single();

    if (sellerProfile && business_type && ['farmer', 'manufacturer', 'wholesaler'].includes(business_type)) {
      await supabase.from('seller_business_types').insert({
        seller_id: sellerProfile.id,
        business_type,
      }).maybeSingle();
    }

    return NextResponse.json(
      { success: true, message: 'Business registered successfully. Awaiting admin approval.', business },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
