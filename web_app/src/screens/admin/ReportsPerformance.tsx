import { useAnalyticsI18n, fmtInt, PRODUCT_TONES } from './reportsHelpers'
import type { PriceList } from '../../types'
import type { ReportData } from '../../services/api'
import { ReportsChart } from './ReportsChart'
import { Channels } from './ReportsChannels'
import type { TFn } from '../../lib/i18n'
import { formatPrice } from './crm/productFormat'
import { PerformanceHeader } from './ReportsHeader'

export function PerformanceReport({
  data,
  days,
  loading,
  periodVisits,
  setDays,
  lists,
  selectedListId,
  onSelectList,
}: {
  data: ReportData | null
  days: number
  loading: boolean
  periodVisits: number
  setDays: (days: number) => void
  lists: PriceList[]
  selectedListId?: string
  onSelectList: (listId: string) => void
}) {
  const { locale, t } = useAnalyticsI18n()
  return (
    <div className="flex flex-col gap-4">
      <section
        className={[
          'flex min-h-[390px] flex-col gap-4 rounded-xl border',
          'border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 md:p-5',
        ].join(' ')}
      >
        <PerformanceHeader
          days={days}
          periodVisits={periodVisits}
          setDays={setDays}
          t={t}
          locale={locale}
          lists={lists}
          selectedListId={selectedListId}
          onSelectList={onSelectList}
        />
        <ReportsChart data={data} loading={loading} t={t} locale={locale} />
      </section>
      <div
        className={`grid grid-cols-1 gap-4 ${selectedListId ? '' : 'xl:grid-cols-2'}`}
      >
        {!selectedListId && <TopProducts data={data} loading={loading} />}
        <Channels data={data} loading={loading} />
      </div>
    </div>
  )
}

function TopProducts({
  data,
  loading,
}: {
  data: ReportData | null
  loading: boolean
}) {
  const { locale, t } = useAnalyticsI18n()
  const items = data?.topProducts ?? []
  const max = Math.max(1, ...items.map((product) => product.units))
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
      <h3 className="text-[16px] font-extrabold text-[var(--dash-text)]">
        {t('analytics.topProducts')}
      </h3>
      {loading ? (
        <p className="py-6 text-center text-xs font-medium text-[var(--dash-muted)]">
          {t('analytics.loading')}
        </p>
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-xs font-medium text-[var(--dash-muted)]">
          {t('analytics.noSalesYet')}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((product, index) => (
            <ProductRow
              key={product.name}
              product={product}
              index={index}
              max={max}
              locale={locale}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProductRow({
  product,
  index,
  max,
  locale,
  t,
}: {
  product: NonNullable<ReportData['topProducts']>[number]
  index: number
  max: number
  locale: string
  t: TFn
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2 text-[12px]">
        <span className="truncate font-semibold text-[var(--dash-text2)]">
          {product.name}
        </span>
        <span className="shrink-0 font-bold text-[var(--dash-muted)]">
          {fmtInt(product.units, locale)} {t('analytics.units')} ·{' '}
          {formatPrice(product.revenue)}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--dash-soft)]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${(product.units / max) * 100}%`,
            backgroundColor: `var(--tone-${PRODUCT_TONES[index % PRODUCT_TONES.length]}-fg)`,
          }}
        />
      </div>
    </div>
  )
}
