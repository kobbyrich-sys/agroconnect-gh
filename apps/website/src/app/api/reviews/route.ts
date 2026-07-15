import { NextResponse } from 'next/server';
import { createAdminClient } from '@agroconnect/shared';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();

  let query = supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url)', { count: 'exact' })
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (productId) query = query.eq('product_id', productId);

  const { data: reviews, count, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  const [avgResult] = productId ? await Promise.all([
    supabase.rpc('get_product_rating', { p_product_id: productId }),
  ]) : [null];

  return NextResponse.json({
    success: true,
    reviews: reviews || [],
    average_rating: avgResult || null,
    pagination: {
      page, limit,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / limit),
    },
  });
}

export async function POST(request: Request) {
  const authSupabase = await createClient();
  const { data: { user }, error: authError } = await authSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const body = await request.json();
  const { product_id, order_id, rating, title, comment, images } = body;

  if (!product_id || !order_id || !rating || !comment) {
    return NextResponse.json({ success: false, error: 'Product, order, rating, and comment are required' }, { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ success: false, error: 'Rating must be 1-5' }, { status: 400 });
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('id', order_id)
    .eq('buyer_id', user.id)
    .single();

  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', user.id)
    .eq('order_id', order_id)
    .eq('product_id', product_id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: false, error: 'You already reviewed this product for this order' }, { status: 409 });
  }

  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      product_id,
      order_id,
      user_id: user.id,
      rating,
      title: title || null,
      comment,
      images: images || [],
      is_verified_purchase: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  const { data: avg } = await supabase
    .rpc('update_product_rating', { p_product_id: product_id });

  return NextResponse.json({ success: true, review }, { status: 201 });
}
