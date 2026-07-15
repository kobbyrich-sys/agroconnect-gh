import { NextResponse } from 'next/server';
import { createAdminClient } from '@agroconnect/shared';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  
  const supabase = createAdminClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        id, product_id, product_name, product_image, unit_price, quantity, wholesale, total
      ),
      businesses(business_name, business_logo, business_type, business_phone, business_email),
      payments(method, reference, status, amount, created_at)
    `)
    .eq('id', id)
    .or(`buyer_id.eq.${'00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */},seller_id.eq.${'00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */}`)
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 404 });
  }

  return NextResponse.json({ success: true, order });
}
