import {
  createSlice,
  createAsyncThunk,
  type ActionReducerMapBuilder,
} from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type {
  PriceList,
  PriceListVariantType,
  Item,
  ListVersion,
  LoadingState,
} from '../../types'
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

function addMenuCases(builder: ActionReducerMapBuilder<MenuState>) {
  addListCases(builder)
  addVersionCases(builder)
  addItemCases(builder)
}

function addListCases(builder: ActionReducerMapBuilder<MenuState>) {
  builder.addCase(fetchLists.pending, (state) => {
    state.isLoading = true
    state.error = null
  })
  builder.addCase(fetchLists.fulfilled, (state, action) => {
    state.isLoading = false
    state.lists = action.payload ?? []
  })
  builder.addCase(fetchLists.rejected, (state, action) => {
    state.isLoading = false
    state.error = (action.payload as string) || 'Error al cargar listas'
  })
  builder.addCase(fetchList.fulfilled, (state, action) => {
    state.currentList = action.payload ?? null
  })
  builder.addCase(createList.fulfilled, (state, action) => {
    if (action.payload) state.lists.push(action.payload)
  })
  builder.addCase(updateList.fulfilled, (state, action) => {
    if (!action.payload) return
    const index = state.lists.findIndex(
      (list) => list.id === action.payload!.id
    )
    if (index !== -1) state.lists[index] = action.payload
    if (state.currentList?.id === action.payload.id)
      state.currentList = action.payload
  })
  builder.addCase(deleteList.fulfilled, (state, action) => {
    state.lists = state.lists.filter((list) => list.id !== action.payload)
    if (state.currentList?.id === action.payload) state.currentList = null
  })
}

function addVersionCases(builder: ActionReducerMapBuilder<MenuState>) {
  builder.addCase(fetchVersions.fulfilled, (state, action) => {
    const versions = action.payload ?? []
    if (versions.length > 0) {
      state.currentVersion = versions[0]
      if (versions[0].items) state.items = versions[0].items
    }
  })
  builder.addCase(fetchVersion.fulfilled, (state, action) => {
    state.currentVersion = action.payload ?? null
    if (action.payload?.items) state.items = action.payload.items
  })
  builder.addCase(updateVersion.fulfilled, (state, action) => {
    if (action.payload && state.currentVersion?.id === action.payload.id)
      state.currentVersion = action.payload
  })
}

function addItemCases(builder: ActionReducerMapBuilder<MenuState>) {
  builder.addCase(fetchItems.pending, (state) => {
    state.isLoading = true
    state.error = null
  })
  builder.addCase(fetchItems.fulfilled, (state, action) => {
    state.isLoading = false
    state.items = action.payload ?? []
  })
  builder.addCase(fetchItems.rejected, (state, action) => {
    state.isLoading = false
    state.error = (action.payload as string) || 'Error al cargar ítems'
  })
  builder.addCase(createItem.fulfilled, (state, action) => {
    if (action.payload) state.items.push(action.payload)
  })
  builder.addCase(updateItem.fulfilled, (state, action) => {
    if (!action.payload) return
    const index = state.items.findIndex(
      (item) => item.id === action.payload!.id
    )
    if (index !== -1) state.items[index] = action.payload
  })
  builder.addCase(deleteItem.fulfilled, (state, action) => {
    state.items = state.items.filter((item) => item.id !== action.payload)
  })
}

export const { setCurrentList, setCurrentVersion, clearError } =
  menuSlice.actions
export default menuSlice.reducer

// Selectors
export const selectLists = (state: { menu: MenuState }) => state.menu.lists
export const selectCurrentList = (state: { menu: MenuState }) =>
  state.menu.currentList
export const selectCurrentVersion = (state: { menu: MenuState }) =>
  state.menu.currentVersion
export const selectItems = (state: { menu: MenuState }) => state.menu.items
export const selectIsLoading = (state: { menu: MenuState }) =>
  state.menu.isLoading
export const selectError = (state: { menu: MenuState }) => state.menu.error
