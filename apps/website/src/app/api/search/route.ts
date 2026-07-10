import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const offset = (page - 1) * limit;
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const minPrice = searchParams.get('min_price');
  const maxPrice = searchParams.get('max_price');
  const region = searchParams.get('region');
  const minRating = searchParams.get('min_rating');
  const sellerType = searchParams.get('seller_type');
  const sort = searchParams.get('sort') || 'relevance';

  const supabase = await createServerClient();

  let query = supabase
    .from('products')
    .select(`
      *,
      product_images!left(image_url, alt_text, is_primary, order_index),
      categories!inner(name, slug),
      businesses!inner(business_name, business_logo, business_type)
    `, { count: 'exact' })
    .eq('is_published', true)
    .eq('status', 'active');

  if (q) {
    query = query.textSearch('search_vector', q, { config: 'english' });
  }

  if (category) query = query.eq('categories.slug', category);
  if (subcategory) query = query.eq('subcategory_id', subcategory);
  if (region) query = query.eq('region', region);
  if (sellerType) query = query.eq('businesses.business_type', sellerType);
  if (minPrice) query = query.gte('retail_price', parseFloat(minPrice));
  if (maxPrice) query = query.lte('retail_price', parseFloat(maxPrice));
  if (minRating) query = query.gte('average_rating', parseFloat(minRating));

  const sortMap: Record<string, string> = {
    relevance: 'created_at',
    newest: 'created_at',
    price_asc: 'retail_price',
    price_desc: 'retail_price',
    rating: 'average_rating',
    popular: 'sold_count',
  };
  const sortField = sortMap[sort] || 'created_at';
  query = query.order(sortField, { ascending: sort === 'price_asc' }).order('created_at', { ascending: false });

  const { data, count, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  const products = data?.map((p: any) => {
    const primaryImage = p.product_images?.find((img: any) => img.is_primary) || p.product_images?.[0];
    const { product_images, categories, businesses, ...product } = p;
    return {
      ...product,
      primary_image: primaryImage?.image_url || null,
      category_name: categories?.name,
      category_slug: categories?.slug,
      business_name: businesses?.business_name,
      business_logo: businesses?.business_logo,
      seller_type: businesses?.business_type,
    };
  });

  if (q && count && count > 0) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('search_history').insert({
        user_id: user.id,
        query: q,
        filters: { category, region, min_price: minPrice, max_price: maxPrice },
        results_count: count,
      });
    }
  }

  return NextResponse.json({
    success: true,
    products,
    pagination: {
      page,
      limit,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / limit),
    },
    query: q,
  });
}
