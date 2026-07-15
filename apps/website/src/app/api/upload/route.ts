import { NextResponse } from 'next/server';
import { createAdminClient } from '@agroconnect/shared';

export async function POST(request: Request) {
  
  const supabase = createAdminClient();

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const bucket = (formData.get('bucket') as string) || 'product-images';

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
  }

  const allowedBuckets = ['product-images', 'product-videos', 'avatars', 'business-logos', 'verification-docs', 'chat-images', 'review-images'];
  if (!allowedBuckets.includes(bucket)) {
    return NextResponse.json({ success: false, error: 'Invalid bucket' }, { status: 400 });
  }

  const maxSize = bucket === 'product-videos' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json({ success: false, error: `File too large. Max ${maxSize / 1024 / 1024}MB` }, { status: 400 });
  }

  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const allowedVideoTypes = ['video/mp4', 'video/quicktime'];
  if (bucket === 'product-videos') {
    if (!allowedVideoTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid video format. Use MP4 or MOV.' }, { status: 400 });
    }
  } else if (!allowedImageTypes.includes(file.type)) {
    return NextResponse.json({ success: false, error: 'Invalid image format. Use JPEG, PNG, WebP, or GIF.' }, { status: 400 });
  }

  const ext = file.name.split('.').pop();
  const fileName = `${'00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ success: false, error: uploadError.message }, { status: 400 });
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);

  return NextResponse.json({
    success: true,
    url: publicUrl,
    path: fileName,
    bucket,
  });
}
