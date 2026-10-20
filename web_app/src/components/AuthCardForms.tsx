import type { FormEvent } from 'react'
import { ArrowRight, LockIcon, MailIcon } from './AuthCardIcons'
import {
  AUTH_INPUT_CLASS_NAME,
  AUTH_SUBMIT_CLASS_NAME,
  AuthError,
  AuthField,
} from './AuthCardShared'

interface EmailFormProps {
  email: string
  error: string | null
  isLoading: boolean
  onEmailChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
}

export function EmailForm({
  email,
  error,
  isLoading,
  onEmailChange,
  onSubmit,
}: EmailFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <AuthField label="Email" icon={<MailIcon />}>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="tucorreo@empresa.com"
          required
          autoFocus
          autoComplete="email"
          className={AUTH_INPUT_CLASS_NAME}
        />
      </AuthField>
      <AuthError error={error} />
      <button
        type="submit"
        disabled={isLoading}
        className={AUTH_SUBMIT_CLASS_NAME}
      >
        {isLoading ? (
          'Enviando...'
        ) : (
          <>
            Enviar código <ArrowRight />
          </>
        )}
      </button>
    </form>
  )
}

interface CodeFormProps {
  code: string
  error: string | null
  isLoading: boolean
  onChangeEmail: () => void
  onCodeChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
  /** Sends a new code to the same email (a lost or late email was a dead end). */
  onResend: () => void
  /** Seconds left before another code can be asked for; 0 when it can. */
  resendIn: number
}

export function CodeForm({
  code,
  error,
  isLoading,
  onChangeEmail,
  onCodeChange,
  onSubmit,
  onResend,
  resendIn,
}: CodeFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <AuthField label="Código de verificación" icon={<LockIcon />}>
        <input
          id="code"
          type="text"
          inputMode="numeric"
          value={code}
          onChange={(event) => onCodeChange(event.target.value)}
          placeholder="123456"
          required
          autoFocus
          autoComplete="one-time-code"
          className={`${AUTH_INPUT_CLASS_NAME} tracking-[0.3em]`}
        />
      </AuthField>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onChangeEmail}
          className="text-[13px] font-semibold text-[#7C3AED] hover:underline"
        >
          ← Cambiar email
        </button>
        <button
          type="button"
          onClick={onResend}
          disabled={isLoading || resendIn > 0}
          className="text-[13px] font-semibold text-[#7C3AED] hover:underline disabled:cursor-default disabled:text-[#94A3B8] disabled:no-underline"
        >
          {resendIn > 0 ? `Reenviar código (${resendIn} s)` : 'Reenviar código'}
        </button>
      </div>
      <AuthError error={error} />
      <button
        type="submit"
        disabled={isLoading}
        className={AUTH_SUBMIT_CLASS_NAME}
      >
        {isLoading ? (
          'Verificando...'
        ) : (
          <>
            Verificar código <ArrowRight />
          </>
        )}
      </button>
    </form>
  )
}
