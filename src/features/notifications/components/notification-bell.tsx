import { useContext, useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { NotificationsContext } from '../contexts/notification-context'

const TYPE_COLORS: Record<string, string> = {
  new_order: 'text-blue-600', order_confirmed: 'text-agro-600',
  order_shipped: 'text-purple-600', order_delivered: 'text-green-600',
  payment_confirmed: 'text-indigo-600', payment_released: 'text-green-600',
  new_review: 'text-yellow-600', message_received: 'text-agro-600',
  withdrawal_approved: 'text-blue-600', withdrawal_processed: 'text-green-600',
  withdrawal_rejected: 'text-red-600',
}

export function NotificationBell() {
  const ctx = useContext(NotificationsContext)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!ctx) return null

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-1 text-earth-600 hover:text-agro-700 transition-colors" aria-label="Notifications">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {ctx.unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">{ctx.unreadCount > 9 ? '9+' : ctx.unreadCount}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-earth-200 bg-white shadow-lg z-50">
          <div className="flex items-center justify-between border-b border-earth-100 px-4 py-2">
            <span className="text-sm font-medium text-earth-900">Notifications</span>
            {ctx.unreadCount > 0 && <button onClick={ctx.markAllAsRead} className="text-xs text-agro-600 hover:text-agro-700">Mark all read</button>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {ctx.loading ? (
              <div className="p-4 text-center text-sm text-earth-400">Loading...</div>
            ) : ctx.notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-earth-400">No notifications yet</div>
            ) : (
              ctx.notifications.slice(0, 20).map(n => (
                <div key={n.id} className={`flex gap-3 border-b border-earth-50 px-4 py-3 transition-colors hover:bg-earth-50 ${n.read ? '' : 'bg-agro-50/30'}`}>
                  <div className={`shrink-0 mt-0.5 ${TYPE_COLORS[n.type] || 'text-earth-500'}`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-earth-900">{n.title}</p>
                    <p className="text-xs text-earth-600 truncate">{n.body}</p>
                    <p className="text-[10px] text-earth-400 mt-0.5">{new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                  {!n.read && <button onClick={() => ctx.markAsRead(n.id)} className="shrink-0 text-[10px] text-agro-600 hover:text-agro-700">Read</button>}
                </div>
              ))
            )}
          </div>
          <Link to="/notifications" onClick={() => setOpen(false)} className="block border-t border-earth-100 px-4 py-2 text-center text-xs text-agro-600 hover:text-agro-700">View all</Link>
        </div>
      )}
    </div>
  )
}
