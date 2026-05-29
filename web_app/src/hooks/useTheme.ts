import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { selectTheme, setTheme } from '../store/slices/uiSlice'

export function useTheme() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector(selectTheme)

  useEffect(() => {
    // Apply theme to document
    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.setAttribute('data-theme', systemDark ? 'dark' : 'light')
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    dispatch(setTheme(newTheme))
  }

  const isDark = theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return { theme, toggleTheme, isDark }
}
