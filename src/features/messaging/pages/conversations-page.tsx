import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Card } from '@/components/ui'

export function ConversationsPage() {
  const { profile } = useAuth()
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    setLoading(true)
    ;(supabase.from('conversations') as any)
      .select('*')
      .or(`buyer_id.eq.${profile.id},seller_id.eq.${profile.id}`)
      .order('updated_at', { ascending: false })
      .then((res: any) => {
        if (res.data) setConversations(res.data)
        setLoading(false)
      })
  }, [profile?.id])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-earth-900 mb-6">Messages</h1>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-earth-100" />)}</div>
      ) : conversations.length === 0 ? (
        <Card className="p-8 text-center"><p className="text-earth-500">No conversations yet.</p></Card>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv: any) => (
            <Link key={conv.id} to={`/messages/${conv.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-earth-900">
                    Conversation #{conv.id.slice(0, 8)}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
