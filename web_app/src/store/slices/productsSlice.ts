import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Product, LoadingState } from '../../types'
import api from '../../services/api'

interface ProductsState extends LoadingState {
  products: Product[]
  saving: boolean
}

const initialState: ProductsState = {
  products: [],
  isLoading: false,
  error: null,
  saving: false,
}

export type ProductInput = {
  name: string
  price: number
  sku?: string | null
  currency?: string
  available?: boolean
  description?: string | null
  category?: string | null
  imageUrl?: string | null
  imageThumbUrl?: string | null
  priceListIds?: string[]
}

export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async (tenantId: string, { rejectWithValue }) => {
    const response = await api.getProducts(tenantId)
    if (response.error) return rejectWithValue(response.error)
    return response.data
  }
)

export const createProduct = createAsyncThunk(
  'products/create',
  async ({ tenantId, data }: { tenantId: string; data: ProductInput }, { rejectWithValue }) => {
    const response = await api.createProduct(tenantId, data)
    if (response.error || !response.data) return rejectWithValue(response.error || 'Error')
    return response.data
  }
)

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ productId, data }: { productId: string; data: Partial<ProductInput> }, { rejectWithValue }) => {
    const response = await api.updateProduct(productId, data)
    if (response.error || !response.data) return rejectWithValue(response.error || 'Error')
    return response.data
  }
)

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (productId: string, { rejectWithValue }) => {
    const response = await api.deleteProduct(productId)
    if (response.error) return rejectWithValue(response.error)
    return productId
  }
)

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = action.payload ?? []
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Error al cargar productos'
      })
      .addCase(createProduct.pending, (state) => { state.saving = true })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.saving = false
        state.products.push(action.payload)
      })
      .addCase(createProduct.rejected, (state) => { state.saving = false })
      .addCase(updateProduct.pending, (state) => { state.saving = true })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.saving = false
        const i = state.products.findIndex((p) => p.id === action.payload.id)
        if (i !== -1) state.products[i] = action.payload
      })
      .addCase(updateProduct.rejected, (state) => { state.saving = false })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p.id !== action.payload)
      })
  },
})

export default productsSlice.reducer

export const selectProducts = (state: { products: ProductsState }) => state.products.products
export const selectProductsLoading = (state: { products: ProductsState }) => state.products.isLoading
export const selectProductsSaving = (state: { products: ProductsState }) => state.products.saving
export const selectProductsError = (state: { products: ProductsState }) => state.products.error
