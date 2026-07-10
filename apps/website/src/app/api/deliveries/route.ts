import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { data: deliveries, error } = await supabase
    .from('deliveries')
    .select('*, orders(order_number, total), delivery_partners(full_name, phone, vehicle_type)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });

  return NextResponse.json({ success: true, deliveries: deliveries || [] });
}
