import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Layout density of the admin screens. 'full' is the original spacious design.
export type Density = 'full' | 'compact'
const DENSITY_KEY = 'ui_density'
const loadDensity = (): Density => (localStorage.getItem(DENSITY_KEY) === 'compact' ? 'compact' : 'full')

interface UiState {
  sidebarOpen: boolean
  mobileMenuOpen: boolean
  theme: 'light' | 'dark' | 'system'
  viewMode: 'grid' | 'list'
  density: Density
}

const initialState: UiState = {
  sidebarOpen: true,
  mobileMenuOpen: false,
  theme: 'system',
  viewMode: 'grid',
  density: loadDensity(),
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
    setDensity: (state, action: PayloadAction<Density>) => {
      state.density = action.payload
      localStorage.setItem(DENSITY_KEY, action.payload)
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
  setDensity,
} = uiSlice.actions

export default uiSlice.reducer

// Selectors
export const selectSidebarOpen = (state: { ui: UiState }) => state.ui.sidebarOpen
export const selectMobileMenuOpen = (state: { ui: UiState }) => state.ui.mobileMenuOpen
export const selectTheme = (state: { ui: UiState }) => state.ui.theme
export const selectViewMode = (state: { ui: UiState }) => state.ui.viewMode
export const selectDensity = (state: { ui: UiState }) => state.ui.density
