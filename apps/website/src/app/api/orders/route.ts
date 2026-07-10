import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function GET(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
  const offset = (page - 1) * limit;
  const status = searchParams.get('status');

  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items!left(id, product_name, product_image, unit_price, quantity, total),
      businesses!left(business_name, business_logo)
    `, { count: 'exact' })
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data: orders, count, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    orders,
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

  const body = await request.json();
  const { shipping_address_id, notes } = body;

  if (!shipping_address_id) {
    return NextResponse.json(
      { success: false, error: 'Shipping address is required' },
      { status: 400 },
    );
  }

  const { data: cart, error: cartError } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (cartError || !cart) {
    return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
  }

  const { data: cartItems, error: itemsError } = await supabase
    .from('cart_items')
    .select(`
      id, quantity, wholesale,
      product:product_id (
        id, name, retail_price, wholesale_price, wholesale_min_quantity,
        seller_id, business_id, stock_quantity
      )
    `)
    .eq('cart_id', cart.id);

  if (itemsError || !cartItems?.length) {
    return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
  }

  for (const item of cartItems) {
    const p = item.product as any;
    if (item.quantity > p.stock_quantity) {
      return NextResponse.json(
        { success: false, error: `Insufficient stock for ${p.name}` },
        { status: 400 },
      );
    }
  }

  const { data: address } = await supabase
    .from('addresses')
    .select('*')
    .eq('id', shipping_address_id)
    .eq('user_id', user.id)
    .single();

  if (!address) {
    return NextResponse.json({ success: false, error: 'Address not found' }, { status: 404 });
  }

  const sellerGroups = cartItems.reduce((groups: any, item: any) => {
    const p = item.product as any;
    const key = p.business_id;
    if (!groups[key]) {
      groups[key] = {
        seller_id: p.seller_id,
        business_id: p.business_id,
        items: [],
      };
    }
    groups[key].items.push(item);
    return groups;
  }, {});

  const orderNumber = () => `AGC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const createdOrders = [];

  for (const [businessId, group] of Object.entries(sellerGroups)) {
    const groupData = group as any;
    const subtotal = groupData.items.reduce((sum: number, item: any) => {
      const p = item.product as any;
      const price = item.wholesale && p.wholesale_price
        ? parseFloat(p.wholesale_price)
        : parseFloat(p.retail_price);
      return sum + price * item.quantity;
    }, 0);

    const deliveryFee = subtotal >= 100 ? 0 : 15;
    const commission = subtotal * 0.05;
    const total = subtotal + deliveryFee - commission;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber(),
        buyer_id: user.id,
        seller_id: groupData.seller_id,
        business_id: groupData.business_id,
        subtotal,
        delivery_fee: deliveryFee,
        commission,
        total,
        shipping_address_id,
        shipping_address: address,
        buyer_notes: notes || null,
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ success: false, error: orderError.message }, { status: 400 });
    }

    const orderItems = groupData.items.map((item: any) => {
      const p = item.product as any;
      const price = item.wholesale && p.wholesale_price
        ? parseFloat(p.wholesale_price)
        : parseFloat(p.retail_price);
      return {
        order_id: order.id,
        product_id: p.id,
        product_name: p.name,
        unit_price: price,
        quantity: item.quantity,
        wholesale: item.wholesale || false,
        total: price * item.quantity,
      };
    });

    const { error: itemsInsertError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsInsertError) {
      return NextResponse.json({ success: false, error: itemsInsertError.message }, { status: 400 });
    }

    const productIds = groupData.items.map((item: any) => (item.product as any).id);
    for (const item of groupData.items) {
      const p = item.product as any;
      await supabase.rpc('decrement_stock', {
        p_product_id: p.id,
        p_quantity: item.quantity,
      });
    }

    createdOrders.push(order);
  }

  await supabase.from('cart_items').delete().eq('cart_id', cart.id);

  return NextResponse.json({
    success: true,
    orders: createdOrders,
    message: createdOrders.length === 1
      ? 'Order placed successfully'
      : `${createdOrders.length} orders placed successfully`,
  }, { status: 201 });
}
