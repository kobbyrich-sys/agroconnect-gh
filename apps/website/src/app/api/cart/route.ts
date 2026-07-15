import { NextResponse } from 'next/server';
import { createAdminClient } from '@agroconnect/shared';

async function getOrCreateCart(supabase: any, userId: string) {
  let { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!cart) {
    const { data, error } = await supabase
      .from('carts')
      .insert({ user_id: userId })
      .select('id')
      .single();
    if (error) throw error;
    cart = data;
  }

  return cart.id;
}

export async function GET(request: Request) {
  
  const supabase = createAdminClient();

  const cartId = await getOrCreateCart(supabase, '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */);

  const { data: items, error } = await supabase
    .from('cart_items')
    .select(`
      id, quantity, wholesale, created_at,
      product:product_id (
        id, name, slug, retail_price, wholesale_price, wholesale_min_quantity,
        stock_quantity, low_stock_threshold, discount_percentage, status,
        average_rating, sold_count,
        primary_image:product_images!left(image_url, alt_text, is_primary)
      )
    `)
    .eq('cart_id', cartId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  const cartItems = items?.map((item: any) => ({
    ...item,
    product: {
      ...item.product,
      primary_image: item.product?.primary_image?.find((img: any) => img.is_primary)?.image_url || null,
    },
  }));

  const subtotal = cartItems?.reduce((sum: number, item: any) => {
    const price = item.wholesale && item.product.wholesale_price
      ? parseFloat(item.product.wholesale_price)
      : parseFloat(item.product.retail_price);
    return sum + price * item.quantity;
  }, 0) || 0;

  return NextResponse.json({
    success: true,
    cart_id: cartId,
    items: cartItems || [],
    subtotal,
    item_count: cartItems?.length || 0,
  });
}

export async function POST(request: Request) {
  
  const supabase = createAdminClient();

  const body = await request.json();
  const { product_id, quantity, wholesale } = body;

  if (!product_id || !quantity || quantity < 1) {
    return NextResponse.json(
      { success: false, error: 'Product ID and quantity are required' },
      { status: 400 },
    );
  }

  const { data: product } = await supabase
    .from('products')
    .select('id, stock_quantity, status')
    .eq('id', product_id)
    .single();

  if (!product || product.status !== 'active') {
    return NextResponse.json({ success: false, error: 'Product not available' }, { status: 404 });
  }

  if (quantity > product.stock_quantity) {
    return NextResponse.json(
      { success: false, error: `Only ${product.stock_quantity} in stock` },
      { status: 400 },
    );
  }

  const cartId = await getOrCreateCart(supabase, '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */);

  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('product_id', product_id)
    .maybeSingle();

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > product.stock_quantity) {
      return NextResponse.json(
        { success: false, error: `Only ${product.stock_quantity} in stock` },
        { status: 400 },
      );
    }
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQty, wholesale: wholesale || false })
      .eq('id', existing.id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  } else {
    const { error } = await supabase
      .from('cart_items')
      .insert({ cart_id: cartId, product_id, quantity, wholesale: wholesale || false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  return NextResponse.json({ success: true });
}
