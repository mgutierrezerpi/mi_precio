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
import { markQrShared } from '../../lib/onboardingTour'
import {
  downloadQrPosterPng,
  downloadQrPosterSvg,
  type PosterRequest,
} from '../../lib/exportQrPoster'
import { POSTER_QR_COLOR } from '../../lib/qrPosterSvg'

export function CodesScreen() {
  const t = useCatalogT()
  const dispatch = useAppDispatch()
  const tenant = useAppSelector(selectTenant)
  const lists = useAppSelector(selectLists)

  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [busy, setBusy] = useState<'png' | 'svg' | null>(null)

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

  const previewUrl = filtered[0]
    ? qrUrlOf(filtered[0])
    : lists[0]
      ? qrUrlOf(lists[0])
      : `${window.location.origin}/p/${sub}?src=qr`

  const copy = (l: PriceList) => {
    navigator.clipboard?.writeText(urlOf(l))
    markQrShared(tenant?.id)
    setCopied(l.id)
    setTimeout(() => setCopied(null), 1500)
  }
  const slugOf = (l: PriceList) =>
    (l.slug || l.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || l.id
  /** Every download is the poster now: a bare code is not what a shop tapes to
   *  its counter. PNG and SVG are two ways to take the same sheet — the SVG is
   *  the vector a print shop wants, the PNG is what goes into WhatsApp.
   *
   *  The sheet carries **our** brand and nothing of the shop's. It hangs at a
   *  counter where strangers see it every day, so it works as advertising for
   *  MiPrecio — the same reason a Mercado Pago sticker is Mercado Pago yellow.
   *  Which list it opens lives in the code and in the file name, not on the
   *  paper: the customer is already standing in the shop. */
  const posterFor = (l: PriceList): PosterRequest | null => {
    if (!tenant) return null
    return {
      value: qrUrlOf(l),
      headline: t('codes.posterHeadline'),
      footer: t('codes.posterFooter'),
      fileName: `qr-${slugOf(l)}`,
    }
  }

  const download = (l: PriceList | null, as: 'png' | 'svg') => {
    const request = l && posterFor(l)
    if (!request) return
    markQrShared(tenant?.id)
    setBusy(as)
    const run = as === 'png' ? downloadQrPosterPng : downloadQrPosterSvg
    void run(request)
      .catch((err) => console.error('[qr-poster] export failed', err))
      .finally(() => setBusy(null))
  }

  // Which list the big preview and its downloads are showing.
  const previewList = filtered[0] ?? lists[0] ?? null

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
                        fg={POSTER_QR_COLOR}
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
                        onClick={() => download(l, 'png')}
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
                {t('codes.posterTitle')}
              </h3>
              <p className="text-xs font-medium text-[var(--dash-muted)]">
                {t('codes.posterHelp')}
              </p>
            </div>
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-lg bg-white p-1">
              <QrCode
                value={previewUrl}
                size={128}
                margin={2}
                fg={POSTER_QR_COLOR}
                className="!h-full !w-full rounded-lg object-contain"
              />
            </div>
            {/* Both downloads are the same A4 poster in two formats: the
                SVG is the vector a print shop wants, the PNG is what goes into
                a WhatsApp. Neither hands over a bare code any more. */}
            <span
              className="dash-tooltip block"
              data-tooltip={lists.length === 0 ? t('codes.downloadDisabled') : ''}
            >
              <button
                type="button"
                disabled={lists.length === 0 || busy !== null}
                onClick={() => download(previewList, 'png')}
                className={`flex h-11 w-full items-center justify-center gap-2 rounded-[12px] text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 ${gradient}`}
              >
                <Icon name="download" size={16} />
                {busy === 'png' ? t('codes.posterWorking') : t('codes.downloadPng')}
              </button>
            </span>
            <span
              className="dash-tooltip block"
              data-tooltip={lists.length === 0 ? t('codes.downloadDisabled') : ''}
            >
              <button
                type="button"
                disabled={lists.length === 0 || busy !== null}
                onClick={() => download(previewList, 'svg')}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-[var(--dash-border)] bg-[var(--dash-surface)] text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="download" size={15} />
                {busy === 'svg' ? t('codes.posterWorking') : t('codes.downloadSvg')}
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
