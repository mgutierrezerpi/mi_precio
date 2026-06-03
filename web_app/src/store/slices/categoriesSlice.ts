import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Category, LoadingState } from '../../types'
import api from '../../services/api'

interface CategoriesState extends LoadingState {
  categories: Category[]
  saving: boolean
}

const initialState: CategoriesState = {
  categories: [],
  isLoading: false,
  error: null,
  saving: false,
}

export type CategoryInput = {
  name: string
  description?: string | null
  color?: string | null
}

export const fetchCategories = createAsyncThunk(
  'categories/fetch',
  async (tenantId: string, { rejectWithValue }) => {
    const response = await api.getCategories(tenantId)
    if (response.error) return rejectWithValue(response.error)
    return response.data
  }
)

export const createCategory = createAsyncThunk(
  'categories/create',
  async ({ tenantId, data }: { tenantId: string; data: CategoryInput }, { rejectWithValue }) => {
    const response = await api.createCategory(tenantId, data)
    if (response.error || !response.data) return rejectWithValue(response.error || 'Error')
    return response.data
  }
)

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ categoryId, data }: { categoryId: string; data: Partial<CategoryInput> }, { rejectWithValue }) => {
    const response = await api.updateCategory(categoryId, data)
    if (response.error || !response.data) return rejectWithValue(response.error || 'Error')
    return response.data
  }
)

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (categoryId: string, { rejectWithValue }) => {
    const response = await api.deleteCategory(categoryId)
    if (response.error) return rejectWithValue(response.error)
    return categoryId
  }
)

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false
        state.categories = action.payload ?? []
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Error al cargar categorías'
      })
      .addCase(createCategory.pending, (state) => { state.saving = true })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.saving = false
        state.categories.push(action.payload)
      })
      .addCase(createCategory.rejected, (state) => { state.saving = false })
      .addCase(updateCategory.pending, (state) => { state.saving = true })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.saving = false
        const i = state.categories.findIndex((c) => c.id === action.payload.id)
        if (i !== -1) state.categories[i] = action.payload
      })
      .addCase(updateCategory.rejected, (state) => { state.saving = false })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((c) => c.id !== action.payload)
      })
  },
})

export default categoriesSlice.reducer

export const selectCategories = (state: { categories: CategoriesState }) => state.categories.categories
export const selectCategoriesLoading = (state: { categories: CategoriesState }) => state.categories.isLoading
export const selectCategoriesSaving = (state: { categories: CategoriesState }) => state.categories.saving
