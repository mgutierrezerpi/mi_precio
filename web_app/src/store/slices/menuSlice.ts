import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ListVersion, PriceList } from '../../types'
import { addMenuCases } from './menuCases'
import { initialState } from './menuSliceTypes'

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setCurrentList: (state, action: PayloadAction<PriceList | null>) => {
      state.currentList = action.payload
    },
    setCurrentVersion: (state, action: PayloadAction<ListVersion | null>) => {
      state.currentVersion = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => addMenuCases(builder),
})

export const { setCurrentList, setCurrentVersion, clearError } = menuSlice.actions
export default menuSlice.reducer
export * from './menuContentThunks'
export * from './menuListThunks'
export * from './menuSelectors'
