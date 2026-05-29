import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { PriceList, Item, ListVersion, LoadingState } from '../../types'
import api from '../../services/api'

interface MenuState extends LoadingState {
  lists: PriceList[]
  currentList: PriceList | null
  currentVersion: ListVersion | null
  items: Item[]
}

const initialState: MenuState = {
  lists: [],
  currentList: null,
  currentVersion: null,
  items: [],
  isLoading: false,
  error: null,
}

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
  async ({ tenantId, name }: { tenantId: string; name: string }, { rejectWithValue }) => {
    const response = await api.createList(tenantId, name)
    if (response.error) return rejectWithValue(response.error)
    return response.data
  }
)

export const updateList = createAsyncThunk(
  'menu/updateList',
  async ({ listId, data }: { listId: string; data: { name?: string; published?: boolean; showOnIndex?: boolean } }, { rejectWithValue }) => {
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
  async ({ versionId, data }: { versionId: string; data: { name?: string; published?: boolean } }, { rejectWithValue }) => {
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
  async ({ versionId, data }: { versionId: string; data: { name: string; price: number; description?: string; category?: string } }, { rejectWithValue }) => {
    const response = await api.createItem(versionId, data)
    if (response.error) return rejectWithValue(response.error)
    return response.data
  }
)

export const updateItem = createAsyncThunk(
  'menu/updateItem',
  async ({ itemId, data }: { itemId: string; data: { name?: string; price?: number; description?: string; category?: string } }, { rejectWithValue }) => {
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
  extraReducers: (builder) => {
    builder
      // fetchLists
      .addCase(fetchLists.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchLists.fulfilled, (state, action) => {
        state.isLoading = false
        state.lists = action.payload ?? []
      })
      .addCase(fetchLists.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Error al cargar listas'
      })
      // fetchList
      .addCase(fetchList.fulfilled, (state, action) => {
        state.currentList = action.payload ?? null
      })
      // createList
      .addCase(createList.fulfilled, (state, action) => {
        if (action.payload) state.lists.push(action.payload)
      })
      // updateList
      .addCase(updateList.fulfilled, (state, action) => {
        if (!action.payload) return
        const index = state.lists.findIndex(l => l.id === action.payload!.id)
        if (index !== -1) state.lists[index] = action.payload
        if (state.currentList?.id === action.payload.id) {
          state.currentList = action.payload
        }
      })
      // deleteList
      .addCase(deleteList.fulfilled, (state, action) => {
        state.lists = state.lists.filter(l => l.id !== action.payload)
        if (state.currentList?.id === action.payload) {
          state.currentList = null
        }
      })
      // fetchVersions
      .addCase(fetchVersions.fulfilled, (state, action) => {
        const versions = action.payload ?? []
        if (versions.length > 0) {
          state.currentVersion = versions[0]
          if (versions[0].items) {
            state.items = versions[0].items
          }
        }
      })
      // fetchVersion
      .addCase(fetchVersion.fulfilled, (state, action) => {
        state.currentVersion = action.payload ?? null
        if (action.payload?.items) {
          state.items = action.payload.items
        }
      })
      // updateVersion
      .addCase(updateVersion.fulfilled, (state, action) => {
        if (action.payload && state.currentVersion?.id === action.payload.id) {
          state.currentVersion = action.payload
        }
      })
      // fetchItems
      .addCase(fetchItems.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload ?? []
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Error al cargar ítems'
      })
      // createItem
      .addCase(createItem.fulfilled, (state, action) => {
        if (action.payload) state.items.push(action.payload)
      })
      // updateItem
      .addCase(updateItem.fulfilled, (state, action) => {
        if (!action.payload) return
        const index = state.items.findIndex(i => i.id === action.payload!.id)
        if (index !== -1) state.items[index] = action.payload
      })
      // deleteItem
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.id !== action.payload)
      })
  },
})

export const { setCurrentList, setCurrentVersion, clearError } = menuSlice.actions
export default menuSlice.reducer

// Selectors
export const selectLists = (state: { menu: MenuState }) => state.menu.lists
export const selectCurrentList = (state: { menu: MenuState }) => state.menu.currentList
export const selectCurrentVersion = (state: { menu: MenuState }) => state.menu.currentVersion
export const selectItems = (state: { menu: MenuState }) => state.menu.items
export const selectIsLoading = (state: { menu: MenuState }) => state.menu.isLoading
export const selectError = (state: { menu: MenuState }) => state.menu.error
