import { useMemo } from 'react'
import type { ReportData } from '../../services/api'
import { channelMeta, fmtInt, useAnalyticsI18n } from './reportsHelpers'
import type { TFn } from '../../lib/i18n'

export function Channels({
  data,
  loading,
}: {
  data: ReportData | null
  loading: boolean
}) {
  const { locale, t } = useAnalyticsI18n()
  const channels = data?.channels ?? { link: 0, qr: 0 }
  const total = channels.link + channels.qr
  const rows = channelMeta(t).map((channel) => ({
    ...channel,
    count: channels[channel.key],
    pct: total ? Math.round((channels[channel.key] / total) * 100) : 0,
  }))
  const gradientCss = useMemo(() => {
    if (!total) return 'var(--dash-soft)'
    let accumulated = 0
    const stops = rows.map((channel) => {
      const from = accumulated
      accumulated += (channel.count / total) * 100
      return `${channel.color} ${from}% ${accumulated}%`
    })
    return `conic-gradient(${stops.join(', ')})`
  }, [rows, total])
  return (
    <ChannelsContent
      gradientCss={gradientCss}
      loading={loading}
      rows={rows}
      total={total}
      t={t}
      locale={locale}
    />
  )
}

type ChannelRow = { name: string; color: string; count: number; pct: number }

function ChannelsContent({
  gradientCss,
  loading,
  rows,
  total,
  t,
  locale,
}: {
  gradientCss: string
  loading: boolean
  rows: ChannelRow[]
  total: number
  t: TFn
  locale: string
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
      <h3 className="text-[16px] font-extrabold text-[var(--dash-text)]">
        {t('analytics.byChannel')}
      </h3>
      {loading ? (
        <Message>{t('analytics.loading')}</Message>
      ) : total === 0 ? (
        <Message>{t('analytics.noTrafficPeriod')}</Message>
      ) : (
        <ChannelBreakdown
          gradientCss={gradientCss}
          rows={rows}
          total={total}
          t={t}
          locale={locale}
        />
      )}
    </div>
  )
}

function Message({ children }: { children: string }) {
  return (
    <p className="py-6 text-center text-xs font-medium text-[var(--dash-muted)]">
      {children}
    </p>
  )
}

function ChannelBreakdown({
  gradientCss,
  rows,
  total,
  t,
  locale,
}: {
  gradientCss: string
  rows: ChannelRow[]
  total: number
  t: TFn
  locale: string
}) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="relative h-28 w-28 shrink-0 rounded-full"
        style={{ background: gradientCss }}
      >
        <div
          className={[
            'absolute inset-[14px] flex flex-col items-center justify-center',
            'rounded-full bg-[var(--dash-surface)]',
          ].join(' ')}
        >
          <span className="text-[18px] font-black leading-none text-[var(--dash-text)]">
            {fmtInt(total, locale)}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">
            {t('analytics.visits')}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {rows.map((channel) => (
          <ChannelRowItem channel={channel} key={channel.name} />
        ))}
      </div>
    </div>
  )
}

function ChannelRowItem({ channel }: { channel: ChannelRow }) {
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: channel.color }}
      />
      <span className="flex-1 font-semibold text-[var(--dash-text2)]">
        {channel.name}
      </span>
      <span className="font-bold text-[var(--dash-muted)]">{channel.pct}%</span>
    </div>
  )
}
