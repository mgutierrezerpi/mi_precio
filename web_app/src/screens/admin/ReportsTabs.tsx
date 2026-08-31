import { gradient } from './crm/theme'
import type { TFn } from '../../lib/i18n'

type ReportTabKey = 'rendimiento' | 'auditoria'

export function ReportTabs({
  tab,
  setTab,
  t,
}: {
  tab: ReportTabKey
  setTab: (tab: ReportTabKey) => void
  t: TFn
}) {
  return (
    <nav
      className={[
        'flex w-full items-center gap-1 rounded-lg border border-[var(--dash-border)]',
        'bg-[var(--dash-surface)] p-1 sm:w-fit',
      ].join(' ')}
      aria-label={t('analytics.reportSections')}
    >
      <ReportTab
        active={tab === 'rendimiento'}
        onClick={() => setTab('rendimiento')}
      >
        {t('analytics.performance')}
      </ReportTab>
      <ReportTab
        active={tab === 'auditoria'}
        onClick={() => setTab('auditoria')}
      >
        {t('analytics.auditLog')}
      </ReportTab>
    </nav>
  )
}

function ReportTab({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-md px-4 py-2 text-xs font-bold',
        active
          ? `text-white ${gradient}`
          : 'text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
