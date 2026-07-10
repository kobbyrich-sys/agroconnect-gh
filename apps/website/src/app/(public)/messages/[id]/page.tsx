'use client';

import Link from 'next/link';
import { use, useEffect, useRef, useState } from 'react';

export default function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchMessages(); }, [id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function fetchMessages() {
    const res = await fetch(`/api/chats/${id}/messages`);
    const data = await res.json();
    if (data.success) setMessages(data.messages);
    setLoading(false);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMsg.trim() || sending) return;
    setSending(true);
    const res = await fetch(`/api/chats/${id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMsg }),
    });
    const data = await res.json();
    if (data.success) {
      setMessages(prev => [...prev, data.message]);
      setNewMsg('');
    }
    setSending(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-4 py-4">
        <Link href="/messages" className="text-sm text-emerald-600 hover:underline">← Back</Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {loading ? (
            <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>
          ) : messages.length === 0 ? (
            <p className="py-12 text-center text-gray-500">No messages yet. Say hello!</p>
          ) : (
            messages.map((msg: any) => (
              <div key={msg.id} className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.is_mine ? 'bg-emerald-700 text-white' : 'bg-white text-gray-900 shadow-sm'
                }`}>
                  <p>{msg.content}</p>
                  <p className={`mt-1 text-right text-xs ${msg.is_mine ? 'text-emerald-200' : 'text-gray-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <form onSubmit={sendMessage} className="border-t border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-3xl gap-3">
          <input type="text" value={newMsg} onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <button type="submit" disabled={sending || !newMsg.trim()}
            className="rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
