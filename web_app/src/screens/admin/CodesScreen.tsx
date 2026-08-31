import { useEffect, useMemo, useState } from 'react'
import { useStoredQrColor } from '../../hooks/useStoredQrColor'
import { useCatalogT } from '../../lib/i18nDictionaryCatalog'
import { downloadQrPng, QR_COLOR_STORAGE_PREFIX } from '../../lib/qrRender'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectTenant } from '../../store/slices/authSlice'
import { fetchLists, selectLists } from '../../store/slices/menuSlice'
import type { PriceList } from '../../types'
import { CodesCustomizer } from './CodesCustomizer'
import { CodesGrid } from './CodesGrid'
import { CrmLayout } from './crm/CrmLayout'

const FAVICON = '/miprecio-favicon.png'
const QR_COLORS = [
  ['violet', '#7C3AED'], ['black', '#0F172A'], ['blue', '#2563EB'], ['green', '#059669'],
  ['pink', '#DB2777'], ['amber', '#D97706'], ['sky', '#0EA5E9'], ['slate', '#475569'],
].map(([key, value]) => ({ key, value }))

export function CodesScreen() {
  const t = useCatalogT()
  const dispatch = useAppDispatch()
  const tenant = useAppSelector(selectTenant)
  const lists = useAppSelector(selectLists)
  const [search, setSearch] = useState('')
  const [withLogo, setWithLogo] = useState(true)
  const [color, chooseColor] = useStoredQrColor(
    tenant?.id ? `${QR_COLOR_STORAGE_PREFIX}${tenant.id}` : null
  )
  const [copied, setCopied] = useState<string | null>(null)
  useEffect(() => {
    if (tenant?.id) dispatch(fetchLists(tenant.id))
  }, [dispatch, tenant?.id])

  const subdomain = tenant?.subdomain || 'mi-negocio'
  const urlOf = (list: PriceList) => `${window.location.origin}/p/${subdomain}/${list.slug || list.id}`
  const qrUrlOf = (list: PriceList) => `${urlOf(list)}?src=qr`
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return query ? lists.filter((list) => list.name.toLowerCase().includes(query)) : lists
  }, [lists, search])
  const logoUrl = withLogo ? tenant?.logoUrl || FAVICON : null
  const previewUrl = filtered[0]
    ? qrUrlOf(filtered[0])
    : lists[0]
      ? qrUrlOf(lists[0])
      : `${window.location.origin}/p/${subdomain}?src=qr`
  const copy = (list: PriceList) => {
    navigator.clipboard?.writeText(urlOf(list))
    setCopied(list.id)
    setTimeout(() => setCopied(null), 1500)
  }
  const downloadCard = (list: PriceList) => {
    const slug = (list.slug || list.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || list.id
    void downloadQrPng(qrUrlOf(list), `qr-${slug}.png`, { fg: color, logoUrl })
  }

  return <CrmLayout
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
          <h1 className="text-[28px] font-bold leading-none text-[#F8F7FF]">{t('codes.title')}</h1>
          <p className="text-[13px] text-[#9694A6]">{t('codes.subtitle')}</p>
        </div>
      </section>
      <div className="flex w-full flex-col items-stretch gap-5 xl:flex-row xl:items-start">
        <div className="flex w-full flex-1 flex-col gap-4">
          <CodesGrid
            allCount={lists.length}
            color={color}
            copied={copied}
            filtered={filtered}
            logoUrl={logoUrl}
            t={t}
            urlOf={urlOf}
            qrUrlOf={qrUrlOf}
            onCopy={copy}
            onDownload={downloadCard}
          />
        </div>
        <CodesCustomizer
          color={color}
          colors={QR_COLORS}
          hasLists={lists.length > 0}
          logoUrl={logoUrl}
          previewUrl={previewUrl}
          subdomain={subdomain}
          t={t}
          withLogo={withLogo}
          onChooseColor={chooseColor}
          onToggleLogo={() => setWithLogo((current) => !current)}
        />
      </div>
    </main>
  </CrmLayout>
}

export default CodesScreen
