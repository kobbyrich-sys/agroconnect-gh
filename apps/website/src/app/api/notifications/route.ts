import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function GET(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const offset = (page - 1) * limit;
  const unreadOnly = searchParams.get('unread') === 'true';

  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (unreadOnly) query = query.eq('is_read', false);

  const { data: notifications, count, error } = await query.range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });

  return NextResponse.json({
    success: true,
    notifications: notifications || [],
    pagination: { page, limit, total: count || 0, total_pages: Math.ceil((count || 0) / limit) },
  });
}

export async function PUT() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
