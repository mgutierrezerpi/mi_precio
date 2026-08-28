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
    calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M7.5 3v4M16.5 3v4M3.5 10h17" /></>,
    chat: <><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-3.1-.6L4 20l1.6-4A7.3 7.3 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    check: <path d="m6.5 12.5 3.5 3.5 7.5-8" />,
    link: <><path d="M9 15 7.5 16.5a3.5 3.5 0 0 1-5-5L5 9" /><path d="m15 9 1.5-1.5a3.5 3.5 0 0 1 5 5L19 15" /><path d="m8 16 8-8" /></>,
    map: <><path d="m9 18-5 3V6l5-3 6 3 5-3v15l-5 3-6-3Z" /><path d="M9 3v15M15 6v15" /></>,
    share: <><path d="M12 15V4" /><path d="m8 8 4-4 4 4" /><path d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.8" r=".8" fill="currentColor" stroke="none" /></>,
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
            <LinkTreeIcon name="copy" size={17} />
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
            <span className="verified-badge" aria-hidden="true"><LinkTreeIcon name="check" size={12} /></span>
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
              <span className="link-card-icon"><LinkTreeIcon name={link.icon} size={20} /></span>
              <span className="link-card-copy"><strong>{link.title}</strong>{link.description && <small>{link.description}</small>}</span>
              <span className="link-card-arrow"><LinkTreeIcon name="arrow" size={18} /></span>
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
            {data.instagramUrl && <a href={data.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram"><LinkTreeIcon name="instagram" size={14} />Instagram</a>}
            {data.tiktokUrl && <a href={data.tiktokUrl} target="_blank" rel="noreferrer" aria-label="TikTok">TikTok</a>}
            {data.emailUrl && <a href={emailHref(data.emailUrl)} aria-label="Enviar email">Email</a>}
            {data.whatsappUrl && <a href={data.whatsappUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp">WhatsApp</a>}
            {data.websiteUrl && <a href={data.websiteUrl} target="_blank" rel="noreferrer" aria-label="Sitio web">Sitio web</a>}
          </div>
        </div>
        <a className={`link-tree-footer${darkBackground ? ' link-tree-footer--dark' : ''}`} href="https://miprecio.app" target="_blank" rel="noreferrer" aria-label="Powered by MiPrecio"><span>Powered by</span><span className="link-tree-footer-mark"><span aria-hidden="true" /></span></a>
      </section>
    </main>
  )
}
