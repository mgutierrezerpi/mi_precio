import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectTenant } from '../../store/slices/authSlice'
import { fetchLists, selectLists } from '../../store/slices/menuSlice'
import type { PriceList } from '../../types'
import { CrmLayout } from './crm/CrmLayout'
import { Icon } from './crm/ui'
import { QrCode } from './crm/QrCode'
import { gradient } from './crm/theme'
import { downloadQrPng, downloadQrSvg } from '../../lib/qrRender'

const FAVICON = '/miprecio-favicon.png'

const QR_COLORS: { name: string; value: string }[] = [
  { name: 'Violeta', value: '#7C3AED' },
  { name: 'Negro', value: '#0F172A' },
  { name: 'Azul', value: '#2563EB' },
  { name: 'Verde', value: '#059669' },
  { name: 'Rosa', value: '#DB2777' },
  { name: 'Ámbar', value: '#D97706' },
  { name: 'Cielo', value: '#0EA5E9' },
  { name: 'Pizarra', value: '#475569' },
]

export function CodesScreen() {
  const dispatch = useAppDispatch()
  const tenant = useAppSelector(selectTenant)
  const lists = useAppSelector(selectLists)

  const [search, setSearch] = useState('')
  const [color, setColor] = useState(QR_COLORS[0].value)
  const [withLogo, setWithLogo] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (tenant?.id) dispatch(fetchLists(tenant.id))
  }, [dispatch, tenant?.id])

  const sub = tenant?.subdomain || 'mi-negocio'
  const urlOf = (l: PriceList) => `${window.location.origin}/p/${sub}/${l.slug || l.id}`
  // Codes embed ?src=qr so scans are tracked separately from shared/direct links.
  const qrUrlOf = (l: PriceList) => `${urlOf(l)}?src=qr`

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? lists.filter((l) => l.name.toLowerCase().includes(q)) : lists
  }, [lists, search])

  const logoUrl = withLogo ? FAVICON : null
  const previewUrl = filtered[0] ? qrUrlOf(filtered[0]) : lists[0] ? qrUrlOf(lists[0]) : `${window.location.origin}/p/${sub}?src=qr`

  const copy = (l: PriceList) => { navigator.clipboard?.writeText(urlOf(l)); setCopied(l.id); setTimeout(() => setCopied(null), 1500) }
  const slugOf = (l: PriceList) => (l.slug || l.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || l.id
  const downloadCard = (l: PriceList) => { void downloadQrPng(qrUrlOf(l), `qr-${slugOf(l)}.png`, { fg: color, logoUrl }) }

  return (
    <CrmLayout
      active="Códigos QR"
      title="Códigos QR"
      subtitle="Compartí tu catálogo con un escaneo."
      hideContext
      searchPlaceholder="Buscar QR…"
      searchValue={search}
      onSearchChange={setSearch}
    >
      <main className="flex min-h-full flex-col gap-4 px-4 py-6 md:px-10 md:py-8 xl:min-w-[900px]">
        <section className="flex min-h-[60px] items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] font-bold leading-none text-[#F8F7FF]">Códigos QR</h1>
            <p className="text-[13px] text-[#9694A6]">Compartí tu catálogo con un escaneo.</p>
          </div>
        </section>
        <div className="flex flex-col gap-4 xl:flex-row">
        {/* QR grid */}
        <div className="flex flex-1 flex-col gap-4">
          {filtered.length === 0 ? (
            <div className="flex min-h-[208px] flex-col items-center justify-center gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-[var(--dash-link)]" style={{ backgroundColor: 'var(--tone-violet-bg)' }}><Icon name="qr-code" size={24} /></span>
              <p className="text-sm font-semibold text-[var(--dash-text)]">{lists.length === 0 ? 'Creá una lista para generar su QR' : 'Sin resultados'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((l) => (
                <div key={l.id} className="flex flex-col gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
                  <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-2xl bg-white p-2">
                    <QrCode value={qrUrlOf(l)} size={128} fg={color} logoUrl={logoUrl} className="h-full w-full object-contain" />
                  </div>
                  <div className="flex flex-col items-center gap-0.5 text-center">
                    <span className="truncate text-[14px] font-bold text-[var(--dash-text)]">{l.name}</span>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: l.published ? 'var(--tone-green-bg)' : 'var(--tone-amber-bg)', color: l.published ? 'var(--tone-green-fg)' : 'var(--tone-amber-fg)' }}>{l.published ? 'Activa' : 'Borrador'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CardBtn icon="download" title="Descargar PNG" onClick={() => downloadCard(l)} />
                    <CardBtn icon="share-2" title="Abrir lista" onClick={() => window.open(urlOf(l), '_blank')} />
                    <CardBtn icon={copied === l.id ? 'circle-check' : 'copy'} title="Copiar link" onClick={() => copy(l)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customization panel */}
        <div className="flex w-full shrink-0 flex-col gap-4 self-start rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 lg:w-[300px]">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-extrabold text-[var(--dash-text)]">Personalizá tu QR</h3>
            <p className="text-xs font-medium text-[var(--dash-muted)]">El estilo se aplica a todos tus códigos.</p>
          </div>
          <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-2xl bg-white p-3">
            <QrCode value={previewUrl} size={150} fg={color} logoUrl={logoUrl} className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[var(--dash-text2)]">Color</span>
            <div className="flex flex-wrap gap-2">
              {QR_COLORS.map((c) => (
                <button key={c.value} type="button" onClick={() => setColor(c.value)} aria-label={c.name} title={c.name} className={`h-7 w-7 rounded-lg ${color === c.value ? 'ring-2 ring-offset-2 ring-offset-[var(--dash-surface)] ring-[var(--dash-link)]' : ''}`} style={{ backgroundColor: c.value }} />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 py-3">
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[var(--dash-text)]">Logo en el centro</span>
              <span className="text-[11px] font-medium text-[var(--dash-muted)]">Mostrá tu marca en el QR.</span>
            </div>
            <button type="button" role="switch" aria-checked={withLogo} onClick={() => setWithLogo((v) => !v)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${withLogo ? 'bg-[#10B981]' : 'bg-[var(--dash-border)]'}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${withLogo ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
          <span className="dash-tooltip block" data-tooltip={lists.length === 0 ? 'Creá una lista para habilitar la descarga del QR.' : ''}>
            <button type="button" disabled={lists.length === 0} onClick={() => void downloadQrPng(previewUrl, `qr-${sub}.png`, { fg: color, logoUrl })} className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 ${gradient}`}>
              <Icon name="download" size={16} /> Descargar PNG
            </button>
          </span>
          <span className="dash-tooltip block" data-tooltip={lists.length === 0 ? 'Creá una lista para habilitar la descarga del QR.' : ''}>
            <button type="button" disabled={lists.length === 0} onClick={() => downloadQrSvg(previewUrl, `qr-${sub}.svg`, { fg: color })} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)] disabled:cursor-not-allowed disabled:opacity-40">
              <Icon name="download" size={15} /> Descargar SVG
            </button>
          </span>
        </div>
        </div>
      </main>
    </CrmLayout>
  )
}

function CardBtn({ icon, title, onClick }: { icon: Parameters<typeof Icon>[0]['name']; title: string; onClick?: () => void }) {
  return (
    <button type="button" title={title} onClick={onClick} className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]">
      <Icon name={icon} size={16} />
    </button>
  )
}

export default CodesScreen
