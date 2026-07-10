import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

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
      .eq('owner_id', user.id)
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
        owner_id: user.id,
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

    await supabase.from('profiles').update({ role: business_type }).eq('id', user.id);

    return NextResponse.json(
      { success: true, message: 'Business registered successfully. Awaiting admin approval.', business },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
