import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@agroconnect/shared';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  const body = await request.json();
  const { quantity } = body;

  if (!quantity || quantity < 1) {
    return NextResponse.json(
      { success: false, error: 'Quantity must be at least 1' },
      { status: 400 },
    );
  }

  const { data: item } = await admin
    .from('cart_items')
    .select('product_id')
    .eq('id', id)
    .single();

  if (!item) {
    return NextResponse.json({ success: false, error: 'Cart item not found' }, { status: 404 });
  }

  const { data: product } = await admin
    .from('products')
    .select('stock_quantity')
    .eq('id', item.product_id)
    .single();

  if (!product || quantity > product.stock_quantity) {
    return NextResponse.json(
      { success: false, error: !product ? 'Product not found' : `Only ${product.stock_quantity} in stock` },
      { status: 400 },
    );
  }

  const { error } = await admin
    .from('cart_items')
    .update({ quantity })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from('cart_items')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
