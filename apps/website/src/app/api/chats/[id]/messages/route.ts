import { NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@agroconnect/shared';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();

  const { data: messages, error } = await supabase
    .from('messages')
    .select('id, sender_id, content, image_url, is_read, read_at, created_at')
    .eq('chat_id', id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });

  await supabase
    .from('messages')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('chat_id', id)
    .neq('sender_id', user.id)
    .eq('is_read', false);

  return NextResponse.json({ success: true, messages: messages || [] });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();

  const { content } = await request.json();
  if (!content) return NextResponse.json({ success: false, error: 'Content required' }, { status: 400 });

  const { data: message, error } = await supabase
    .from('messages')
    .insert({ chat_id: id, sender_id: user.id, content })
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });

  await supabase
    .from('chats')
    .update({ last_message: content, last_message_at: new Date().toISOString() })
    .eq('id', id);

  return NextResponse.json({ success: true, message }, { status: 201 });
}
