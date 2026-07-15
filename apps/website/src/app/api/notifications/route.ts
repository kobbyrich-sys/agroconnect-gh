import { NextResponse } from 'next/server';
import { createAdminClient } from '@agroconnect/shared';

export async function GET(request: Request) {
  
  const supabase = createAdminClient();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const offset = (page - 1) * limit;
  const unreadOnly = searchParams.get('unread') === 'true';

  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */)
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
  
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', '00000000-0000-0000-0000-000000000000' /* TODO: replace with real user ID */)
    .eq('is_read', false);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
