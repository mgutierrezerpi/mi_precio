import { useEffect, useState, type CSSProperties } from 'react'
import type { LinkTree, LinkTreeLink } from '../../types'
import '../../screens/home/LinkTreeScreen.css'

export interface LinkTreeViewProps {
  data: LinkTree
  preview?: boolean
  publicUrl?: string
  /** The admin preview can use the current tenant logo before the API refreshes. */
  fallbackAvatarUrl?: string | null
}

function LinkTreeIcon({ name, size = 20 }: { name: string; size?: number }) {
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
  const paths: Record<string, React.ReactNode> = {
    bag: <><path d="M6 8.5h12l1 12H5l1-12Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    camera: <><path d="M4 7h4l1.5-2h5L16 7h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" /><circle cx="12" cy="13" r="3.5" /></>,
    calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M7.5 3v4M16.5 3v4M3.5 10h17" /></>,
    chat: <><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-3.1-.6L4 20l1.6-4A7.3 7.3 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    check: <path d="m6.5 12.5 3.5 3.5 7.5-8" />,
    link: <><path d="M9 15 7.5 16.5a3.5 3.5 0 0 1-5-5L5 9" /><path d="m15 9 1.5-1.5a3.5 3.5 0 0 1 5 5L19 15" /><path d="m8 16 8-8" /></>,
    map: <><path d="m9 18-5 3V6l5-3 6 3 5-3v15l-5 3-6-3Z" /><path d="M9 3v15M15 6v15" /></>,
    share: <><path d="M12 15V4" /><path d="m8 8 4-4 4 4" /><path d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.8" r=".8" fill="currentColor" stroke="none" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></>,
    tiktok: <path d="M14 3v10.3a4.3 4.3 0 1 1-3.6-4.25v3.05a1.5 1.5 0 1 0 .8 1.33V3h2.8c.25 2.25 1.55 3.65 3.7 3.9v2.7A7.4 7.4 0 0 1 14 8.55" fill="currentColor" stroke="none" />,
    whatsapp: <><path d="M20.5 11.6a8.45 8.45 0 0 1-12.55 7.4L3.5 20.4l1.45-4.15A8.45 8.45 0 1 1 20.5 11.6Z" /><path d="M8.6 7.7c.17-.4.35-.4.52-.4h.45c.14 0 .33.05.42.33l.66 1.58c.07.18.05.34-.02.48l-.32.48c-.1.12-.2.25-.08.47.12.22.55.9 1.2 1.45.83.72 1.53.95 1.75 1.07.22.12.35.1.48-.06l.6-.7c.13-.16.28-.13.47-.07l1.55.73c.2.1.33.15.38.24.05.1.05.56-.13 1.1-.18.54-1.06 1.03-1.47 1.08-.38.05-.86.18-2.92-.63-2.5-.98-4.1-3.47-4.23-3.63-.12-.16-1-1.33-1-2.54 0-1.2.63-1.8.85-2.04Z" fill="currentColor" stroke="none" /> </>,
  }
  return <svg {...common}>{paths[name] ?? paths.link}</svg>
}

function linkTarget(link: LinkTreeLink, preview: boolean) {
  if (!link.url) return undefined
  if (preview || /^https?:\/\//i.test(link.url)) return '_blank'
  return undefined
}

function emailHref(email: string) {
  return /^mailto:/i.test(email) ? email : `mailto:${email}`
}

function isDarkColor(hex: string) {
  const value = hex.replace('#', '')
  if (!/^[0-9a-f]{6}$/i.test(value)) return false
  const [r, g, b] = [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16))
  return (r * 0.299 + g * 0.587 + b * 0.114) < 145
}

export function LinkTreeView({ data, preview = false, publicUrl, fallbackAvatarUrl }: LinkTreeViewProps) {
  const [toast, setToast] = useState('')
  const links = data.links.filter((link) => link.enabled)
  const avatarUrl = data.avatarUrl || fallbackAvatarUrl
  const darkBackground = isDarkColor(data.backgroundColor)
  const template = data.template === 'editorial' || data.template === 'atelier' ? data.template : 'botanical'
  const shareUrl = publicUrl || window.location.href

  useEffect(() => {
    if (preview) return
    const root = document.documentElement
    const previousColor = root.style.getPropertyValue('--linktree-scrollbar')
    const previousBackground = root.style.getPropertyValue('--linktree-background')
    root.classList.add('linktree-public-document')
    root.style.setProperty('--linktree-scrollbar', data.accentColor)
    root.style.setProperty('--linktree-background', data.backgroundColor)
    return () => {
      root.classList.remove('linktree-public-document')
      if (previousColor) root.style.setProperty('--linktree-scrollbar', previousColor)
      else root.style.removeProperty('--linktree-scrollbar')
      if (previousBackground) root.style.setProperty('--linktree-background', previousBackground)
      else root.style.removeProperty('--linktree-background')
    }
  }, [data.accentColor, data.backgroundColor, preview])

  // Keep the browser tab attached to the public profile being visited instead
  // of inheriting the app's generic title and favicon.
  useEffect(() => {
    if (preview) return

    const previousTitle = document.title
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    const previousHref = favicon?.getAttribute('href') ?? null
    const previousType = favicon?.getAttribute('type') ?? null
    const icon = favicon ?? document.createElement('link')

    if (!favicon) {
      icon.rel = 'icon'
      document.head.appendChild(icon)
    }

    document.title = data.displayName || 'MiPrecio'
    icon.href = avatarUrl || '/miprecio-favicon.png'
    icon.removeAttribute('type')

    return () => {
      document.title = previousTitle
      if (previousHref) icon.href = previousHref
      else icon.removeAttribute('href')
      if (previousType) icon.type = previousType
      else icon.removeAttribute('type')
      if (!favicon) icon.remove()
    }
  }, [avatarUrl, data.displayName, preview])

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      notify('Link copiado')
    } catch {
      notify('Copiá el link desde la barra del navegador')
    }
  }
  const style = {
    '--cream': data.backgroundColor,
    '--lime': data.accentColor,
    '--brand-font': data.font === 'editorial' ? "'Playfair Display', Georgia, serif" : data.font === 'mono' ? "'DM Mono', monospace" : data.font === 'code-pro' ? "'Code Pro', 'DM Sans', Arial, sans-serif" : "'DM Sans', Arial, sans-serif",
  } as CSSProperties

  return (
    <main className={`link-tree-page link-tree-page--${template} link-tree-page--font-${data.font || 'sans'}${preview ? ' link-tree-page--preview' : ''}`} style={style}>
      <div className="link-tree-noise" aria-hidden="true" />
      <div className="link-tree-orb link-tree-orb--top" aria-hidden="true" />
      <div className="link-tree-orb link-tree-orb--bottom" aria-hidden="true" />
      <header className="link-tree-header">
        <div className="link-tree-header-actions">
          <button type="button" className="link-tree-icon-button" aria-label="Copiar link" onClick={() => void copyLink()}>
            <LinkTreeIcon name="copy" size={19} />
          </button>
          {toast && <div className="link-tree-toast" role="status">{toast}</div>}
        </div>
      </header>

      <section className="link-tree-content" aria-labelledby="linktree-profile-name">
        <div className="link-tree-main">
          <div className="link-tree-profile">
          <div className="profile-avatar" aria-hidden={!avatarUrl}>
            {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{data.displayName.slice(0, 2).toUpperCase()}</span>}
          </div>
          <div className="profile-name-row">
            <h1 id="linktree-profile-name">{data.displayName}</h1>
            <span className="verified-badge" aria-hidden="true"><LinkTreeIcon name="check" size={14} /></span>
          </div>
          {data.handle && <p className="profile-handle">{data.handle}</p>}
          {data.bio && <p className="profile-bio">{data.bio}</p>}
          {data.tags.length > 0 && <div className="profile-tags" aria-label="Categorías del negocio">{data.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
        </div>

        <div className="link-tree-links">
          {links.length ? links.map((link, index) => (
            <a
              key={link.id || `${link.title}-${index}`}
              className={`link-card link-card--${link.style}`}
              href={link.url || '#'}
              target={linkTarget(link, preview)}
              rel={linkTarget(link, preview) ? 'noreferrer' : undefined}
              style={{ '--link-delay': `${index * 70}ms` } as CSSProperties}
              onClick={(event) => { if (!link.url) event.preventDefault() }}
            >
              <span className="link-card-icon"><LinkTreeIcon name={link.icon} size={24} /></span>
              <span className="link-card-copy"><strong>{link.title}</strong>{link.description && <small>{link.description}</small>}</span>
              <span className="link-card-arrow"><LinkTreeIcon name="arrow" size={20} /></span>
            </a>
          )) : <div className="link-tree-empty">Agregá tu primer link para verlo acá.</div>}
        </div>

        {(data.locationUrl || data.websiteUrl) && <div className="link-tree-feature-grid">
          {data.locationUrl && <a className="feature-card feature-card--location" href={data.locationUrl} target="_blank" rel="noreferrer">
            <span className="feature-icon-circle"><LinkTreeIcon name="map" size={17} /></span>
            <span className="feature-eyebrow">Encontranos</span>
            <span className="feature-title">Ver ubicación</span>
            <span className="feature-arrow"><LinkTreeIcon name="arrow" size={14} /></span>
          </a>}
          {data.websiteUrl && <a className="feature-card feature-card--website" href={data.websiteUrl} target="_blank" rel="noreferrer">
            <span className="feature-icon-circle"><LinkTreeIcon name="link" size={17} /></span>
            <span className="feature-eyebrow">En internet</span>
            <span className="feature-title">Visitar sitio web</span>
            <span className="feature-arrow"><LinkTreeIcon name="arrow" size={14} /></span>
          </a>}
        </div>}

          <div className="link-tree-socials">
            {data.instagramUrl && <a href={data.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram"><LinkTreeIcon name="instagram" size={16} />Instagram</a>}
            {data.tiktokUrl && <a href={data.tiktokUrl} target="_blank" rel="noreferrer" aria-label="TikTok"><LinkTreeIcon name="tiktok" size={16} />TikTok</a>}
            {data.emailUrl && <a href={emailHref(data.emailUrl)} aria-label="Enviar email"><LinkTreeIcon name="mail" size={16} />Email</a>}
            {data.whatsappUrl && <a href={data.whatsappUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp"><LinkTreeIcon name="whatsapp" size={16} />WhatsApp</a>}
            {data.websiteUrl && <a href={data.websiteUrl} target="_blank" rel="noreferrer" aria-label="Sitio web">Sitio web</a>}
          </div>
        </div>
        <a className={`link-tree-footer${darkBackground ? ' link-tree-footer--dark' : ''}`} href="https://miprecio.app" target="_blank" rel="noreferrer" aria-label="Powered by MiPrecio"><span>Powered by</span><span className="link-tree-footer-mark"><span aria-hidden="true" /></span></a>
      </section>
    </main>
  )
}
