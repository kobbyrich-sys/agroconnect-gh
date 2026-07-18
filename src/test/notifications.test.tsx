import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NotificationsContext, type NotificationsContextType } from '@/features/notifications/contexts/notification-context'
import { NotificationBell } from '@/features/notifications/components/notification-bell'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })) },
    channel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() })),
    removeChannel: vi.fn(),
  },
}))

function renderWithContext(overrides: Partial<NotificationsContextType> = {}) {
  const defaultCtx: NotificationsContextType = {
    notifications: [], unreadCount: 0, loading: false,
    markAsRead: vi.fn(), markAllAsRead: vi.fn(),
  }
  return render(
    <MemoryRouter>
      <NotificationsContext.Provider value={{ ...defaultCtx, ...overrides }}>
        <NotificationBell />
      </NotificationsContext.Provider>
    </MemoryRouter>
  )
}

describe('NotificationBell', () => {
  it('renders without crashing', () => {
    const { container } = renderWithContext()
    expect(container).toBeTruthy()
  })

  it('shows unread count badge when there are unread notifications', () => {
    renderWithContext({ unreadCount: 3 })
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('does not show badge when unread count is zero', () => {
    renderWithContext({ unreadCount: 0 })
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('shows 9+ for more than 9 unread', () => {
    renderWithContext({ unreadCount: 15 })
    expect(screen.getByText('9+')).toBeInTheDocument()
  })
})

describe('NotificationsContext defaults', () => {
  it('provides expected context shape', () => {
    expect(NotificationsContext).toBeDefined()
    expect(NotificationsContext.Provider).toBeDefined()
  })
})
