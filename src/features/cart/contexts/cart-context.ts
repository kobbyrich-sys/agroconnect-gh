import { createContext } from 'react'

export interface CartItem {
  productId: string
  name: string
  price: number
  unit: string
  quantity: number
  sellerId: string
  imageUrl?: string | null
}

export interface CartContextType {
  items: CartItem[]
  count: number
  total: number
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
}

export const CartContext = createContext<CartContextType | undefined>(undefined)
