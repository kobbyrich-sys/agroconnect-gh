import { NextResponse } from 'next/server';
import { createAdminClient, getAuthUser } from '@agroconnect/shared';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();

  const { data: chats, error } = await supabase
    .from('chats')
    .select(`
      id, order_id, last_message, last_message_at, is_blocked, created_at,
      participant_1_id, participant_2_id,
      p1:profiles!participant_1_id(full_name, avatar_url, role),
      p2:profiles!participant_2_id(full_name, avatar_url, role)
    `)
    .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });

  const mapped = chats?.map((chat: any) => {
    const other = chat.participant_1_id === user.id ? chat.p2 : chat.p1;
    const unread = chat.participant_1_id === user.id ? chat.unread_count_1 : chat.unread_count_2;
    return {
      id: chat.id,
      order_id: chat.order_id,
      other_user: other,
      last_message: chat.last_message,
      last_message_at: chat.last_message_at,
      unread_count: unread || 0,
      is_blocked: chat.is_blocked,
      created_at: chat.created_at,
    };
  });

  return NextResponse.json({ success: true, chats: mapped || [] });
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();

  const { participant_id, order_id, content } = await request.json();
  if (!participant_id || !content) {
    return NextResponse.json({ success: false, error: 'Participant and message required' }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('chats')
    .select('id')
    .or(`and(participant_1_id.eq.${user.id},participant_2_id.eq.${participant_id}),and(participant_1_id.eq.${participant_id},participant_2_id.eq.${user.id})`)
    .maybeSingle();

  let chatId: string;
  if (existing) {
    chatId = existing.id;
  } else {
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert({ participant_1_id: user.id, participant_2_id: participant_id, order_id: order_id || null })
      .select('id')
      .single();
    if (chatError) return NextResponse.json({ success: false, error: chatError.message }, { status: 400 });
    chatId = chat.id;
  }

  const { error: msgError } = await supabase.from('messages').insert({
    chat_id: chatId, sender_id: user.id, content,
  });

  if (msgError) return NextResponse.json({ success: false, error: msgError.message }, { status: 400 });

  await supabase
    .from('chats')
    .update({ last_message: content, last_message_at: new Date().toISOString() })
    .eq('id', chatId);

  return NextResponse.json({ success: true, chat_id: chatId }, { status: 201 });
}
