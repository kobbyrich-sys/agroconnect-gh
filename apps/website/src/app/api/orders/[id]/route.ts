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
      payments(method, reference, status, amount, created_at)
    `)
    .eq('id', id)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 404 });
  }

  return NextResponse.json({ success: true, order });
}
