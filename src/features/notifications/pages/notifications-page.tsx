import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { NotificationsContext } from '../contexts/notification-context'
import { SeoHelmet } from '@/components/seo/helmet'

const TYPE_COLORS: Record<string, string> = {
  new_order: 'text-blue-600 bg-blue-50', order_confirmed: 'text-agro-600 bg-agro-50',
  order_shipped: 'text-purple-600 bg-purple-50', order_delivered: 'text-green-600 bg-green-50',
  payment_confirmed: 'text-indigo-600 bg-indigo-50', payment_released: 'text-green-600 bg-green-50',
  new_review: 'text-yellow-600 bg-yellow-50', message_received: 'text-agro-600 bg-agro-50',
  withdrawal_approved: 'text-blue-600 bg-blue-50', withdrawal_processed: 'text-green-600 bg-green-50',
  withdrawal_rejected: 'text-red-600 bg-red-50',
}

export function NotificationsPage() {
  const ctx = useContext(NotificationsContext)

  if (!ctx) return null

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <SeoHelmet title="Notifications" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-earth-900">Notifications</h1>
        {ctx.unreadCount > 0 && <button onClick={ctx.markAllAsRead} className="text-sm text-agro-600 hover:text-agro-700">Mark all as read</button>}
      </div>
      {ctx.notifications.length === 0 ? (
        <div className="rounded-lg border border-earth-200 p-8 text-center text-earth-500">
          <p className="text-4xl mb-2">🔔</p>
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ctx.notifications.map(n => (
            <div key={n.id} className={`flex items-start gap-3 rounded-lg border border-earth-100 p-4 transition-colors ${n.read ? 'bg-white' : 'bg-agro-50/30 border-agro-200'}`}>
              <div className={`shrink-0 rounded-full p-1.5 ${TYPE_COLORS[n.type] || 'text-earth-500 bg-earth-50'}`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-earth-900">{n.title}</p>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-agro-500 shrink-0" />}
                </div>
                <p className="text-sm text-earth-600">{n.body}</p>
                <p className="text-xs text-earth-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {n.reference_id && n.reference_type === 'order' && (
                <Link to={`/orders/${n.reference_id}`} className="shrink-0 text-xs text-agro-600 hover:text-agro-700 mt-1">View Order</Link>
              )}
              {n.reference_id && n.reference_type === 'conversation' && (
                <Link to={`/messages/${n.reference_id}`} className="shrink-0 text-xs text-agro-600 hover:text-agro-700 mt-1">View Message</Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
