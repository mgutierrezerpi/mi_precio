import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Versions
export const fetchVersions = createAsyncThunk(
  'menu/fetchVersions',
  async (listId: string, { rejectWithValue }) => {
    const response = await api.getVersions(listId)
    if (response.error) return rejectWithValue(response.error)
    return response.data
  }
)

export const fetchVersion = createAsyncThunk(
  'menu/fetchVersion',
  async (versionId: string, { rejectWithValue }) => {
    const response = await api.getVersion(versionId)
    if (response.error) return rejectWithValue(response.error)
    return response.data
  }
)

export const updateVersion = createAsyncThunk(
  'menu/updateVersion',
  async (
    {
      versionId,
      data,
    }: { versionId: string; data: { name?: string; published?: boolean } },
    { rejectWithValue }
  ) => {
    const response = await api.updateVersion(versionId, data)
    if (response.error) return rejectWithValue(response.error)
    return response.data
  }
)

// Items
export const fetchItems = createAsyncThunk(
  'menu/fetchItems',
  async (versionId: string, { rejectWithValue }) => {
    const response = await api.getItems(versionId)
    if (response.error) return rejectWithValue(response.error)
    return response.data
  }
)

export const createItem = createAsyncThunk(
  'menu/createItem',
  async (
    {
      versionId,
      data,
    }: {
      versionId: string
      data: {
        name: string
        price: number
        description?: string
        category?: string
        imageUrl?: string
        imageThumbUrl?: string
        productId?: string
      }
    },
    { rejectWithValue }
  ) => {
    const response = await api.createItem(versionId, data)
    if (response.error) return rejectWithValue(response.error)
    return response.data
  }
)

export const updateItem = createAsyncThunk(
  'menu/updateItem',
  async (
    {
      itemId,
      data,
    }: {
      itemId: string
      data: {
        name?: string
        price?: number
        description?: string
        category?: string
      }
    },
    { rejectWithValue }
  ) => {
    const response = await api.updateItem(itemId, data)
    if (response.error) return rejectWithValue(response.error)
    return response.data
  }
)

export const deleteItem = createAsyncThunk(
  'menu/deleteItem',
  async (itemId: string, { rejectWithValue }) => {
    const response = await api.deleteItem(itemId)
    if (response.error) return rejectWithValue(response.error)
    return itemId
  }
)
