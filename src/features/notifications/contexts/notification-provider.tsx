import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { NotificationsContext } from './notification-context'
import type { Notification } from '@/types/database'

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(() => {
    if (!profile?.id) { setNotifications([]); setLoading(false); return }
    setLoading(true)
    ;(supabase.from('notifications') as any).select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(50).then((res: any) => {
      if (res.data) setNotifications(res.data)
      setLoading(false)
    })
  }, [profile?.id])

  useEffect(() => { fetch() }, [fetch])

  useEffect(() => {
    if (!profile?.id) return
    const channel = supabase.channel('notifications-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile.id}` }, (payload: any) => {
        setNotifications(prev => [payload.new as Notification, ...prev].slice(0, 50))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile.id}` }, (payload: any) => {
        setNotifications(prev => prev.map(n => n.id === payload.new.id ? { ...n, ...payload.new } : n))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [profile?.id])

  const markAsRead = useCallback((id: string) => {
    ;(supabase.from('notifications') as any).update({ read: true }).eq('id', id).then(() => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    })
  }, [])

  const markAllAsRead = useCallback(() => {
    if (!profile?.id) return
    ;(supabase.from('notifications') as any).update({ read: true }).eq('user_id', profile.id).eq('read', false).then(() => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    })
  }, [profile?.id])

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount: notifications.filter(n => !n.read).length, loading, markAsRead, markAllAsRead }}>
      {children}
    </NotificationsContext.Provider>
  )
}
