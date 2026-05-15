import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CartItem } from '@/types'

interface CartState {
  items: CartItem[]
}

const initialState: CartState = {
  items: JSON.parse(localStorage.getItem('cart') ?? '[]'),
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find((i) => i.variantId === action.payload.variantId)
      if (existing) {
        existing.quantity += action.payload.quantity
      } else {
        state.items.push(action.payload)
      }
      localStorage.setItem('cart', JSON.stringify(state.items))
    },
    removeItem(state, action: PayloadAction<number>) {
      state.items = state.items.filter((i) => i.variantId !== action.payload)
      localStorage.setItem('cart', JSON.stringify(state.items))
    },
    updateQuantity(state, action: PayloadAction<{ variantId: number; quantity: number }>) {
      const item = state.items.find((i) => i.variantId === action.payload.variantId)
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity)
        localStorage.setItem('cart', JSON.stringify(state.items))
      }
    },
    clearCart(state) {
      state.items = []
      localStorage.removeItem('cart')
    },
  },
})

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer
