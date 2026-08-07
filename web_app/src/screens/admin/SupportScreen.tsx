import { useState } from 'react'
import { useAppSelector } from '../../store/hooks'
import { selectTenant, selectUser } from '../../store/slices/authSlice'
import api from '../../services/api'
import { CrmLayout } from './crm/CrmLayout'
import { Icon } from './crm/ui'
import { gradient, tone, type Tone } from './crm/theme'
import { normalizeLang, useT } from '../../lib/i18n'
import { DICT_OPERATIONS } from '../../lib/i18nDictionaryOperations'
import { trackEvent } from '../../lib/analytics'

function useOperationsT() {
  const t = useT()
  const language = useAppSelector(selectTenant)?.language
  const lang = normalizeLang(language)
  return (key: string, vars?: Record<string, string | number>) => {
    let value = DICT_OPERATIONS[key]?.[lang] ?? t(key, vars)
    if (vars)
      for (const [name, variable] of Object.entries(vars))
        value = value.replaceAll(`{${name}}`, String(variable))
    return value
  }
}

type Priority = 'low' | 'medium' | 'high' | 'urgent'
type SetState<T> = (value: T) => void
const PRIORITIES: { id: Priority; key: string; t: Tone }[] = [
  { id: 'low', key: 'support.low', t: 'slate' },
  { id: 'medium', key: 'support.medium', t: 'sky' },
  { id: 'high', key: 'support.high', t: 'amber' },
  { id: 'urgent', key: 'support.urgent', t: 'rose' },
]
const SUPPORT_EMAIL = 'soporte@miprecio.app'

export function SupportScreen() {
  const t = useOperationsT()
  const email = useAppSelector(selectUser)?.email
  const form = useSupportForm()
  return (
    <CrmLayout
      active={t('support.title')}
      title={t('support.title')}
      subtitle={t('support.subtitle')}
      hideContext
    >
      <main className="mx-auto flex min-h-full w-full max-w-[820px] flex-col gap-4 px-4 py-6 md:px-10 md:py-8">
        <SupportHeader />
        {form.ticketId !== null ? (
          <TicketSuccess
            email={email}
            ticketId={form.ticketId}
            onReset={form.reset}
          />
        ) : (
          <SupportForm {...form} email={email} />
        )}
      </main>
    </CrmLayout>
  )
}

function useSupportForm() {
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ticketId, setTicketId] = useState<number | string | null>(null)
  const valid = subject.trim().length >= 3 && description.trim().length >= 10
  const submit = async () => {
    if (!valid || sending) return
    setSending(true)
    setError(null)
    const result = await api.createSupportTicket(
      subject.trim(),
      description.trim(),
      priority
    )
    setSending(false)
    if (result.error) return setError(result.error)
    trackEvent('Submitted Support Form', { priority })
    setTicketId(result.data?.id ?? '')
    setSubject('')
    setDescription('')
    setPriority('medium')
  }
  const reset = () => {
    setTicketId(null)
    setError(null)
  }
  return {
    subject,
    setSubject,
    description,
    setDescription,
    priority,
    setPriority,
    sending,
    error,
    valid,
    ticketId,
    submit,
    reset,
  }
}

function SupportHeader() {
  const t = useOperationsT()
  return (
    <section className="flex min-h-[60px] flex-col justify-center gap-1">
      <h1 className="text-[28px] font-bold leading-none text-[#F8F7FF]">
        {t('support.title')}
      </h1>
      <p className="text-[13px] text-[#9694A6]">
        {t('support.subtitle')}
      </p>
    </section>
  )
}

function TicketSuccess({
  email,
  ticketId,
  onReset,
}: {
  email?: string
  ticketId: number | string
  onReset: () => void
}) {
  const t = useOperationsT()
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 text-center">
      <span
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={tone('green')}
      >
        <Icon name="circle-check" size={28} />
      </span>
      <h3 className="text-xl font-extrabold text-[var(--dash-text)]">
        {t('support.sent')}
      </h3>
      <p className="max-w-[440px] text-sm font-medium text-[var(--dash-text2)]">
        {ticketId ? (
          <>
            {t('support.registered')}{' '}
            <span className="font-bold text-[var(--dash-text)]">
              #{ticketId}
            </span>
            .{' '}
          </>
        ) : null}
        {t('support.replyTo')}{' '}
        <span className="font-bold text-[var(--dash-text)]">{email}</span>.
      </p>
      <button
        type="button"
        onClick={onReset}
        className={`mt-2 flex h-10 items-center gap-1.5 rounded-xl px-5 text-sm font-bold text-white ${gradient}`}
      >
        <Icon name="plus" size={16} />
        {t('support.openAnother')}
      </button>
    </div>
  )
}

type SupportFormProps = {
  subject: string
  setSubject: SetState<string>
  description: string
  setDescription: SetState<string>
  priority: Priority
  setPriority: SetState<Priority>
  sending: boolean
  error: string | null
  valid: boolean
  email?: string
  submit: () => void
}
function SupportForm({
  subject,
  setSubject,
  description,
  setDescription,
  priority,
  setPriority,
  sending,
  error,
  valid,
  email,
  submit,
}: SupportFormProps) {
  const t = useOperationsT()
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5">
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm font-semibold text-[#B91C1C]">
          <Icon name="alert-triangle" size={16} />
          {error}
        </div>
      )}
      <TextField
        label={t('support.subject')}
        value={subject}
        onChange={setSubject}
        maxLength={255}
        placeholder={t('support.subjectPlaceholder')}
      />
      <PriorityPicker priority={priority} setPriority={setPriority} />
      <DescriptionField
        value={description}
        onChange={setDescription}
        email={email}
      />
      <div className="flex items-center justify-between gap-3">
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-xs font-semibold text-[var(--dash-link)] hover:underline"
        >
          {t('support.writeTo', { email: SUPPORT_EMAIL })}
        </a>
        <button
          type="button"
          onClick={submit}
          disabled={!valid || sending}
          className={`flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-bold text-white shadow-[0_8px_20px_-4px_rgba(124,58,237,0.4)] disabled:opacity-50 ${gradient}`}
        >
          <Icon name="send" size={16} />
          {sending ? t('support.sending') : t('support.send')}
        </button>
      </div>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  maxLength,
  placeholder,
}: {
  label: string
  value: string
  onChange: SetState<string>
  maxLength: number
  placeholder: string
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-[var(--dash-text2)]">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 py-2.5 text-sm font-medium text-[var(--dash-text)] outline-none placeholder:text-[var(--dash-muted)] focus:border-[var(--dash-link)]"
      />
    </label>
  )
}
function PriorityPicker({
  priority,
  setPriority,
}: {
  priority: Priority
  setPriority: SetState<Priority>
}) {
  const t = useOperationsT()
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-[var(--dash-text2)]">
        {t('support.priority')}
      </span>
      <div className="flex flex-wrap gap-2">
        {PRIORITIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPriority(item.id)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-bold transition ${priority === item.id ? 'ring-2 ring-[var(--dash-link)] ring-offset-1 ring-offset-[var(--dash-surface)]' : 'opacity-70 hover:opacity-100'}`}
            style={tone(item.t)}
          >
            {t(item.key)}
          </button>
        ))}
      </div>
    </div>
  )
}
function DescriptionField({
  value,
  onChange,
  email,
}: {
  value: string
  onChange: SetState<string>
  email?: string
}) {
  const t = useOperationsT()
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-[var(--dash-text2)]">
        {t('support.description')}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={7}
        maxLength={10000}
        placeholder={t('support.descriptionPlaceholder')}
        className="resize-y rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 py-2.5 text-sm font-medium leading-relaxed text-[var(--dash-text)] outline-none placeholder:text-[var(--dash-muted)] focus:border-[var(--dash-link)]"
      />
      <span className="text-[11px] font-medium text-[var(--dash-muted)]">
        {t('support.replyAt', { email: email ?? '' })}
      </span>
    </label>
  )
}
export default SupportScreen
