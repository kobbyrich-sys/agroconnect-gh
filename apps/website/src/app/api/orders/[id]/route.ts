import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        id, product_id, product_name, product_image, unit_price, quantity, wholesale, total
      ),
      businesses(business_name, business_logo, business_type, business_phone, business_email),
      payments(method, reference, status, amount, created_at),
      deliveries(
        id, status, delivery_fee, estimated_delivery_time, actual_delivery_time,
        pickup_address, delivery_address, notes, delivery_partner_id,
        delivery_partners(full_name, phone, vehicle_type, vehicle_number)
      )
    `)
    .eq('id', id)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 404 });
  }

  let tracking: any[] | null = null;
  if (order.deliveries?.length > 0) {
    const { data: t } = await supabase
      .from('delivery_tracking')
      .select('*')
      .eq('delivery_id', order.deliveries[0].id)
      .order('created_at', { ascending: false });
    tracking = t || [];
  }

  return NextResponse.json({ success: true, order: { ...order, delivery_tracking: tracking } });
}
