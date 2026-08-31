import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { localeOf, useT } from '../../lib/i18n'
import { planHasFeature } from '../../lib/plans'
import api from '../../services/api'
import { useAppSelector } from '../../store/hooks'
import { selectCanEdit, selectTenant } from '../../store/slices/authSlice'
import type { Lead, LeadStatus } from '../../types'
import { LeadRow } from './LeadRow'
import { EmptyLeads, LeadsUpsell } from './LeadsPanels'
import { CrmLayout } from './crm/CrmLayout'
import { gradient } from './crm/theme'

const TABS: (LeadStatus | 'all')[] = ['all', 'new', 'contacted', 'converted']

function tabClassName(active: boolean) {
  return [
    'h-9 rounded-lg px-3.5 text-[13px] font-bold',
    active
      ? `text-white ${gradient}`
      : 'border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text2)]',
  ].join(' ')
}

/** Inbox for people who leave their details on a public list. */
export function LeadsScreen() {
  const t = useT()
  const navigate = useNavigate()
  const tenant = useAppSelector(selectTenant)
  const canEdit = useAppSelector(selectCanEdit)
  const [leads, setLeads] = useState<Lead[]>([])
  const [tab, setTab] = useState<LeadStatus | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const unlocked = tenant ? planHasFeature(tenant.plan, 'leads') : false
  const load = useCallback(async () => {
    if (!tenant?.id || !unlocked) return setLoading(false)
    const res = await api.getLeads(tenant.id)
    if (res.data) setLeads(res.data)
    setLoading(false)
  }, [tenant, unlocked])

  useEffect(() => {
    void Promise.resolve().then(load)
  }, [load])

  const act = async (run: () => Promise<unknown>) => {
    if (!canEdit) return
    await run()
    void load()
  }
  const shown = tab === 'all' ? leads : leads.filter((lead) => lead.status === tab)
  const locale = localeOf(tenant?.language)
  const beginCreate = (lead: Lead) => act(() => api.convertLead(tenant!.id, lead.id))
  const markContacted = (lead: Lead) => act(() => api.setLeadStatus(tenant!.id, lead.id, 'contacted'))
  const discard = (lead: Lead) => act(() => api.setLeadStatus(tenant!.id, lead.id, 'discarded'))

  return <CrmLayout active={t('leads.title')} title={t('leads.title')} subtitle={t('leads.subtitle')} hideContext>
    <main className="flex min-h-full flex-col gap-5 px-4 py-6 md:px-10 md:py-8">
      <section className="flex min-h-[60px] flex-col justify-center gap-1">
        <h1 className="text-[28px] font-bold leading-none text-[#F8F7FF]">{t('leads.title')}</h1>
        <p className="text-[13px] text-[#9694A6]">{t('leads.subtitle')}</p>
      </section>
      {!unlocked ? <LeadsUpsell onSeePlans={() => navigate('/admin/settings?section=billing')} t={t} /> : <>
        <div className="flex flex-wrap gap-2">
          {TABS.map((key) => <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={tabClassName(tab === key)}
          >
            {key === 'all' ? t('leads.tab.all') : t(`leads.status.${key}`)}
          </button>)}
        </div>
        {!loading && (shown.length === 0 ? <EmptyLeads t={t} /> : <div className="flex flex-col gap-3">
          {shown.map((lead) => <LeadRow
            key={lead.id}
            lead={lead}
            canEdit={canEdit}
            locale={locale}
            onContacted={() => markContacted(lead)}
            onConvert={() => beginCreate(lead)}
            onDiscard={() => discard(lead)}
            t={t}
          />)}
        </div>)}
      </>}
    </main>
  </CrmLayout>
}

export default LeadsScreen
