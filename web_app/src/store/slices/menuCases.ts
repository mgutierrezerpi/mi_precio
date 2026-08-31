import type { ActionReducerMapBuilder } from '@reduxjs/toolkit'
import type { MenuState } from './menuSliceTypes'
import { createList, deleteList, fetchList, fetchLists, updateList } from './menuListThunks'
import {
  createItem,
  deleteItem,
  fetchItems,
  fetchVersion,
  fetchVersions,
  updateItem,
  updateVersion,
} from './menuContentThunks'

export function addMenuCases(builder: ActionReducerMapBuilder<MenuState>) {
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
