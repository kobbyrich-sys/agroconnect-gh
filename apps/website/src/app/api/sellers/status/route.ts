import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@agroconnect/shared';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();

    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const sellerRoles = ['farmer', 'manufacturer', 'wholesaler', 'food_processor', 'cooperative', 'agro_dealer'];
    const isSeller = sellerRoles.includes(profile?.role || '');

    const { data: business } = await admin
      .from('businesses')
      .select('id, business_name, business_type, business_phone, business_email, business_logo, business_address, gps_address, registration_number, is_verified, status, description')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      is_seller: isSeller,
      can_sell: business?.is_verified === true,
      business,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'An error occurred' },
      { status: 500 },
    );
  }
}
