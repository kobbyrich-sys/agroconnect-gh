import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerClient();

  const { data: category, error } = await supabase
    .from('categories')
    .select(`
      *,
      subcategories!left(id, name, slug, description, order_index)
    `)
    .eq('slug', slug)
    .single();

  if (error || !category) {
    return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
  }

  const { count: product_count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', (category as any).id)
    .eq('is_published', true);

  const { subcategories, ...rest } = category as any;

  return NextResponse.json({
    success: true,
    category: {
      ...rest,
      subcategories: subcategories || [],
      product_count: product_count || 0,
    },
  });
}
