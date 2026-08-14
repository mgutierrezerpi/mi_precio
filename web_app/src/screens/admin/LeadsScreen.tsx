import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { selectTenant, selectCanEdit } from '../../store/slices/authSlice'
import type { Lead, LeadStatus } from '../../types'
import api from '../../services/api'
import { CrmLayout } from './crm/CrmLayout'
import { Icon, type IconName } from './crm/ui'
import { tone, gradient, type Tone } from './crm/theme'
import { localeOf, useT } from '../../lib/i18n'
import { planHasFeature } from '../../lib/plans'

const STATUS_TONE: Record<LeadStatus, Tone> = {
  new: 'violet',
  contacted: 'amber',
  converted: 'green',
  discarded: 'slate',
}

const TABS: (LeadStatus | 'all')[] = ['all', 'new', 'contacted', 'converted']

/** The Leads inbox: people who left their details on a public list.
 *
 *  An inbox rather than a table of records — newest first, and every row is
 *  one tap from the thing a shop actually does next, which around here is
 *  writing on WhatsApp. */
export function LeadsScreen() {
  const t = useT()
  const navigate = useNavigate()
  const tenant = useAppSelector(selectTenant)
  const canEdit = useAppSelector(selectCanEdit)
  const [leads, setLeads] = useState<Lead[]>([])
  const [tab, setTab] = useState<LeadStatus | 'all'>('all')
  const [loading, setLoading] = useState(true)

  // The server is the authority; this only decides what to render.
  const unlocked = tenant ? planHasFeature(tenant.plan, 'leads') : false

  const load = useCallback(async () => {
    if (!tenant?.id || !unlocked) {
      setLoading(false)
      return
    }
    const res = await api.getLeads(tenant.id)
    if (res.data) setLeads(res.data)
    setLoading(false)
  }, [tenant?.id, unlocked])

  useEffect(() => {
    void load()
  }, [load])

  /** Runs an action and re-reads the inbox, so a row never shows a state the
   *  server did not confirm. */
  const act = async (run: () => Promise<unknown>) => {
    if (!canEdit) return
    await run()
    void load()
  }

  const shown = tab === 'all' ? leads : leads.filter((l) => l.status === tab)

  return (
    <CrmLayout
      active={t('leads.title')}
      title={t('leads.title')}
      subtitle={t('leads.subtitle')}
      hideContext
    >
      <main className="flex min-h-full flex-col gap-5 px-4 py-6 md:px-10 md:py-8">
        <section className="flex min-h-[60px] flex-col justify-center gap-1">
          <h1 className="text-[28px] font-bold leading-none text-[#F8F7FF]">
            {t('leads.title')}
          </h1>
          <p className="text-[13px] text-[#9694A6]">{t('leads.subtitle')}</p>
        </section>

        {!unlocked ? (
          <Upsell onSeePlans={() => navigate('/admin/settings?section=billing')} t={t} />
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {TABS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`h-9 rounded-lg px-3.5 text-[13px] font-bold ${
                    tab === key
                      ? `text-white ${gradient}`
                      : 'border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text2)]'
                  }`}
                >
                  {key === 'all' ? t('leads.tab.all') : t(`leads.status.${key}`)}
                </button>
              ))}
            </div>

            {loading ? null : shown.length === 0 ? (
              <Empty t={t} />
            ) : (
              <div className="flex flex-col gap-3">
                {shown.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    canEdit={canEdit}
                    locale={localeOf(tenant?.language)}
                    onContacted={() =>
                      act(() => api.setLeadStatus(tenant!.id, lead.id, 'contacted'))
                    }
                    onConvert={() => act(() => api.convertLead(tenant!.id, lead.id))}
                    onDiscard={() =>
                      act(() => api.setLeadStatus(tenant!.id, lead.id, 'discarded'))
                    }
                    t={t}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </CrmLayout>
  )
}

function LeadRow({
  lead,
  canEdit,
  locale,
  onContacted,
  onConvert,
  onDiscard,
  t,
}: {
  lead: Lead
  canEdit: boolean
  locale: string
  onContacted: () => void
  onConvert: () => void
  onDiscard: () => void
  t: ReturnType<typeof useT>
}) {
  const done = lead.status === 'converted' || lead.status === 'discarded'
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-bold text-[var(--dash-text)]">
            {lead.name}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={tone(STATUS_TONE[lead.status])}
          >
            {t(`leads.status.${lead.status}`)}
          </span>
          <span className="text-[11px] font-medium text-[var(--dash-muted)]">
            {t(`leads.source.${lead.source}`)}
            {lead.listName ? ` · ${lead.listName}` : ''}
          </span>
        </div>
        <span className="text-[13px] font-medium text-[var(--dash-text2)]">
          {[lead.phone, lead.email].filter(Boolean).join(' · ')}
        </span>
        {lead.message && (
          <p className="max-w-[60ch] text-[13px] text-[var(--dash-muted)]">
            {lead.message}
          </p>
        )}
        <span className="text-[11px] text-[var(--dash-muted)]">
          {new Date(lead.createdAt).toLocaleString(locale)}
        </span>
      </div>

      {canEdit && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {lead.phone && (
            <RowAction
              icon="send"
              label={t('leads.action.whatsapp')}
              href={`https://wa.me/${lead.phone}`}
            />
          )}
          {!done && (
            <>
              <RowAction
                icon="circle-check"
                label={t('leads.action.contacted')}
                onClick={onContacted}
              />
              <RowAction
                icon="user-plus"
                label={t('leads.action.convert')}
                onClick={onConvert}
              />
              <RowAction
                icon="circle-x"
                label={t('leads.action.discard')}
                onClick={onDiscard}
              />
            </>
          )}
        </div>
      )}
    </article>
  )
}

function RowAction({
  icon,
  label,
  onClick,
  href,
}: {
  icon: IconName
  label: string
  onClick?: () => void
  href?: string
}) {
  const className =
    'flex h-9 items-center gap-1.5 rounded-lg border border-[var(--dash-border)] px-3 text-[12px] font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]'
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      <Icon name={icon} size={14} /> {label}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      <Icon name={icon} size={14} /> {label}
    </button>
  )
}

function Empty({ t }: { t: ReturnType<typeof useT> }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 text-center">
      <span
        className="flex h-12 w-12 items-center justify-center rounded-xl"
        style={tone('violet')}
      >
        <Icon name="users" size={24} />
      </span>
      <p className="text-sm font-bold text-[var(--dash-text)]">{t('leads.empty')}</p>
      <p className="max-w-[42ch] text-xs font-medium text-[var(--dash-muted)]">
        {t('leads.emptyHelp')}
      </p>
    </div>
  )
}

/** What the cheaper tiers see. A dead tab teaches nothing; this says what the
 *  feature is and where to get it. */
function Upsell({
  onSeePlans,
  t,
}: {
  onSeePlans: () => void
  t: ReturnType<typeof useT>
}) {
  return (
    <div
      className={`flex flex-col items-start gap-3 rounded-xl p-6 text-white ${gradient}`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
        <Icon name="users" size={22} />
      </span>
      <p className="text-lg font-extrabold">{t('leads.upsellTitle')}</p>
      <p className="max-w-[52ch] text-sm font-medium text-white/85">
        {t('leads.upsellBody')}
      </p>
      <button
        type="button"
        onClick={onSeePlans}
        className="mt-1 flex h-10 items-center rounded-lg bg-white px-4 text-[13px] font-bold text-[#7C3AED]"
      >
        {t('leads.upsellCta')}
      </button>
    </div>
  )
}

export default LeadsScreen
