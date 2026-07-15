import { NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@agroconnect/shared';

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createAdminClient();

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'seller')
    .eq('is_active', true)
    .maybeSingle();

  const isSeller = !!userRole;

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
