import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlice'
import cartReducer from '@/features/cart/cartSlice'
import compareReducer from '@/features/catalog/compareSlice'
import uiReducer from '@/app/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    compare: compareReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
