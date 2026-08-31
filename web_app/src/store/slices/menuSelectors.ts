import type { MenuState } from './menuSliceTypes'

export const selectLists = (state: { menu: MenuState }) => state.menu.lists
export const selectCurrentList = (state: { menu: MenuState }) =>
  state.menu.currentList
export const selectCurrentVersion = (state: { menu: MenuState }) =>
  state.menu.currentVersion
export const selectItems = (state: { menu: MenuState }) => state.menu.items
export const selectIsLoading = (state: { menu: MenuState }) =>
  state.menu.isLoading
export const selectError = (state: { menu: MenuState }) => state.menu.error
