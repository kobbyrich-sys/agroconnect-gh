import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CartProvider } from '@/features/cart/contexts/cart-provider'
import { CartContext } from '@/features/cart/contexts/cart-context'
import { useContext } from 'react'
import type { ReactNode } from 'react'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })) },
    channel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() })),
    removeChannel: vi.fn(),
  },
}))

function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('CartContext not found')
  return ctx
}

function renderCart() {
  return renderHook(() => useCart(), {
    wrapper: ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>,
  })
}

describe('Cart Flow', () => {
  it('starts with empty cart', () => {
    const { result } = renderCart()
    expect(result.current.items).toEqual([])
    expect(result.current.total).toBe(0)
    expect(result.current.count).toBe(0)
  })

  it('adds an item to the cart', () => {
    const { result } = renderCart()
    act(() => {
      result.current.addItem({
        productId: 'prod-1', sellerId: 'seller-1',
        name: 'Test Product', price: 100, unit: 'kg', quantity: 2, imageUrl: null,
      })
    })
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].name).toBe('Test Product')
    expect(result.current.total).toBe(200)
    expect(result.current.count).toBe(2)
  })

  it('updates quantity of an item', () => {
    const { result } = renderCart()
    act(() => {
      result.current.addItem({
        productId: 'prod-1', sellerId: 'seller-1',
        name: 'Test Product', price: 100, unit: 'kg', quantity: 1, imageUrl: null,
      })
    })
    act(() => {
      result.current.updateQuantity('prod-1', 5)
    })
    expect(result.current.items[0].quantity).toBe(5)
    expect(result.current.total).toBe(500)
    expect(result.current.count).toBe(5)
  })

  it('removes an item from the cart', () => {
    const { result } = renderCart()
    act(() => {
      result.current.addItem({
        productId: 'prod-1', sellerId: 'seller-1',
        name: 'Test Product', price: 100, unit: 'kg', quantity: 1, imageUrl: null,
      })
    })
    act(() => {
      result.current.removeItem('prod-1')
    })
    expect(result.current.items).toHaveLength(0)
    expect(result.current.total).toBe(0)
  })

  it('clears the cart', () => {
    const { result } = renderCart()
    act(() => {
      result.current.addItem({ productId: 'prod-1', sellerId: 'seller-1', name: 'A', price: 50, unit: 'kg', quantity: 2, imageUrl: null })
      result.current.addItem({ productId: 'prod-2', sellerId: 'seller-1', name: 'B', price: 30, unit: 'kg', quantity: 1, imageUrl: null })
    })
    expect(result.current.items).toHaveLength(2)
    act(() => { result.current.clearCart() })
    expect(result.current.items).toHaveLength(0)
    expect(result.current.total).toBe(0)
  })

  it('handles multiple items from the same seller', () => {
    const { result } = renderCart()
    act(() => {
      result.current.addItem({ productId: 'prod-1', sellerId: 'seller-1', name: 'Maize', price: 100, unit: 'kg', quantity: 3, imageUrl: null })
      result.current.addItem({ productId: 'prod-2', sellerId: 'seller-1', name: 'Rice', price: 200, unit: 'kg', quantity: 2, imageUrl: null })
    })
    expect(result.current.items).toHaveLength(2)
    expect(result.current.total).toBe(700)
    expect(result.current.count).toBe(5)
  })
})
