import { NextResponse } from 'next/server';
import { createAdminClient } from '@agroconnect/shared';

export async function GET() {
  
  const supabase = createAdminClient();

  const { data: items, error } = await supabase
    .from('wishlist_items')
    .select('id, created_at, product:product_id(id, name, slug, retail_price, discount_percentage, average_rating, status, product_images(image_url, is_primary))')
    .eq('user_id', '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });

  const products = items?.map((item: any) => {
    const product = item.product;
    const primaryImg = product?.product_images?.find((img: any) => img.is_primary) || product?.product_images?.[0];
    return { wishlist_id: item.id, added_at: item.created_at, ...product, primary_image: primaryImg?.image_url || null, product_images: undefined };
  }) || [];

  return NextResponse.json({ success: true, items: products });
}

export async function POST(request: Request) {
  
  const supabase = createAdminClient();

  const { product_id } = await request.json();
  if (!product_id) return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });

  const { data: existing } = await supabase
    .from('wishlist_items')
    .select('id')
    .eq('user_id', '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */)
    .eq('product_id', product_id)
    .maybeSingle();

  if (existing) {
    await supabase.from('wishlist_items').delete().eq('id', existing.id);
    return NextResponse.json({ success: true, action: 'removed' });
  }

  const { error } = await supabase
    .from('wishlist_items')
    .insert({ user_id: '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */, product_id });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });

  return NextResponse.json({ success: true, action: 'added' }, { status: 201 });
}

export async function DELETE(request: Request) {
  
  const supabase = createAdminClient();

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');

  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('user_id', '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */)
    .maybeSingle();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
