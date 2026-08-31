import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './LinkTreeScreen.css'

type IconName =
  | 'arrow'
  | 'bag'
  | 'calendar'
  | 'chat'
  | 'copy'
  | 'external'
  | 'instagram'
  | 'map'
  | 'menu'
  | 'spark'
  | 'x'

const links = [
  {
    title: 'Catálogo + precios',
    description: 'Piezas disponibles para entrega inmediata',
    icon: 'bag' as IconName,
    className: 'link-card--featured',
    action: 'catalog',
  },
  {
    title: 'Reservá una visita al taller',
    description: 'Coordinemos un horario para conocernos',
    icon: 'calendar' as IconName,
    className: 'link-card--dark',
    action: 'booking',
  },
  {
    title: 'Escribinos por WhatsApp',
    description: 'Respondemos de lunes a viernes · 10 a 18 h',
    icon: 'chat' as IconName,
    className: 'link-card--light',
    action: 'whatsapp',
  },
]

const priceItems = [
  ['Florero Nube', 'UYU 1.850'],
  ['Set de 2 tazas', 'UYU 1.290'],
  ['Lámpara Cónica', 'UYU 4.600'],
  ['Bandeja Alba', 'UYU 980'],
]

const profileLinks = {
  catalog: '/p/guti',
  journal: '/m/guti/wild_stem_journal',
  booking: 'https://calendar.google.com/calendar/r/eventedit?text=Visita%20al%20taller%20Casa%20Nativa&location=Montevideo',
  whatsapp: 'https://wa.me/59800000000?text=Hola%20Casa%20Nativa%2C%20quiero%20consultar%20por%20una%20visita.',
  instagram: 'https://instagram.com/casanativa.estudio',
  location: 'https://maps.google.com/?q=Montevideo',
}

export function LinkTreeScreen() {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!isCatalogOpen) return
    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsCatalogOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isCatalogOpen])

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      notify('Link copiado al portapapeles')
    } catch {
      notify('Copiá el link desde la barra del navegador')
    }
  }

  const shareProfile = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Casa Nativa · objetos para habitar',
          text: 'Conocé Casa Nativa y sus piezas hechas a mano.',
          url: window.location.href,
        })
        return
      }
      await copyLink()
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      notify('No pudimos compartir el perfil')
    }
  }

  return (
    <main className="link-tree-page">
      <div className="link-tree-noise" aria-hidden="true" />
      <div className="link-tree-orb link-tree-orb--top" aria-hidden="true" />
      <div className="link-tree-orb link-tree-orb--bottom" aria-hidden="true" />

      <header className="link-tree-header">
        <a className="link-tree-brand" href="/" aria-label="Volver a MiPrecio">
          <span className="link-tree-brand-mark">m/</span>
          <span>mi precio</span>
        </a>
        <div className="link-tree-header-actions">
          <span className="link-tree-header-note">Vista previa de marca</span>
          <button
            type="button"
            className="link-tree-icon-button"
            aria-label="Compartir perfil"
            onClick={() => void shareProfile()}
          >
            <Icon name="external" size={17} />
          </button>
          <button
            type="button"
            className="link-tree-menu-button"
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <Icon name={isMenuOpen ? 'x' : 'menu'} size={18} />
          </button>
        </div>
        {isMenuOpen && (
          <div className="link-tree-share-menu">
            <button type="button" onClick={() => void shareProfile()}>
              <Icon name="external" size={15} /> Compartir perfil
            </button>
            <button type="button" onClick={() => void copyLink()}>
              <Icon name="copy" size={15} /> Copiar link
            </button>
          </div>
        )}
      </header>

      <section className="link-tree-content" aria-labelledby="profile-name">
        <div className="link-tree-profile">
          <div className="profile-avatar" aria-hidden="true">
            <span>CN</span>
            <div className="profile-avatar-leaf profile-avatar-leaf--one" />
            <div className="profile-avatar-leaf profile-avatar-leaf--two" />
          </div>
          <div className="profile-name-row">
            <h1 id="profile-name">Casa Nativa</h1>
            <span className="verified-badge" title="Perfil verificado">
              <Icon name="spark" size={11} />
            </span>
          </div>
          <p className="profile-handle">@casanativa.estudio</p>
          <p className="profile-bio">
            Objetos para habitar despacio.
            <br />
            Hechos a mano en Montevideo <span aria-hidden="true">✳</span>
          </p>
          <div className="profile-tags" aria-label="Categorías del negocio">
            <span>cerámica</span>
            <span>interiorismo</span>
            <span>hecho a mano</span>
          </div>
        </div>

        <div className="link-tree-links">
          {links.map((link, index) => (
            <button
              type="button"
              key={link.title}
              className={`link-card ${link.className}`}
              style={{ '--link-delay': `${index * 70}ms` } as React.CSSProperties}
              onClick={() => {
                if (link.action === 'catalog') setIsCatalogOpen(true)
                else if (link.action === 'booking') window.open(profileLinks.booking, '_blank', 'noopener,noreferrer')
                else window.open(profileLinks.whatsapp, '_blank', 'noopener,noreferrer')
              }}
            >
              <span className="link-card-icon"><Icon name={link.icon} size={20} /></span>
              <span className="link-card-copy">
                <strong>{link.title}</strong>
                <small>{link.description}</small>
              </span>
              <span className="link-card-arrow"><Icon name="arrow" size={18} /></span>
            </button>
          ))}
        </div>

        <div className="link-tree-feature-grid">
          <Link
            to={profileLinks.journal}
            className="feature-card feature-card--journal"
          >
            <span className="feature-eyebrow">Diario de taller <Icon name="arrow" size={13} /></span>
            <span className="feature-title">Entre barro,
              <br /> fuego y calma.</span>
            <span className="feature-stamp">N° 04</span>
          </Link>
          <a
            className="feature-card feature-card--location"
            href={profileLinks.location}
            target="_blank"
            rel="noreferrer"
          >
            <span className="feature-icon-circle"><Icon name="map" size={18} /></span>
            <span className="feature-eyebrow">Encontranos</span>
            <span className="feature-title">Cordón · Montevideo</span>
            <span className="feature-arrow"><Icon name="external" size={14} /></span>
          </a>
        </div>

        <div className="link-tree-socials">
          <a href={profileLinks.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Icon name="instagram" size={20} /></a>
          <a href={profileLinks.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp"><Icon name="chat" size={19} /></a>
          <button type="button" onClick={() => void copyLink()} aria-label="Copiar link"><Icon name="copy" size={18} /></button>
        </div>
        <p className="link-tree-footer">Un link. Todo tu negocio. <span>✳</span></p>
      </section>

      {isCatalogOpen && (
        <div className="catalog-modal-backdrop" role="presentation" onClick={() => setIsCatalogOpen(false)}>
          <section
            className="catalog-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="catalog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="catalog-modal-topline">
              <span>Casa Nativa / 2026</span>
              <button type="button" onClick={() => setIsCatalogOpen(false)} aria-label="Cerrar catálogo"><Icon name="x" size={18} /></button>
            </div>
            <div className="catalog-modal-heading">
              <span className="catalog-kicker">Piezas disponibles</span>
              <h2 id="catalog-title">Catálogo <em>de invierno.</em></h2>
              <p>Precios actualizados · Retiro en taller o envíos a todo el país</p>
            </div>
            <div className="catalog-items">
              {priceItems.map(([name, price], index) => (
                <div className="catalog-item" key={name}>
                  <span className={`catalog-item-art catalog-item-art--${index + 1}`} aria-hidden="true" />
                  <span><strong>{name}</strong><small>Edición limitada · hecho a mano</small></span>
                  <b>{price}</b>
                </div>
              ))}
            </div>
            <Link to={profileLinks.catalog} className="catalog-cta" onClick={() => setIsCatalogOpen(false)}>
              Ver lista completa <Icon name="arrow" size={16} />
            </Link>
          </section>
        </div>
      )}

      {toast && <div className="link-tree-toast" role="status">{toast}</div>}
    </main>
  )
}

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    bag: <><path d="M6 8.5h12l1 12H5l1-12Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M7.5 3v4M16.5 3v4M3.5 10h17" /></>,
    chat: <><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-3.1-.6L4 20l1.6-4A7.3 7.3 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>,
    copy: <><rect x="8" y="8" width="11" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2" /></>,
    external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></>,
    instagram: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.6h.01" /></>,
    map: <><path d="m9 18-5 3V6l5-3 6 3 5-3v15l-5 3-6-3Z" /><path d="M9 3v15M15 6v15" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    spark: <><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" /><path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z" /></>,
    x: <><path d="m6 6 12 12M18 6 6 18" /></>,
  }

  return <svg {...common}>{paths[name]}</svg>
}
