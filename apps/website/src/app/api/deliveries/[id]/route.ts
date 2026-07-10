import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { data: delivery, error } = await supabase
    .from('deliveries')
    .select('*, orders(order_number, total, status, profiles!buyer_id(full_name, phone)), delivery_partners(full_name, phone, vehicle_type, vehicle_number)')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 404 });

  const { data: tracking } = await supabase
    .from('delivery_tracking')
    .select('*')
    .eq('delivery_id', id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ success: true, delivery, tracking: tracking || [] });
}
