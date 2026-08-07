import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectTenant } from '../../store/slices/authSlice'
import { fetchLists, selectLists } from '../../store/slices/menuSlice'
import type { PriceList } from '../../types'
import { CrmLayout } from './crm/CrmLayout'
import { Icon } from './crm/ui'
import { QrCode } from './crm/QrCode'
import { gradient } from './crm/theme'
import { useCatalogT } from '../../lib/i18nDictionaryCatalog'
import {
  downloadQrPng,
  downloadQrSvg,
  QR_COLOR_STORAGE_PREFIX,
  DEFAULT_QR_COLOR,
} from '../../lib/qrRender'

const FAVICON = '/miprecio-favicon.png'

const QR_COLORS: { key: string; value: string }[] = [
  { key: 'violet', value: '#7C3AED' },
  { key: 'black', value: '#0F172A' },
  { key: 'blue', value: '#2563EB' },
  { key: 'green', value: '#059669' },
  { key: 'pink', value: '#DB2777' },
  { key: 'amber', value: '#D97706' },
  { key: 'sky', value: '#0EA5E9' },
  { key: 'slate', value: '#475569' },
]

export function CodesScreen() {
  const t = useCatalogT()
  const dispatch = useAppDispatch()
  const tenant = useAppSelector(selectTenant)
  const lists = useAppSelector(selectLists)

  const [search, setSearch] = useState('')
  const [color, setColor] = useState(DEFAULT_QR_COLOR)
  const [withLogo, setWithLogo] = useState(true)
  const colorStorageKey = tenant?.id
    ? `${QR_COLOR_STORAGE_PREFIX}${tenant.id}`
    : null
  const chooseColor = (value: string) => {
    setColor(value)
    if (colorStorageKey) localStorage.setItem(colorStorageKey, value)
  }

  useEffect(() => {
    if (!colorStorageKey) return
    const saved = localStorage.getItem(colorStorageKey)
    if (saved && QR_COLORS.some((c) => c.value === saved)) setColor(saved)
  }, [colorStorageKey])
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (tenant?.id) dispatch(fetchLists(tenant.id))
  }, [dispatch, tenant?.id])

  const sub = tenant?.subdomain || 'mi-negocio'
  const urlOf = (l: PriceList) =>
    `${window.location.origin}/p/${sub}/${l.slug || l.id}`
  // Codes embed ?src=qr so scans are tracked separately from shared/direct links.
  const qrUrlOf = (l: PriceList) => `${urlOf(l)}?src=qr`

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? lists.filter((l) => l.name.toLowerCase().includes(q)) : lists
  }, [lists, search])

  // Use the business logo in the QR when one is configured. Keep the MiPrecio
  // mark as a fallback so the center still has a recognizable brand.
  const logoUrl = withLogo ? tenant?.logoUrl || FAVICON : null
  const previewUrl = filtered[0]
    ? qrUrlOf(filtered[0])
    : lists[0]
      ? qrUrlOf(lists[0])
      : `${window.location.origin}/p/${sub}?src=qr`

  const copy = (l: PriceList) => {
    navigator.clipboard?.writeText(urlOf(l))
    setCopied(l.id)
    setTimeout(() => setCopied(null), 1500)
  }
  const slugOf = (l: PriceList) =>
    (l.slug || l.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || l.id
  const downloadCard = (l: PriceList) => {
    void downloadQrPng(qrUrlOf(l), `qr-${slugOf(l)}.png`, {
      fg: color,
      logoUrl,
    })
  }

  return (
    <CrmLayout
      active={t('codes.title')}
      title={t('codes.title')}
      subtitle={t('codes.subtitle')}
      hideContext
      searchPlaceholder={t('codes.search')}
      searchValue={search}
      onSearchChange={setSearch}
    >
      <main className="flex min-h-full flex-col gap-6 px-4 py-6 md:px-10 md:py-8 xl:min-w-[900px]">
        <section className="flex min-h-[56px] items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] font-bold leading-none text-[#F8F7FF]">
              {t('codes.title')}
            </h1>
            <p className="text-[13px] text-[#9694A6]">
              {t('codes.subtitle')}
            </p>
          </div>
        </section>
        <div className="flex items-start flex-col gap-5 xl:flex-row">
          {/* QR grid */}
          <div className="flex flex-1 flex-col gap-4">
            {filtered.length === 0 ? (
              <div className="flex min-h-[208px] flex-col items-center justify-center gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 text-center">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-[var(--dash-link)]"
                  style={{ backgroundColor: 'var(--tone-violet-bg)' }}
                >
                  <Icon name="qr-code" size={24} />
                </span>
                <p className="text-sm font-semibold text-[var(--dash-text)]">
                  {lists.length === 0
                    ? t('codes.createList')
                    : t('codes.noResults')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((l) => (
                  <div
                    key={l.id}
                    className="flex min-w-0 flex-col gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3"
                  >
                    <div className="flex min-w-0 items-center justify-center text-center">
                      <span className="block w-full whitespace-normal break-words text-[14px] font-bold leading-snug text-[var(--dash-text)]">
                        {l.name}
                      </span>
                    </div>
                    <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-lg bg-white p-1">
                      <QrCode
                        value={qrUrlOf(l)}
                        size={128}
                        margin={2}
                        fg={color}
                        logoUrl={logoUrl}
                        className="!h-full !w-full rounded-lg object-contain"
                      />
                    </div>
                    <div className="flex min-w-0 flex-col items-center gap-0.5 text-center">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{
                          backgroundColor: l.published
                            ? 'var(--tone-green-bg)'
                            : 'var(--tone-amber-bg)',
                          color: l.published
                            ? 'var(--tone-green-fg)'
                            : 'var(--tone-amber-fg)',
                        }}
                      >
                        {l.published ? t('codes.active') : t('codes.draft')}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CardBtn
                        icon="download"
                        title={t('codes.downloadPng')}
                        onClick={() => downloadCard(l)}
                      />
                      <CardBtn
                        icon="share-2"
                        title={t('codes.openList')}
                        onClick={() => window.open(urlOf(l), '_blank')}
                      />
                      <CardBtn
                        icon={copied === l.id ? 'circle-check' : 'copy'}
                        title={t('codes.copyLink')}
                        onClick={() => copy(l)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customization panel */}
          <div className="flex w-full shrink-0 flex-col gap-4 self-start rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 xl:-mt-2 xl:sticky xl:top-6 lg:w-[300px]">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-extrabold text-[var(--dash-text)]">
                {t('codes.customize')}
              </h3>
              <p className="text-xs font-medium text-[var(--dash-muted)]">
                {t('codes.customizeHelp')}
              </p>
            </div>
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-lg bg-white p-1">
              <QrCode
                value={previewUrl}
                size={128}
                margin={2}
                fg={color}
                logoUrl={logoUrl}
                className="!h-full !w-full rounded-lg object-contain"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[var(--dash-text2)]">
                {t('codes.color')}
              </span>
              <div className="flex flex-wrap gap-2">
                {QR_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => chooseColor(c.value)}
                    aria-label={t(`codes.color.${c.key}`)}
                    title={t(`codes.color.${c.key}`)}
                    className={`h-7 w-7 rounded-lg ${color === c.value ? 'ring-2 ring-offset-2 ring-offset-[var(--dash-surface)] ring-[var(--dash-link)]' : ''}`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between overflow-hidden rounded-[12px] border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3 py-3">
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[var(--dash-text)]">
                  {t('codes.logoCenter')}
                </span>
                <span className="text-[11px] font-medium text-[var(--dash-muted)]">
                  {t('codes.logoHelp')}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={withLogo}
                onClick={() => setWithLogo((v) => !v)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${withLogo ? 'bg-[#10B981]' : 'bg-[var(--dash-border)]'}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${withLogo ? 'left-[22px]' : 'left-0.5'}`}
                />
              </button>
            </div>
            <span
              className="dash-tooltip block"
              data-tooltip={lists.length === 0 ? t('codes.downloadDisabled') : ''}
            >
              <button
                type="button"
                disabled={lists.length === 0}
                onClick={() =>
                  void downloadQrPng(previewUrl, `qr-${sub}.png`, {
                    fg: color,
                    logoUrl,
                  })
                }
                className={`flex h-11 w-full items-center justify-center gap-2 rounded-[12px] text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 ${gradient}`}
              >
                <Icon name="download" size={16} /> {t('codes.downloadPng')}
              </button>
            </span>
            <span
              className="dash-tooltip block"
              data-tooltip={lists.length === 0 ? t('codes.downloadDisabled') : ''}
            >
              <button
                type="button"
                disabled={lists.length === 0}
                onClick={() =>
                  downloadQrSvg(previewUrl, `qr-${sub}.svg`, { fg: color })
                }
                className="flex h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-[var(--dash-border)] bg-[var(--dash-surface)] text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="download" size={15} /> {t('codes.downloadSvg')}
              </button>
            </span>
          </div>
        </div>
      </main>
    </CrmLayout>
  )
}

function CardBtn({
  icon,
  title,
  onClick,
}: {
  icon: Parameters<typeof Icon>[0]['name']
  title: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
    >
      <Icon name={icon} size={16} />
    </button>
  )
}

export default CodesScreen
