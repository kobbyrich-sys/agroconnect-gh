import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Button, Card } from '@/components/ui'

export function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [messages, setMessages] = useState<any[]>([])
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    ;(supabase.from('messages') as any).select('*').eq('conversation_id', id).order('created_at', { ascending: true }).then((res: any) => {
      if (res.data) setMessages(res.data)
    })
  }, [id])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !user || !id) return
    setSending(true)
    ;(supabase.from('messages') as any).insert({
      conversation_id: id,
      sender_id: user.id,
      content: content.trim(),
    }).then((res: any) => {
      if (!res.error) {
        setMessages([...messages, res.data?.[0] || { content: content.trim(), sender_id: user.id, created_at: new Date().toISOString(), id: Date.now().toString() }])
        setContent('')
        ;(supabase.from('conversations') as any).update({ updated_at: new Date().toISOString() }).eq('id', id)
      }
      setSending(false)
    })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/messages" className="text-sm text-agro-600 hover:text-agro-700 mb-4 inline-block">&larr; Back to Messages</Link>
      <Card className="p-0 overflow-hidden">
        <div className="h-[400px] overflow-y-auto p-4 space-y-3">
          {messages.map((msg: any) => (
            <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${msg.sender_id === user?.id ? 'bg-agro-600 text-white' : 'bg-earth-100 text-earth-900'}`}>
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-agro-200' : 'text-earth-500'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-earth-200 p-4">
          <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type a message..." className="flex-1 rounded-lg border border-earth-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500" />
          <Button type="submit" size="sm" disabled={sending || !content.trim()}>Send</Button>
        </form>
      </Card>
    </div>
  )
}
