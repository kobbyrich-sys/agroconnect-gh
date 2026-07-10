import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const offset = (page - 1) * limit;
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const seller = searchParams.get('seller');
  const minPrice = searchParams.get('min_price');
  const maxPrice = searchParams.get('max_price');
  const region = searchParams.get('region');
  const minRating = searchParams.get('min_rating');
  const sort = searchParams.get('sort') || 'newest';
  const featured = searchParams.get('featured');

  const supabase = await createServerClient();

  let query = supabase
    .from('products')
    .select(`
      *,
      product_images!left(image_url, alt_text, is_primary, order_index),
      categories!left(name, slug),
      businesses!left(business_name, business_logo, business_type, gps_address)
    `, { count: 'exact' })
    .eq('is_published', true)
    .eq('status', 'active');

  if (category) query = query.eq('categories.slug', category);
  if (subcategory) query = query.eq('subcategory_id', subcategory);
  if (seller) query = query.eq('seller_id', seller);
  if (region) query = query.eq('region', region);
  if (minPrice) query = query.gte('retail_price', parseFloat(minPrice));
  if (maxPrice) query = query.lte('retail_price', parseFloat(maxPrice));
  if (minRating) query = query.gte('average_rating', parseFloat(minRating));
  if (featured === 'true') query = query.eq('is_featured', true);

  const sortMap: Record<string, string> = {
    newest: 'created_at',
    price_asc: 'retail_price',
    price_desc: 'retail_price',
    rating: 'average_rating',
    popular: 'sold_count',
  };
  const sortField = sortMap[sort] || 'created_at';
  const sortDir = sort === 'price_asc' ? true : false;
  query = query.order(sortField, { ascending: sortDir }).order('created_at', { ascending: false });

  const { data, count, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  const products = data?.map((p) => {
    const { product_images, categories, businesses, ...product } = p;
    const primaryImage = product_images?.find((img: any) => img.is_primary) || product_images?.[0];
    return {
      ...product,
      primary_image: primaryImage?.image_url || null,
      primary_image_alt: primaryImage?.alt_text || null,
      images: product_images || [],
      category_name: (categories as any)?.name,
      category_slug: (categories as any)?.slug,
      business_name: (businesses as any)?.business_name,
      business_logo: (businesses as any)?.business_logo,
    };
  });

  return NextResponse.json({
    success: true,
    products,
    pagination: {
      page,
      limit,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / limit),
    },
  });
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const role = profile.data?.role;
  if (!role || !['farmer', 'manufacturer', 'wholesaler'].includes(role)) {
    return NextResponse.json({ success: false, error: 'Only sellers can create products' }, { status: 403 });
  }

  const body = await request.json();
  const { name, description, category_id, subcategory_id, retail_price, stock_quantity, ...rest } = body;

  if (!name || !description || !category_id || retail_price === undefined || stock_quantity === undefined) {
    return NextResponse.json(
      { success: false, error: 'Name, description, category, price, and stock are required' },
      { status: 400 },
    );
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .eq('is_verified', true)
    .single();

  if (!business) {
    return NextResponse.json(
      { success: false, error: 'Verified business required to sell products' },
      { status: 403 },
    );
  }

  const slug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Date.now().toString(36);

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      seller_id: user.id,
      business_id: business.id,
      name,
      slug,
      description: description,
      category_id,
      subcategory_id: subcategory_id || null,
      retail_price,
      stock_quantity,
      sku: `SKU-${Date.now().toString(36).toUpperCase()}`,
      ...rest,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, product }, { status: 201 });
}
