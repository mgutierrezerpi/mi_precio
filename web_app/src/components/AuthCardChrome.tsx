import { localeForHostname } from '../lib/domainLocale'
import { ShieldCheck, XIcon } from './AuthCardIcons'

/** Why the card was opened: to come back, or to start the free trial. */
export type AuthIntent = 'login' | 'signup'

const signupCopy = () =>
  localeForHostname() === 'en'
    ? {
        title: 'Create your account',
        body: 'Enter your email to start your 14-day free trial. No card needed.',
      }
    : {
        title: 'Creá tu cuenta',
        body: 'Ingresá tu email y empezá tus 14 días gratis, sin tarjeta.',
      }

export function AuthHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <img
        src="/miprecio-logo-pencil.webp"
        alt="MiPrecio"
        className="h-[34px] w-auto max-w-[155px] shrink-0 object-contain object-left"
      />
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F3FF] text-[#475569] transition-colors hover:bg-[#EDE9FE]"
      >
        <XIcon />
      </button>
    </div>
  )
}

export function AuthIntro({
  codeSent,
  intent = 'login',
  pendingEmail,
}: {
  codeSent: boolean
  intent?: AuthIntent
  pendingEmail: string | null
}) {
  const signup = intent === 'signup' ? signupCopy() : null
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-[#0F172A]">
        {codeSent
          ? 'Revisá tu email'
          : (signup?.title ?? 'Bienvenido de vuelta')}
      </h1>
      <p className="text-sm leading-relaxed text-[#64748B]">
        {codeSent ? (
          <>
            Ingresá el código que enviamos a{' '}
            <span className="font-semibold text-[#334155]">{pendingEmail}</span>
            .
          </>
        ) : (
          (signup?.body ?? 'Iniciá sesión para gestionar tu catálogo.')
        )}
      </p>
    </div>
  )
}

export function SecurityNote() {
  return (
    <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#94A3B8]">
      <ShieldCheck className="text-[#10B981]" /> Tus datos están protegidos con
      cifrado SSL
    </div>
  )
}
