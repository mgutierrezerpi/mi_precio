import { describe, it, expect } from 'vitest'
import menuReducer, {
  setCurrentList,
  clearError,
} from './menuSlice'
import type { PriceList } from '../../types'

describe('menuSlice', () => {
  const initialState = {
    lists: [],
    currentList: null,
    currentVersion: null,
    items: [],
    isLoading: false,
    error: null,
  }

  it('should return the initial state', () => {
    expect(menuReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should handle setCurrentList', () => {
    const list: PriceList = {
      id: '1',
      tenantId: '1',
      name: 'Test List',
      slug: 'test_list',
      published: true,
      showOnIndex: true,
      itemCount: 0,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    }
    const actual = menuReducer(initialState, setCurrentList(list))
    expect(actual.currentList).toEqual(list)
  })

  it('should handle clearError', () => {
    const stateWithError = { ...initialState, error: 'Some error' }
    const actual = menuReducer(stateWithError, clearError())
    expect(actual.error).toBeNull()
  })
})
