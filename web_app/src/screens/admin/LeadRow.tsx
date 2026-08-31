import type { Lead } from '../../types'
import type { TFn } from '../../lib/i18n'
import { Icon, type IconName } from './crm/ui'
import { tone, type Tone } from './crm/theme'

const STATUS_TONE: Record<Lead['status'], Tone> = {
  new: 'violet', contacted: 'amber', converted: 'green', discarded: 'slate',
}

interface LeadRowProps {
  lead: Lead
  canEdit: boolean
  locale: string
  onContacted: () => void
  onConvert: () => void
  onDiscard: () => void
  t: TFn
}

export function LeadRow({
  lead, canEdit, locale, onContacted, onConvert, onDiscard, t,
}: LeadRowProps) {
  const done = lead.status === 'converted' || lead.status === 'discarded'
  const rowClassName = [
    'flex flex-col gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)]',
    'p-4 md:flex-row md:items-center md:justify-between',
  ].join(' ')
  return <article className={rowClassName}>
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[15px] font-bold text-[var(--dash-text)]">{lead.name}</span>
        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={tone(STATUS_TONE[lead.status])}>
          {t(`leads.status.${lead.status}`)}
        </span>
        <span className="text-[11px] font-medium text-[var(--dash-muted)]">
          {t(`leads.source.${lead.source}`)}{lead.listName ? ` · ${lead.listName}` : ''}
        </span>
      </div>
      <span className="text-[13px] font-medium text-[var(--dash-text2)]">
        {[lead.phone, lead.email].filter(Boolean).join(' · ')}
      </span>
      {lead.message && <p className="max-w-[60ch] text-[13px] text-[var(--dash-muted)]">{lead.message}</p>}
      <span className="text-[11px] text-[var(--dash-muted)]">
        {new Date(lead.createdAt).toLocaleString(locale)}
      </span>
    </div>
    {canEdit && <div className="flex shrink-0 flex-wrap items-center gap-2">
      {lead.phone && <RowAction icon="send" label={t('leads.action.whatsapp')} href={`https://wa.me/${lead.phone}`} />}
      {!done && <>
        <RowAction icon="circle-check" label={t('leads.action.contacted')} onClick={onContacted} />
        <RowAction icon="user-plus" label={t('leads.action.convert')} onClick={onConvert} />
        <RowAction icon="circle-x" label={t('leads.action.discard')} onClick={onDiscard} />
      </>}
    </div>}
  </article>
}

interface RowActionProps {
  icon: IconName
  label: string
  onClick?: () => void
  href?: string
}

function RowAction({ icon, label, onClick, href }: RowActionProps) {
  const className = [
    'flex h-9 items-center gap-1.5 rounded-lg border border-[var(--dash-border)] px-3 text-[12px]',
    'font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]',
  ].join(' ')
  const content = <><Icon name={icon} size={14} /> {label}</>
  return href ? <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a> : (
    <button type="button" onClick={onClick} className={className}>{content}</button>
  )
}
