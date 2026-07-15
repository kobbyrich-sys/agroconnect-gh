import { NextResponse } from 'next/server';
import { createAdminClient } from '@agroconnect/shared';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const supabase = createAdminClient();

  const { data: product } = await supabase.from('products').select('seller_id').eq('id', id).single();
  if (!product || product.seller_id !== '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const formData = await request.formData();
  const files = formData.getAll('images') as File[];
  const isPrimary = formData.get('is_primary') === 'true';

  if (!files.length) {
    return NextResponse.json({ success: false, error: 'No images provided' }, { status: 400 });
  }

  const uploaded: { image_url: string; is_primary: boolean }[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split('.').pop();
    const fileName = `${'00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */}/${id}/${Date.now()}-${i}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (uploadError) continue;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    const shouldBePrimary = isPrimary || (i === 0 && !uploaded.some((u) => u.is_primary));

    const { error: dbError } = await supabase.from('product_images').insert({
      product_id: id,
      image_url: publicUrl,
      is_primary: shouldBePrimary,
      order_index: i,
    });

    if (!dbError) {
      uploaded.push({ image_url: publicUrl, is_primary: shouldBePrimary });
    }
  }

  return NextResponse.json({
    success: true,
    images: uploaded,
    message: `${uploaded.length} of ${files.length} images uploaded`,
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const supabase = createAdminClient();

  const body = await request.json();
  const { image_id, is_primary, order_index } = body;

  if (is_primary) {
    await supabase.from('product_images').update({ is_primary: false }).eq('product_id', id);
  }

  const updates: Record<string, unknown> = {};
  if (is_primary !== undefined) updates.is_primary = is_primary;
  if (order_index !== undefined) updates.order_index = order_index;

  const { error } = await supabase.from('product_images').update(updates).eq('id', image_id).eq('product_id', id);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const supabase = createAdminClient();

  const body = await request.json();
  const { image_id } = body;

  const { data: img } = await supabase.from('product_images').select('image_url').eq('id', image_id).eq('product_id', id).single();
  if (!img) return NextResponse.json({ success: false, error: 'Image not found' }, { status: 404 });

  const filePath = img.image_url.split('/product-images/')[1];
  if (filePath) {
    await supabase.storage.from('product-images').remove([filePath]);
  }

  await supabase.from('product_images').delete().eq('id', image_id);

  return NextResponse.json({ success: true, message: 'Image deleted' });
}
