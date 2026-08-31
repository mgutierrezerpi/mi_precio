import { Icon } from './crm/ui'
import { tone } from './crm/theme'
import { PRIORITIES, type Priority, type SetState, useOperationsT } from './supportTranslation'

const TEXT_FIELD_CLASS_NAME = [
  'rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 py-2.5 text-sm',
  'font-medium text-[var(--dash-text)] outline-none placeholder:text-[var(--dash-muted)]',
  'focus:border-[var(--dash-link)]',
].join(' ')
const DESCRIPTION_FIELD_CLASS_NAME = [
  'resize-y rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 py-2.5',
  'text-sm font-medium leading-relaxed text-[var(--dash-text)] outline-none',
  'placeholder:text-[var(--dash-muted)] focus:border-[var(--dash-link)]',
].join(' ')

export function TextField({ label, value, onChange, maxLength, placeholder }: {
  label: string; value: string; onChange: SetState<string>; maxLength: number; placeholder: string
}) {
  return <label className="flex flex-col gap-1.5">
    <span className="text-xs font-bold text-[var(--dash-text2)]">{label}</span>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      maxLength={maxLength}
      placeholder={placeholder}
      className={TEXT_FIELD_CLASS_NAME}
    />
  </label>
}

export function PriorityPicker({ priority, setPriority }: {
  priority: Priority; setPriority: SetState<Priority>
}) {
  const t = useOperationsT()
  const selectedClassName = 'ring-2 ring-[var(--dash-link)] ring-offset-1 ring-offset-[var(--dash-surface)]'
  return <div className="flex flex-col gap-1.5">
    <span className="text-xs font-bold text-[var(--dash-text2)]">{t('support.priority')}</span>
    <div className="flex flex-wrap gap-2">
      {PRIORITIES.map((item) => <button
        key={item.id}
        type="button"
        onClick={() => setPriority(item.id)}
        className={`rounded-full px-3.5 py-1.5 text-[13px] font-bold transition ${
          priority === item.id ? selectedClassName : 'opacity-70 hover:opacity-100'
        }`}
        style={tone(item.t)}
      >
        {t(item.key)}
      </button>)}
    </div>
  </div>
}

export function DescriptionField({ value, onChange, email }: {
  value: string; onChange: SetState<string>; email?: string
}) {
  const t = useOperationsT()
  return <label className="flex flex-col gap-1.5">
    <span className="text-xs font-bold text-[var(--dash-text2)]">{t('support.description')}</span>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={7}
      maxLength={10000}
      placeholder={t('support.descriptionPlaceholder')}
      className={DESCRIPTION_FIELD_CLASS_NAME}
    />
    <span className="text-[11px] font-medium text-[var(--dash-muted)]">
      {t('support.replyAt', { email: email ?? '' })}
    </span>
  </label>
}

export function SupportError({ error }: { error: string }) {
  return <div className="flex items-center gap-2 rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm font-semibold text-[#B91C1C]">
    <Icon name="alert-triangle" size={16} /> {error}
  </div>
}
