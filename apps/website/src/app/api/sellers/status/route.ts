import { NextResponse } from 'next/server';
import { createAdminClient } from '@agroconnect/shared';

export async function GET() {
  
  const supabase = createAdminClient();

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */)
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
    .eq('owner_id', '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */)
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
