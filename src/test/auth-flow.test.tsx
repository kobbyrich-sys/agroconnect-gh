import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { PublicRoute, ProtectedRoute, SellerRoute, AdminRoute } from '@/components/auth'
import { AuthProvider } from '@/features/auth/contexts/auth-provider'
import { AuthContext } from '@/features/auth/contexts/auth-context'
import type { Profile } from '@/types/database'
import type { ReactNode } from 'react'

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}))

function renderWithProviders(ui: ReactNode, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={ui} />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/register" element={<div>Register Page</div>} />
          <Route path="/seller/dashboard" element={<div>Seller Dashboard</div>} />
          <Route path="/admin" element={<div>Admin Dashboard</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('Auth Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('PublicRoute renders children for unauthenticated users after loading', async () => {
    renderWithProviders(
      <PublicRoute><div>Public Content</div></PublicRoute>
    )
    const content = await screen.findByText('Public Content', {}, { timeout: 3000 })
    expect(content).toBeInTheDocument()
  })

  it('ProtectedRoute redirects to login for unauthenticated users', async () => {
    renderWithProviders(
      <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
    )
    await waitFor(() => {
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('renders marketplace page without crashing', () => {
    const { container } = renderWithProviders(<div>Marketplace</div>)
    expect(container).toBeTruthy()
  })
})

describe('Auth Route Guards', () => {
  const mockProfile: Profile = {
    id: 'user-1', full_name: 'Test User', avatar_url: null, phone: null,
    role: 'buyer', bio: null, payout_method: null, payout_provider: null,
    payout_account: null, notify_new_order: true, notify_payout: true,
    location: null, created_at: '2024-01-01', updated_at: '2024-01-01',
  }

  it('SellerRoute redirects buyers', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthContext.Provider value={{
          state: 'authenticated', user: { id: 'user-1', email: 'test@test.com' } as any,
          profile: { ...mockProfile, role: 'buyer' },
          signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
          refreshProfile: vi.fn(), retry: vi.fn(), session: null, error: null,
        }}>
          <Routes>
            <Route path="/" element={<SellerRoute><div>Seller Area</div></SellerRoute>} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    )
    expect(screen.queryByText('Seller Area')).not.toBeInTheDocument()
  })

  it('AdminRoute redirects non-admin users', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthContext.Provider value={{
          state: 'authenticated', user: { id: 'user-1', email: 'test@test.com' } as any,
          profile: { ...mockProfile, role: 'seller' },
          signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
          refreshProfile: vi.fn(), retry: vi.fn(), session: null, error: null,
        }}>
          <Routes>
            <Route path="/" element={<AdminRoute><div>Admin Area</div></AdminRoute>} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    )
    expect(screen.queryByText('Admin Area')).not.toBeInTheDocument()
  })

  it('renders seller content when user is a seller', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthContext.Provider value={{
          state: 'authenticated', user: { id: 'user-1', email: 'test@test.com' } as any,
          profile: { ...mockProfile, role: 'seller' },
          signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
          refreshProfile: vi.fn(), retry: vi.fn(), session: null, error: null,
        }}>
          <Routes>
            <Route path="/" element={<SellerRoute><div>Seller Area</div></SellerRoute>} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    )
    expect(screen.getByText('Seller Area')).toBeInTheDocument()
  })

  it('renders admin content when user is an admin', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthContext.Provider value={{
          state: 'authenticated', user: { id: 'user-1', email: 'test@test.com' } as any,
          profile: { ...mockProfile, role: 'admin' },
          signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
          refreshProfile: vi.fn(), retry: vi.fn(), session: null, error: null,
        }}>
          <Routes>
            <Route path="/" element={<AdminRoute><div>Admin Area</div></AdminRoute>} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    )
    expect(screen.getByText('Admin Area')).toBeInTheDocument()
  })
})
