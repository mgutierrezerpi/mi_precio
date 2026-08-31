import { Link } from 'react-router-dom'
import type { MarketplaceBusiness } from '../../types'
import { Icon } from '../admin/crm/ui'
import { tone } from '../admin/crm/theme'

const CARD_CLASS = [
  'group flex min-h-52 flex-col rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4',
  'transition hover:border-[var(--dash-link)] hover:shadow-[0_12px_28px_-18px_rgba(15,23,42,0.45)]',
].join(' ')
const ADDRESS_CLASS = [
  'mt-3 inline-flex min-w-0 items-center gap-1 truncate text-xs font-semibold text-[var(--dash-muted)]',
  'hover:text-[var(--dash-link)]',
].join(' ')
const CONTACT_CLASS = [
  'inline-flex items-center gap-1 rounded-full border border-[var(--dash-border)] bg-[var(--dash-soft)]',
  'px-2.5 py-1 text-[11px] font-bold text-[var(--dash-link)] hover:border-[var(--dash-link)]',
].join(' ')

export function MarketplaceBusinessCard({
  business,
}: {
  business: MarketplaceBusiness
}) {
  const distance = formatDistance(business.distanceKm)

  return (
    <div className={CARD_CLASS}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {business.logoUrl ? (
            <img
              src={business.logoUrl}
              alt=""
              className="h-12 w-12 rounded-xl border border-[var(--dash-border)] object-cover"
            />
          ) : (
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-extrabold"
              style={tone('violet')}
            >
              {business.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-extrabold text-[var(--dash-text)]">
              {business.name}
            </h2>
            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[var(--dash-muted)]">
              <Icon name="link-2" size={12} /> @{business.subdomain}
            </span>
          </div>
        </div>
        {distance && (
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={tone('green')}
          >
            {distance}
          </span>
        )}
      </div>
      <p className="mt-5 line-clamp-3 text-[13px] font-medium leading-5 text-[var(--dash-text2)]">
        {business.description || 'Consultá su catálogo y precios actualizados.'}
      </p>
      {business.address && <Address address={business.address} />}
      {(business.whatsappUrl ||
        business.websiteUrl ||
        business.instagramUrl) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {business.whatsappUrl && (
            <ContactLink href={business.whatsappUrl} label="WhatsApp" />
          )}
          {business.websiteUrl && (
            <ContactLink href={business.websiteUrl} label="Web" />
          )}
          {business.instagramUrl && (
            <ContactLink href={business.instagramUrl} label="Instagram" />
          )}
        </div>
      )}
      <div className="mt-auto pt-4">
        <Link
          to={`/p/${business.subdomain}`}
          className="flex items-center justify-between border-t border-[var(--dash-divider)] pt-4 text-[13px] font-bold text-[var(--dash-link)]"
        >
          Ver catálogo{' '}
          <Icon
            name="external-link"
            size={15}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </div>
  )
}

function Address({ address }: { address: string }) {
  const href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  return (
    <a href={href} target="_blank" rel="noreferrer" className={ADDRESS_CLASS}>
      <Icon name="link-2" size={12} className="shrink-0" />
      <span className="truncate">{address}</span>
    </a>
  )
}

function ContactLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={CONTACT_CLASS}>
      <Icon name="link-2" size={11} /> {label}
    </a>
  )
}

function formatDistance(distanceKm: number | null) {
  if (distanceKm == null) return null
  return distanceKm < 1
    ? `${Math.round(distanceKm * 1000)} m`
    : `${distanceKm.toFixed(1)} km`
}
