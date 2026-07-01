import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
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
} from '../store/slices/authSlice'

/* ── Inline icons (lucide-style) ──────────────────────────────── */
type IconProps = { className?: string; size?: number }
const svg = (size: number, className: string | undefined, children: React.ReactNode) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
)
const XIcon = ({ className, size = 18 }: IconProps) => svg(size, className, <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>)
const MailIcon = ({ className, size = 18 }: IconProps) => svg(size, className, <><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></>)
const LockIcon = ({ className, size = 18 }: IconProps) => svg(size, className, <><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>)
const ArrowRight = ({ className, size = 18 }: IconProps) => svg(size, className, <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>)
const ShieldCheck = ({ className, size = 14 }: IconProps) => svg(size, className, <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></>)
/* Iconos de login social — deshabilitados temporalmente (solo email por ahora).
const GoogleIcon = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
  </svg>
)
const AppleIcon = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#0F172A" aria-hidden="true">
    <path d="M17.05 12.54c-.02-2.06 1.68-3.05 1.76-3.1-0.96-1.4-2.45-1.6-2.98-1.62-1.27-.13-2.48.75-3.12.75-.64 0-1.64-.73-2.7-.71-1.39.02-2.67.81-3.38 2.05-1.44 2.5-.37 6.2 1.04 8.23.69.99 1.51 2.1 2.58 2.06 1.04-.04 1.43-.67 2.69-.67 1.25 0 1.61.67 2.7.65 1.12-.02 1.83-1.01 2.51-2.01.79-1.15 1.12-2.27 1.13-2.33-.02-.01-2.17-.83-2.19-3.29zM15.0 6.36c.57-.69.95-1.65.85-2.61-.82.03-1.81.55-2.4 1.24-.53.61-.99 1.59-.87 2.52.91.07 1.85-.46 2.42-1.15z" />
  </svg>
)
*/

/* ── Visual bits ──────────────────────────────────────────────── */
/* Botón de login social — deshabilitado temporalmente (solo email por ahora).
function SocialButton({ provider }: { provider: 'google' | 'apple' }) {
  return (
    <button
      type="button"
      disabled
      title="Próximamente"
      className="flex h-11 flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white text-sm font-bold text-[#0F172A] opacity-60"
    >
      {provider === 'google' ? <GoogleIcon /> : <AppleIcon />}
      {provider === 'google' ? 'Google' : 'Apple'}
    </button>
  )
}
*/

const inputCls =
  'min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-medium text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-0 focus:outline-none focus:ring-0'

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-[#334155]">{label}</label>
      <div className="flex h-12 items-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 transition-colors focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/15">
        <span className="text-[#94A3B8]">{icon}</span>
        {children}
      </div>
    </div>
  )
}

const submitCls =
  'mt-1 flex h-[52px] items-center justify-center gap-2 rounded-[14px] bg-gradient-to-br from-[#7C3AED] to-[#A855F7] text-[15px] font-bold text-white shadow-[0_12px_24px_-6px_rgba(124,58,237,0.4)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60'

/**
 * The login card (visual + email→code auth logic). Reused as a full page
 * (`LoginScreen`) and inside the landing modal (`AuthModal`). `onClose`
 * fires when the user dismisses it via the header X.
 */
export function AuthCard({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isLoading = useAppSelector(selectAuthLoading)
  const error = useAppSelector(selectAuthError)
  const codeSent = useAppSelector(selectCodeSent)
  const pendingEmail = useAppSelector(selectPendingEmail)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')

  // Redirect if already authenticated.
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true })
    }
  }, [isAuthenticated, navigate])

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
    <div className="flex w-full max-w-[440px] flex-col gap-5 rounded-[24px] bg-white p-9 shadow-[0_30px_80px_-20px_rgba(30,27,75,0.45)] sm:p-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <img src="/miprecio-logo-pencil.webp" alt="Mi Precio" className="h-10 w-auto" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F3FF] text-[#475569] transition-colors hover:bg-[#EDE9FE]"
        >
          <XIcon />
        </button>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-[#0F172A]">
          {codeSent ? 'Revisá tu email' : 'Bienvenido de vuelta'}
        </h1>
        <p className="text-sm leading-relaxed text-[#64748B]">
          {codeSent ? (
            <>
              Ingresá el código que enviamos a{' '}
              <span className="font-semibold text-[#334155]">{pendingEmail}</span>.
            </>
          ) : (
            'Iniciá sesión para gestionar tu catálogo.'
          )}
        </p>
      </div>

      {!codeSent ? (
        /* Step 1: Email input */
        <>
          {/* Login social temporalmente deshabilitado: por ahora solo email.
          <div className="flex gap-3">
            <SocialButton provider="google" />
            <SocialButton provider="apple" />
          </div>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-[#E2E8F0]" />
            <span className="text-xs font-medium text-[#94A3B8]">o ingresá con tu email</span>
            <span className="h-px flex-1 bg-[#E2E8F0]" />
          </div>
          */}

          <form onSubmit={handleSendCode} className="flex flex-col gap-4">
            <Field label="Email" icon={<MailIcon />}>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@empresa.com"
                required
                autoFocus
                autoComplete="email"
                className={inputCls}
              />
            </Field>

            {error && (
              <p className="rounded-xl bg-[#FEF2F2] px-3.5 py-2.5 text-sm font-medium text-[#DC2626]">
                {error}
              </p>
            )}

            <button type="submit" disabled={isLoading} className={submitCls}>
              {isLoading ? 'Enviando...' : <>Enviar código <ArrowRight /></>}
            </button>
          </form>
        </>
      ) : (
        /* Step 2: Code verification */
        <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
          <Field label="Código de verificación" icon={<LockIcon />}>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              required
              autoFocus
              autoComplete="one-time-code"
              className={`${inputCls} tracking-[0.3em]`}
            />
          </Field>

          <button
            type="button"
            onClick={handleChangeEmail}
            className="self-start text-[13px] font-semibold text-[#7C3AED] hover:underline"
          >
            ← Cambiar email
          </button>

          {error && (
            <p className="rounded-xl bg-[#FEF2F2] px-3.5 py-2.5 text-sm font-medium text-[#DC2626]">
              {error}
            </p>
          )}

          <button type="submit" disabled={isLoading} className={submitCls}>
            {isLoading ? 'Verificando...' : <>Verificar código <ArrowRight /></>}
          </button>
        </form>
      )}

      {/* Security note */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#94A3B8]">
        <ShieldCheck className="text-[#10B981]" />
        Tus datos están protegidos con cifrado SSL
      </div>
    </div>
  )
}

export default AuthCard
