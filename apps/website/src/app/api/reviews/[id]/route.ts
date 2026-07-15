import { NextResponse } from 'next/server';
import { createAdminClient } from '@agroconnect/shared';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  
  const supabase = createAdminClient();

  const body = await request.json();

  if (body.action === 'helpful') {
    await supabase.rpc('increment_review_helpful', { p_review_id: id });
    return NextResponse.json({ success: true });
  }

  const { data: review } = await supabase
    .from('reviews')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!review || review.user_id !== '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  const allowedFields = ['rating', 'title', 'comment', 'images'];
  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) updates[field] = body[field];
  }

  const { data: updated, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, review: updated });
}
