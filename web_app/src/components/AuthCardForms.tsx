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
}

export function CodeForm({
  code,
  error,
  isLoading,
  onChangeEmail,
  onCodeChange,
  onSubmit,
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
      <button
        type="button"
        onClick={onChangeEmail}
        className="self-start text-[13px] font-semibold text-[#7C3AED] hover:underline"
      >
        ← Cambiar email
      </button>
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
