import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { useAppSelector } from '../../store/hooks'
import { selectTenant } from '../../store/slices/authSlice'
import type { Customer, PriceList } from '../../types'
import { localeOf, useT, type TFn } from '../../lib/i18n'
import { Icon, type IconName } from './crm/ui'
import { tone } from './crm/theme'

export function ListRow({
  list,
  canEdit,
  first,
  onEdit,
  onCustomize,
  onTogglePublished,
  onTogglePrincipal,
  onDelete,
  onCopy,
  onQr,
  onOpen,
  onReports,
  onCreateVariant,
  variant = false,
  variantDetail,
}: {
  list: PriceList
  canEdit: boolean
  first?: boolean
  onEdit: () => void
  onCustomize: () => void
  onTogglePublished: () => void
  onTogglePrincipal: () => void
  onDelete: () => void
  onCopy: () => void
  onQr: () => void
  onOpen: () => void
  onReports: () => void
  onCreateVariant?: () => void
  variant?: boolean
  variantDetail?: string
}) {
  const t = useT()
  const tenant = useAppSelector(selectTenant)
  const [copied, setCopied] = useState(false)
  const copy = () => {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className={`flex min-w-0 flex-col gap-3 px-4 py-4 lg:min-w-[680px] lg:flex-row lg:items-center lg:gap-3 lg:px-5 ${variant ? 'border-t border-[var(--dash-divider)] bg-[var(--dash-soft)] lg:py-3' : 'bg-[var(--dash-surface)] lg:py-4'} ${!first ? 'lg:border-t lg:border-[var(--dash-divider)]' : ''}`}
    >
      <div
        className={`relative flex min-w-0 flex-1 items-start gap-3 lg:items-center ${variant ? 'pl-10 lg:pl-12' : ''}`}
      >
        {variant && (
          <span
            aria-hidden="true"
            className="absolute left-3 top-0 h-1/2 w-5 rounded-bl-lg border-b-2 border-l-2 border-[var(--dash-border)]"
          />
        )}
        <span
          className={`flex shrink-0 items-center justify-center ${variant ? 'h-8 w-8 rounded-lg' : 'h-10 w-10 rounded-[10px]'}`}
          style={tone(variant ? 'slate' : 'violet')}
        >
          <Icon name="list-checks" size={variant ? 15 : 19} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {variant && (
            <span className="flex items-center gap-1 whitespace-nowrap text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--dash-link)]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
              {t('pl.variant.main')}
            </span>
          )}
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h4
              className={`min-w-0 whitespace-normal break-words font-bold leading-snug text-[var(--dash-text)] ${variant ? 'text-[14px]' : 'text-base'}`}
            >
              {list.name}
            </h4>
            {variant ? (
              <span className="rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 py-0.5 text-[10px] font-bold text-[var(--dash-text2)]">
                {variantLabel(list, t)}
              </span>
            ) : (
              list.showOnIndex && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={tone('violet')}
                >
                  {t('pl.main')}
                </span>
              )
            )}
          </div>
          {variant &&
            variantDetail &&
            variantDetail !== variantLabel(list, t) && (
              <span className="text-[11px] font-medium text-[var(--dash-muted)]">
                {variantDetail}
              </span>
            )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-x-3 border-t border-[var(--dash-divider)] pt-3 text-xs lg:hidden">
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">
            {t('pl.column.products')}
          </span>
          <span className="font-semibold text-[var(--dash-text2)]">
            {list.itemCount}
          </span>
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">
            {t('pl.column.status')}
          </span>
          <span
            className="inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold"
            style={tone(
              list.published && list.live
                ? 'green'
                : list.published
                  ? 'red'
                  : 'amber'
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {list.published && !list.live
              ? t('pl.status.offline')
              : list.published
                ? t('pl.status.active')
                : t('pl.status.draft')}
          </span>
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--dash-muted)]">
            {t('pl.column.updated')}
          </span>
          <span className="truncate font-medium text-[var(--dash-muted)]">
            {formatListTimeAgo(list.updatedAt, localeOf(tenant?.language))}
          </span>
        </span>
      </div>

      <span
        className={`hidden w-[100px] font-semibold text-[var(--dash-text2)] lg:block ${variant ? 'text-xs' : 'text-sm'}`}
      >
        {list.itemCount}
      </span>
      <span className="hidden w-[110px] lg:block">
        <span
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold"
          style={tone(
            list.published && list.live
              ? 'green'
              : list.published
                ? 'red'
                : 'amber'
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />{' '}
          {list.published && !list.live
            ? t('pl.status.offline')
            : list.published
              ? t('pl.status.active')
              : t('pl.status.draft')}
        </span>
      </span>
      <span className="hidden w-[110px] text-xs font-medium text-[var(--dash-muted)] lg:block">
        {formatListTimeAgo(list.updatedAt, localeOf(tenant?.language))}
      </span>

      <div className="flex w-full shrink-0 items-center justify-end gap-2 border-t border-[var(--dash-divider)] pt-3 lg:w-[144px] lg:border-0 lg:pt-0">
        {list.published && (
          <button
            type="button"
            onClick={copy}
            title={copied ? t('pl.linkCopied') : t('pl.copyPublicLink')}
            aria-label={copied ? t('pl.linkCopied') : t('pl.copyPublicLink')}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[var(--dash-link)] hover:bg-[var(--dash-soft)]"
          >
            <Icon name={copied ? 'circle-check' : 'link-2'} size={15} />
          </button>
        )}
        {list.published && (
          <>
            <button
              type="button"
              onClick={onQr}
              title={t('pl.qrCode')}
              aria-label={t('pl.qrCode')}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
            >
              <Icon name="qr-code" size={15} />
            </button>
            <button
              type="button"
              onClick={onOpen}
              title={t('pl.openPublic')}
              aria-label={t('pl.openPublic')}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
            >
              <Icon name="external-link" size={15} />
            </button>
          </>
        )}
        {canEdit && (
          <RowMenu
            list={list}
            onEdit={onEdit}
            onCustomize={onCustomize}
            onTogglePublished={onTogglePublished}
            onTogglePrincipal={onTogglePrincipal}
            onDelete={onDelete}
            onCreateVariant={onCreateVariant}
            isVariant={variant}
            onReports={onReports}
          />
        )}
      </div>
    </div>
  )
}

function RowMenu({
  list,
  onEdit,
  onCustomize,
  onTogglePublished,
  onTogglePrincipal,
  onDelete,
  onCreateVariant,
  isVariant = false,
  onReports,
}: {
  list: PriceList
  onEdit: () => void
  onCustomize: () => void
  onTogglePublished: () => void
  onTogglePrincipal: () => void
  onDelete: () => void
  onCreateVariant?: () => void
  isVariant?: boolean
  onReports: () => void
}) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const H = isVariant ? 220 : 270

  const toggle = () => {
    if (open) {
      setOpen(false)
      return
    }
    const r = btnRef.current!.getBoundingClientRect()
    const top =
      r.bottom + 6 + H > window.innerHeight ? r.top - H - 6 : r.bottom + 6
    setPos({ top, left: Math.max(8, r.right - 200) })
    setOpen(true)
  }
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (
        btnRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      )
        return
      setOpen(false)
    }
    const close = () => setOpen(false)
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  const act = (fn: () => void) => () => {
    setOpen(false)
    fn()
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-label={t('pl.options')}
        title={t('pl.options')}
        className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
      >
        <Icon name="ellipsis" size={16} />
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: pos.top, left: pos.left, width: 200 }}
            className="dash fixed z-[120] rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-1.5 font-sans shadow-[0_16px_44px_-12px_rgba(15,23,42,0.35)] animate-scale-in"
          >
            <MenuItemBtn
              icon="settings"
              label={t('pl.menu.edit')}
              onClick={act(onEdit)}
            />
            <MenuItemBtn
              icon="paintbrush"
              label="Personalizar plantilla"
              onClick={act(onCustomize)}
            />
            {!isVariant && onCreateVariant && (
              <MenuItemBtn
                icon="list-plus"
                label={t('pl.menu.createVariant')}
                onClick={act(onCreateVariant)}
              />
            )}
            <MenuItemBtn
              icon={list.published ? 'eye' : 'share-2'}
              label={
                list.published ? t('pl.menu.unpublish') : t('pl.menu.publish')
              }
              onClick={act(onTogglePublished)}
            />
            {!isVariant && (
              <MenuItemBtn
                icon="list-checks"
                label={
                  list.showOnIndex
                    ? t('pl.menu.removeMain')
                    : t('pl.menu.makeMain')
                }
                onClick={act(onTogglePrincipal)}
              />
            )}
            <MenuItemBtn
              icon="bar-chart"
              label={t('nav.reports')}
              onClick={act(onReports)}
            />
            <div className="my-1 h-px bg-[var(--dash-divider)]" />
            <MenuItemBtn
              icon="circle-x"
              label={t('pl.menu.delete')}
              onClick={act(onDelete)}
              danger
            />
          </div>,
          document.body
        )}
    </>
  )
}

function MenuItemBtn({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: IconName
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-semibold hover:bg-[var(--dash-soft)] ${danger ? 'text-[#EF4444]' : 'text-[var(--dash-text2)]'}`}
    >
      <Icon name={icon} size={15} /> {label}
    </button>
  )
}

export function variantLabel(list: PriceList, t: TFn): string {
  if (list.variantType === 'customer') return t('pl.variant.customer')
  if (list.variantType === 'promotion') return t('pl.variant.promotion')
  if (list.variantType === 'seasonal') return t('pl.variant.seasonal')
  return t('pl.variant.custom')
}

export function variantDetail(
  list: PriceList,
  customer: Customer | undefined,
  t: TFn
): string {
  const audience = customer
    ? t('pl.variant.customerWithName', { name: customer.name })
    : variantLabel(list, t)
  const date = list.startsAt
    ? ` · ${t('pl.variant.from', { date: new Date(list.startsAt).toLocaleDateString() })}`
    : ''
  const end = list.endsAt
    ? ` ${t('pl.variant.to', { date: new Date(list.endsAt).toLocaleDateString() })}`
    : ''
  return `${audience}${date}${end}`
}

export function DashField({
  label,
  wide = false,
  children,
}: {
  label: string
  wide?: boolean
  children: React.ReactNode
}) {
  return (
    <label
      className={`flex min-w-0 flex-col gap-1.5 ${wide ? 'sm:col-span-2' : ''}`}
    >
      <span className="text-xs font-bold text-[var(--dash-text2)]">
        {label}
      </span>
      {children}
    </label>
  )
}

function formatListTimeAgo(iso: string, locale: string): string {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  if (seconds < 60) return formatter.format(0, 'second')
  if (seconds < 3600)
    return formatter.format(-Math.floor(seconds / 60), 'minute')
  if (seconds < 86400)
    return formatter.format(-Math.floor(seconds / 3600), 'hour')
  return formatter.format(-Math.floor(seconds / 86400), 'day')
}
