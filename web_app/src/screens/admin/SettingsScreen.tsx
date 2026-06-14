import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../../components/ThemeToggle'
import { useTheme } from '../../hooks/useTheme'
import { useAppDispatch } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'
import { SettingsCrmContent } from './SettingsCrmScreen'

export function SettingsScreen() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useTheme()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await dispatch(logout())
    navigate('/')
  }

  return (
    <div className="w-full pb-20">
      <div className="mb-10 flex items-center justify-between">
        <Link
          to="/admin"
          className="text-sm text-[var(--dash-muted)] transition-all hover:-translate-x-1 hover:text-[var(--dash-text)]"
        >
          ← Inicio
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-sm text-[var(--dash-muted)] transition-colors hover:text-[var(--dash-text)] disabled:opacity-50"
          >
            {isLoggingOut ? 'Saliendo...' : 'Salir'}
          </button>
        </div>
      </div>

      <SettingsCrmContent simple />
    </div>
  )
}

export default SettingsScreen
