import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function GET() {
  const supabase = await createServerClient();

  const { data: categories, error } = await supabase
    .from('categories')
    .select(`
      *,
      subcategories!left(id, name, slug, order_index),
      products:products!left(count)
    `)
    .eq('is_active', true)
    .order('order_index');

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  const result = categories?.map((cat: any) => {
    const productCount = Array.isArray(cat.products) ? cat.products.length : 0;
    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image_url: cat.image_url,
      icon: cat.icon,
      parent_id: cat.parent_id,
      order_index: cat.order_index,
      subcategories: cat.subcategories || [],
      product_count: productCount,
    };
  });

  return NextResponse.json({ success: true, categories: result });
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!['admin', 'super_admin'].includes(profile?.role || '')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { name, slug, description, image_url, icon, parent_id, order_index } = body;

  if (!name || !slug) {
    return NextResponse.json({ success: false, error: 'Name and slug are required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({ name, slug, description, image_url, icon, parent_id, order_index: order_index || 0 })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, category: data }, { status: 201 });
}
