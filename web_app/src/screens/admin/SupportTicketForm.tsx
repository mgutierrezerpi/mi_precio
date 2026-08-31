import { Icon } from './crm/ui'
import { gradient } from './crm/theme'
import { DescriptionField, PriorityPicker, SupportError, TextField } from './SupportFields'
import { SUPPORT_EMAIL, type Priority, type SetState, useOperationsT } from './supportTranslation'

export interface SupportTicketFormProps {
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

export function SupportTicketForm({
  subject, setSubject, description, setDescription, priority, setPriority,
  sending, error, valid, email, submit,
}: SupportTicketFormProps) {
  const t = useOperationsT()
  const sendButtonClassName = [
    'flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-bold text-white',
    'shadow-[0_8px_20px_-4px_rgba(124,58,237,0.4)] disabled:opacity-50',
    gradient,
  ].join(' ')
  return <div className="flex flex-col gap-5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5">
    {error && <SupportError error={error} />}
    <TextField
      label={t('support.subject')}
      value={subject}
      onChange={setSubject}
      maxLength={255}
      placeholder={t('support.subjectPlaceholder')}
    />
    <PriorityPicker priority={priority} setPriority={setPriority} />
    <DescriptionField value={description} onChange={setDescription} email={email} />
    <div className="flex items-center justify-between gap-3">
      <a href={`mailto:${SUPPORT_EMAIL}`} className="text-xs font-semibold text-[var(--dash-link)] hover:underline">
        {t('support.writeTo', { email: SUPPORT_EMAIL })}
      </a>
      <button type="button" onClick={submit} disabled={!valid || sending} className={sendButtonClassName}>
        <Icon name="send" size={16} /> {sending ? t('support.sending') : t('support.send')}
      </button>
    </div>
  </div>
}
