import { configureStore } from '@reduxjs/toolkit'
import menuReducer from './slices/menuSlice'
import uiReducer from './slices/uiSlice'
import authReducer from './slices/authSlice'
import productsReducer from './slices/productsSlice'
import categoriesReducer from './slices/categoriesSlice'
import planReducer from './slices/planSlice'

export const store = configureStore({
  reducer: {
    menu: menuReducer,
    ui: uiReducer,
    auth: authReducer,
    products: productsReducer,
    categories: categoriesReducer,
    plan: planReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
