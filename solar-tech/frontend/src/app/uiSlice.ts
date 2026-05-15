import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  priceMode: 'ht' | 'ttc'
  sidebarOpen: boolean
  mobileFiltersOpen: boolean
}

const initialState: UiState = {
  priceMode: 'ttc',
  sidebarOpen: true,
  mobileFiltersOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    togglePriceMode(state) {
      state.priceMode = state.priceMode === 'ttc' ? 'ht' : 'ttc'
    },
    setPriceMode(state, action: PayloadAction<'ht' | 'ttc'>) {
      state.priceMode = action.payload
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    setMobileFiltersOpen(state, action: PayloadAction<boolean>) {
      state.mobileFiltersOpen = action.payload
    },
  },
})

export const { togglePriceMode, setPriceMode, toggleSidebar, setMobileFiltersOpen } = uiSlice.actions
export default uiSlice.reducer
