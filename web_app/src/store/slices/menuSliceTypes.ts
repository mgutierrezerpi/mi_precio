import type { Item, ListVersion, LoadingState, PriceList } from '../../types'

export interface MenuState extends LoadingState {
  lists: PriceList[]
  currentList: PriceList | null
  currentVersion: ListVersion | null
  items: Item[]
}

export const initialState: MenuState = {
  lists: [],
  currentList: null,
  currentVersion: null,
  items: [],
  isLoading: false,
  error: null,
}
