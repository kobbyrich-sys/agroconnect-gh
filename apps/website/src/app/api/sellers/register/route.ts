import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@agroconnect/shared';

const VALID_BUSINESS_TYPES = ['farmer', 'manufacturer', 'wholesaler', 'food_processor', 'cooperative', 'agro_dealer'];

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
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

    if (!VALID_BUSINESS_TYPES.includes(business_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid business type' },
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    const { data: existing } = await admin
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You already have a registered business' },
        { status: 409 },
      );
    }

    const { data: business, error: bizError } = await admin
      .from('businesses')
      .insert({
        owner_id: user.id,
        business_name,
        business_type,
        business_phone,
        business_email: business_email || null,
        business_address,
        gps_address: gps_address || null,
        description: description || null,
        status: 'active',
      })
      .select()
      .single();

    if (bizError) {
      return NextResponse.json({ success: false, error: bizError.message }, { status: 400 });
    }

    const { error: roleError } = await admin
      .from('profiles')
      .update({ role: business_type, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (roleError) {
      return NextResponse.json({ success: false, error: roleError.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: 'Seller account created successfully.', business },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
