import { Field, inputCls } from './shared'
import { useOperationsT } from '../customerUtils'

export function CustomerFormFields({
  email,
  emailError,
  name,
  notes,
  onEmailChange,
  onNameChange,
  onNotesChange,
  onPhoneChange,
  onRutChange,
  phone,
  rut,
}: {
  email: string
  emailError: boolean
  name: string
  notes: string
  onEmailChange: (value: string) => void
  onNameChange: (value: string) => void
  onNotesChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onRutChange: (value: string) => void
  phone: string
  rut: string
}) {
  const t = useOperationsT()
  return (
    <div className="mt-4 flex flex-col gap-3">
      <Field label={t('customers.name')}>
        <input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          autoFocus
          className={inputCls}
          placeholder={t('customers.namePlaceholder')}
        />
      </Field>
      <Field label={t('customers.rut')}>
        <input
          value={rut}
          onChange={(e) => onRutChange(e.target.value)}
          className={inputCls}
          placeholder="21 123456 0017"
        />
      </Field>
      <Field label={t('customers.email')}>
        <input
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          type="email"
          className={inputCls}
          placeholder="lucia@correo.com"
          aria-invalid={emailError}
        />
        {emailError && (
          <p className="mt-1 text-xs font-semibold text-[#EF4444]">
            {t('customers.invalidEmail')}
          </p>
        )}
      </Field>
      <Field label={t('customers.phoneOptional')}>
        <input
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          className={inputCls}
          placeholder="+598 99 123 456"
        />
      </Field>
      <Field label={t('customers.notes')}>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={2}
          className={inputCls}
          placeholder={t('customers.notesPlaceholder')}
        />
      </Field>
    </div>
  )
}
