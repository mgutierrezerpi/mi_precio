import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  sidebarOpen: boolean
  mobileMenuOpen: boolean
  theme: 'light' | 'dark' | 'system'
  viewMode: 'grid' | 'list'
}

const initialState: UiState = {
  sidebarOpen: true,
  mobileMenuOpen: false,
  theme: 'system',
  viewMode: 'grid',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  setTheme,
  setViewMode,
} = uiSlice.actions

export default uiSlice.reducer

// Selectors
export const selectSidebarOpen = (state: { ui: UiState }) => state.ui.sidebarOpen
export const selectMobileMenuOpen = (state: { ui: UiState }) => state.ui.mobileMenuOpen
export const selectTheme = (state: { ui: UiState }) => state.ui.theme
export const selectViewMode = (state: { ui: UiState }) => state.ui.viewMode
