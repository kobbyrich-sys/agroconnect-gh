import { createContext } from 'react'
import type { Notification } from '@/types/database'

export type NotificationsContextType = {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

export const NotificationsContext = createContext<NotificationsContextType | null>(null)
