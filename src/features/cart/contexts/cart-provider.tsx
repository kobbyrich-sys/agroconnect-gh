import { useReducer, useEffect, type ReactNode } from 'react'
import { CartContext, type CartItem } from './cart-context'

const STORAGE_KEY = 'agroconnect_cart'

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

type Action =
  | { type: 'ADD'; item: CartItem }
  | { type: 'UPDATE_QTY'; productId: string; quantity: number }
  | { type: 'REMOVE'; productId: string }
  | { type: 'CLEAR' }

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find(i => i.productId === action.item.productId)
      if (existing) {
        return state.map(i => i.productId === action.item.productId ? { ...i, quantity: i.quantity + action.item.quantity } : i)
      }
      return [...state, action.item]
    }
    case 'UPDATE_QTY':
      return state.map(i => i.productId === action.productId ? { ...i, quantity: action.quantity } : i).filter(i => i.quantity > 0)
    case 'REMOVE':
      return state.filter(i => i.productId !== action.productId)
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, [], () => loadCart())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const count = items.reduce((s, i) => s + i.quantity, 0)
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  const addItem = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    dispatch({ type: 'ADD', item: { ...item, quantity: item.quantity ?? 1 } })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QTY', productId, quantity })
  }

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE', productId })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR' })
  }

  return <CartContext.Provider value={{ items, count, total, addItem, updateQuantity, removeItem, clearCart }}>{children}</CartContext.Provider>
}
