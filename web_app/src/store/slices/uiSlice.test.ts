import { describe, it, expect } from 'vitest'
import uiReducer, {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setTheme,
  setViewMode,
  setDensity,
} from './uiSlice'

describe('uiSlice', () => {
  const initialState = {
    sidebarOpen: true,
    mobileMenuOpen: false,
    theme: 'system' as const,
    viewMode: 'grid' as const,
    density: 'full' as const,
  }

  it('should return the initial state', () => {
    expect(uiReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should handle toggleSidebar', () => {
    const actual = uiReducer(initialState, toggleSidebar())
    expect(actual.sidebarOpen).toBe(false)

    const toggled = uiReducer(actual, toggleSidebar())
    expect(toggled.sidebarOpen).toBe(true)
  })

  it('should handle setSidebarOpen', () => {
    const actual = uiReducer(initialState, setSidebarOpen(false))
    expect(actual.sidebarOpen).toBe(false)
  })

  it('should handle toggleMobileMenu', () => {
    const actual = uiReducer(initialState, toggleMobileMenu())
    expect(actual.mobileMenuOpen).toBe(true)
  })

  it('should handle setTheme', () => {
    const actual = uiReducer(initialState, setTheme('dark'))
    expect(actual.theme).toBe('dark')
  })

  it('should handle setViewMode', () => {
    const actual = uiReducer(initialState, setViewMode('list'))
    expect(actual.viewMode).toBe('list')
  })

  it('should handle setDensity', () => {
    const actual = uiReducer(initialState, setDensity('compact'))
    expect(actual.density).toBe('compact')
  })
})
