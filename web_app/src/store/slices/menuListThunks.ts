import { createAsyncThunk } from '@reduxjs/toolkit'
import type { PriceListVariantType } from '../../types'
import api from '../../services/api'

// Lists
export const fetchLists = createAsyncThunk(
  'menu/fetchLists',
  async (tenantId: string, { rejectWithValue }) => {
    const response = await api.getLists(tenantId)
    if (response.error) return rejectWithValue(response.error)
    return response.data
  }
)

export const fetchList = createAsyncThunk(
  'menu/fetchList',
  async (listId: string, { rejectWithValue }) => {
    const response = await api.getList(listId)
    if (response.error) return rejectWithValue(response.error)
    return response.data
  }
)

export const createList = createAsyncThunk(
  'menu/createList',
  async (
    {
      tenantId,
      name,
      kind,
      variant,
    }: {
      tenantId: string
      name: string
      kind?: 'product' | 'service'
      variant?: {
        parentListId: string
        variantType: PriceListVariantType
        customerId?: string
        startsAt?: string
        endsAt?: string
      }
    },
    { rejectWithValue }
  ) => {
    const response = await api.createList(tenantId, name, kind, variant)
    if (response.error) return rejectWithValue(response.error)
    return response.data
  }
)

export const updateList = createAsyncThunk(
  'menu/updateList',
  async (
    {
      listId,
      data,
    }: { listId: string; data: Parameters<typeof api.updateList>[1] },
    { rejectWithValue }
  ) => {
    const response = await api.updateList(listId, data)
    if (response.error) return rejectWithValue(response.error)
    return response.data
  }
)

export const deleteList = createAsyncThunk(
  'menu/deleteList',
  async (listId: string, { rejectWithValue }) => {
    const response = await api.deleteList(listId)
    if (response.error) return rejectWithValue(response.error)
    return listId
  }
)
