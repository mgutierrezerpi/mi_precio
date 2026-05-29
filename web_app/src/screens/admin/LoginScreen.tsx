import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  sendCode,
  verifyCode,
  selectAuthLoading,
  selectAuthError,
  selectCodeSent,
  selectPendingEmail,
  selectIsAuthenticated,
  clearAuthError,
  resetCodeFlow,
} from '../../store/slices/authSlice'
import { ThemeToggle } from '../../components/ThemeToggle'
import { useTheme } from '../../hooks/useTheme'

export function LoginScreen() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isLoading = useAppSelector(selectAuthLoading)
  const error = useAppSelector(selectAuthError)
  const codeSent = useAppSelector(selectCodeSent)
  const pendingEmail = useAppSelector(selectPendingEmail)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  useTheme()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearAuthError())
    dispatch(sendCode({ email }))
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearAuthError())

    const result = await dispatch(verifyCode({ email: pendingEmail!, code }))
    if (verifyCode.fulfilled.match(result)) {
      navigate('/admin')
    }
  }

  const handleChangeEmail = () => {
    dispatch(resetCodeFlow())
    setCode('')
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center px-6 transition-colors font-sans">
      {/* Top bar */}
      <div className="absolute top-0 right-0 p-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <span className="text-3xl text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors font-serif">
              Mi Precio
            </span>
          </Link>
          <p className="mt-3 text-[var(--color-text-muted)] text-sm">
            {codeSent
              ? 'Ingresa el código que enviamos a tu email'
              : 'Accede al panel de administración'}
          </p>
        </div>

        {!codeSent ? (
          /* Step 1: Email input */
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm text-[var(--color-text-secondary)] mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-800/50 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[var(--color-accent)] text-[var(--color-bg-primary)] font-medium tracking-wide hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Enviando...' : 'Enviar código'}
            </button>
          </form>
        ) : (
          /* Step 2: Code verification */
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-center">
              <p className="text-[var(--color-text-muted)] text-sm">
                Código enviado a
              </p>
              <p className="text-[var(--color-text-primary)] font-medium mt-1">
                {pendingEmail}
              </p>
              <button
                type="button"
                onClick={handleChangeEmail}
                className="text-[var(--color-accent)] text-sm mt-2 hover:underline"
              >
                Cambiar email
              </button>
            </div>

            <div>
              <label
                htmlFor="code"
                className="block text-sm text-[var(--color-text-secondary)] mb-2"
              >
                Código de verificación
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                required
                autoComplete="one-time-code"
                className="w-full px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors text-center text-2xl tracking-[0.5em]"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-800/50 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[var(--color-accent)] text-[var(--color-bg-primary)] font-medium tracking-wide hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Verificando...' : 'Verificar código'}
            </button>
          </form>
        )}

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-[var(--color-text-muted)] text-sm hover:text-[var(--color-accent)] transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen
