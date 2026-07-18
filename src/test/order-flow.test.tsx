import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '@/features/auth/contexts/auth-context'
import { OrdersPage } from '@/features/orders/pages/orders-page'
import { OrderDetailPage } from '@/features/orders/pages/order-detail-page'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(),
    channel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() })),
    removeChannel: vi.fn(),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}))

function chainResolve(data: any) {
  const chain: any = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(),
  }
  chain.single.mockResolvedValue({ data, error: null })
  chain.then = (cb: any) => Promise.resolve({ data, error: null }).then(cb)
  return chain
}

const mockOrders = [
  {
    id: 'order-001-abcdefgh', buyer_id: 'user-1', seller_id: 'seller-1', status: 'pending', total: 250,
    currency: 'GHS', notes: null, payment_status: 'pending', payment_method: null, payment_reference: null,
    paid_at: null, escrow_held_at: null, escrow_released_at: null, delivered_at: null, platform_fee: null,
    platform_fee_rate: null, created_at: '2024-06-01T10:00:00Z', updated_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'order-002-ijklmnop', buyer_id: 'user-1', seller_id: 'seller-2', status: 'delivered', total: 500,
    currency: 'GHS', notes: 'Leave at door', payment_status: 'escrow_released', payment_method: 'mobile_money',
    payment_reference: 'REF-123', paid_at: '2024-06-02T12:00:00Z', escrow_held_at: '2024-06-02T12:00:00Z',
    escrow_released_at: '2024-06-05T12:00:00Z', delivered_at: '2024-06-04T12:00:00Z', platform_fee: 25,
    platform_fee_rate: 5, created_at: '2024-06-01T08:00:00Z', updated_at: '2024-06-05T12:00:00Z',
  },
]

const mockOrderItems = [
  {
    id: 'item-1', order_id: 'order-001-abcdefgh', product_id: 'prod-1', quantity: 5, unit_price: 50, total: 250,
    created_at: '2024-06-01T10:00:00Z', products: { name: 'Fresh Tomatoes' },
  },
]

const mockProfile: Profile = {
  id: 'user-1', full_name: 'Test Buyer', avatar_url: null, phone: null, role: 'buyer',
  bio: null, payout_method: null, payout_provider: null, payout_account: null,
  notify_new_order: true, notify_payout: true, location: null, created_at: '2024-01-01', updated_at: '2024-01-01',
}

function renderWithAuth(ui: React.ReactNode, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthContext.Provider value={{
        state: 'authenticated', user: { id: 'user-1', email: 'test@test.com' } as any,
        profile: mockProfile, signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
        refreshProfile: vi.fn(), retry: vi.fn(), session: null, error: null,
      }}>
        <Routes>
          <Route path="/orders" element={ui} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  )
}

describe('Order Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders orders page with order list', async () => {
    vi.mocked(supabase.from).mockReturnValue(chainResolve(mockOrders))
    renderWithAuth(<OrdersPage />, { route: '/orders' })
    const items = await screen.findAllByText(/Order #order-00/)
    expect(items.length).toBe(2)
  })

  it('displays status badges for orders', async () => {
    vi.mocked(supabase.from).mockReturnValue(chainResolve(mockOrders))
    renderWithAuth(<OrdersPage />, { route: '/orders' })
    await waitFor(() => {
      const pendingBadges = screen.getAllByText('pending')
      expect(pendingBadges.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows empty state when no orders', async () => {
    vi.mocked(supabase.from).mockReturnValue(chainResolve([]))
    renderWithAuth(<OrdersPage />, { route: '/orders' })
    await waitFor(() => {
      expect(screen.getByText(/No buying orders yet/)).toBeInTheDocument()
    })
  })

  it('renders order detail with items', async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'order_items') return chainResolve(mockOrderItems)
      return chainResolve(mockOrders[0])
    })
    renderWithAuth(<OrderDetailPage />, { route: '/orders/order-001-abcdefgh' })
    expect(await screen.findByText('Fresh Tomatoes')).toBeInTheDocument()
  })

  it('shows payment details section on detail page', async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'order_items') return chainResolve([])
      return chainResolve(mockOrders[0])
    })
    renderWithAuth(<OrderDetailPage />, { route: '/orders/order-001-abcdefgh' })
    expect(await screen.findByText('Payment Details')).toBeInTheDocument()
  })
})
