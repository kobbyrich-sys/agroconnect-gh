import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@agroconnect/shared';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: items, error } = await admin
    .from('wishlist_items')
    .select('id, created_at, product:product_id(id, name, slug, retail_price, discount_percentage, average_rating, status, product_images(image_url, is_primary))')
    .eq('user_id', user.id)
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
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  const { product_id } = await request.json();
  if (!product_id) return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });

  const { data: existing } = await admin
    .from('wishlist_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', product_id)
    .maybeSingle();

  if (existing) {
    await admin.from('wishlist_items').delete().eq('id', existing.id);
    return NextResponse.json({ success: true, action: 'removed' });
  }

  const { error } = await admin
    .from('wishlist_items')
    .insert({ user_id: user.id, product_id });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });

  return NextResponse.json({ success: true, action: 'added' }, { status: 201 });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');

  const { error } = await admin
    .from('wishlist_items')
    .delete()
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
