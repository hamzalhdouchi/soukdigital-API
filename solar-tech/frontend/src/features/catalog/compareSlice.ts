import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

const MAX_COMPARE = 4

interface CompareState {
  productIds: number[]
}

const initialState: CompareState = { productIds: [] }

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    addToCompare(state, action: PayloadAction<number>) {
      if (state.productIds.length >= MAX_COMPARE) return
      if (!state.productIds.includes(action.payload)) {
        state.productIds.push(action.payload)
      }
    },
    removeFromCompare(state, action: PayloadAction<number>) {
      state.productIds = state.productIds.filter((id) => id !== action.payload)
    },
    clearCompare(state) {
      state.productIds = []
    },
  },
})

export const { addToCompare, removeFromCompare, clearCompare } = compareSlice.actions
export default compareSlice.reducer
