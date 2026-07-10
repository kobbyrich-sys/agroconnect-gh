import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images(*),
      product_videos(*),
      categories(id, name, slug),
      subcategories(id, name, slug),
      businesses(id, business_name, business_logo, business_type, business_phone, business_email, gps_address, description, is_verified),
      reviews!left(
        id, rating, title, comment, images, helpful_count, is_verified_purchase, created_at,
        profiles!inner(full_name, avatar_url)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !product) {
    return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
  }

  const { reviews, businesses, categories, subcategories, ...rest } = product;

  const related = await supabase
    .from('products')
    .select(`
      id, name, slug, retail_price, wholesale_price, discount_percentage, average_rating, sold_count,
      product_images!left(image_url, is_primary)
    `)
    .eq('category_id', (product as any).category_id)
    .neq('id', id)
    .eq('is_published', true)
    .limit(8);

  return NextResponse.json({
    success: true,
    product: {
      ...rest,
      category: categories,
      subcategory: subcategories,
      business: businesses,
      reviews: reviews || [],
      related_products: related.data?.map((r: any) => {
        const img = r.product_images?.find((i: any) => i.is_primary) || r.product_images?.[0];
        return { ...r, primary_image: img?.image_url || null, images: undefined };
      }) || [],
    },
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from('products')
    .select('seller_id')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
  }
  if (existing.seller_id !== user.id && !['admin', 'super_admin'].includes((await supabase.from('profiles').select('role').eq('id', user.id).single()).data?.role || '')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const allowedFields = [
    'name', 'description', 'short_description', 'category_id', 'subcategory_id',
    'retail_price', 'wholesale_price', 'wholesale_min_quantity', 'discount_percentage',
    'discount_end_date', 'stock_quantity', 'low_stock_threshold', 'is_featured',
    'is_published', 'brand', 'weight', 'weight_unit', 'unit', 'barcode', 'location', 'region',
  ];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) updates[field] = body[field];
  }
  if (body.name) {
    updates.slug = String(body.name).toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Date.now().toString(36);
  }

  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, product: data });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { data: existing } = await supabase.from('products').select('seller_id').eq('id', id).single();
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (existing.seller_id !== user.id && !['admin', 'super_admin'].includes(profile?.role || '')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: 'Product deleted' });
}
