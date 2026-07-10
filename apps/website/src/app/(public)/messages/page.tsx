import { createServerClient } from '@agroconnect/shared';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function MessagesPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: chats } = await supabase
    .from('chats')
    .select(`
      id, last_message, last_message_at, is_blocked,
      participant_1_id, participant_2_id,
      p1:profiles!participant_1_id(full_name, avatar_url),
      p2:profiles!participant_2_id(full_name, avatar_url)
    `)
    .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false });

  const mapped = chats?.map((chat: any) => {
    const other = chat.participant_1_id === user.id ? chat.p2 : chat.p1;
    return { id: chat.id, other, last_message: chat.last_message, last_message_at: chat.last_message_at, is_blocked: chat.is_blocked };
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>

        {mapped.length === 0 ? (
          <div className="mt-12 rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-lg text-gray-500">No conversations yet</p>
            <Link href="/marketplace" className="mt-4 inline-block text-emerald-600 hover:underline">Browse Products</Link>
          </div>
        ) : (
          <div className="mt-6 space-y-2">
            {mapped.map((chat: any) => (
              <Link key={chat.id} href={`/messages/${chat.id}`} className="block rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
                    {chat.other?.full_name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{chat.other?.full_name || 'User'}</p>
                    <p className="truncate text-sm text-gray-500">{chat.last_message || 'No messages yet'}</p>
                  </div>
                  {chat.last_message_at && (
                    <span className="text-xs text-gray-400">{new Date(chat.last_message_at).toLocaleDateString()}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
