import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isSeller = profile?.role && ['farmer', 'manufacturer', 'wholesaler'].includes(profile.role);

  const { data: business } = await supabase
    .from('businesses')
    .select(`
      id, business_name, business_type, business_phone, business_email,
      business_logo, business_address, gps_address, registration_number,
      is_verified, status, description,
      seller_verifications!left (
        verification_status, created_at
      )
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    success: true,
    is_seller: !!isSeller,
    can_sell: business?.is_verified === true,
    business,
  });
}
