import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { LinkTree, LinkTreeLink } from '../../types'
import '../../screens/home/LinkTreeScreen.css'

export interface LinkTreeViewProps {
  data: LinkTree
  preview?: boolean
  publicUrl?: string
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
  }
  return <svg {...common}>{paths[name] ?? paths.link}</svg>
}

function linkTarget(link: LinkTreeLink, preview: boolean) {
  if (!link.url) return undefined
  if (preview || /^https?:\/\//i.test(link.url)) return '_blank'
  return undefined
}

export function LinkTreeView({ data, preview = false, publicUrl }: LinkTreeViewProps) {
  const [toast, setToast] = useState('')
  const links = data.links.filter((link) => link.enabled)
  const template = data.template === 'editorial' || data.template === 'atelier' ? data.template : 'botanical'
  const shareUrl = publicUrl || window.location.href
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
  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: data.displayName, text: data.bio || '', url: shareUrl })
      } else {
        await copyLink()
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      notify('No pudimos compartir el perfil')
    }
  }
  const style = {
    '--cream': data.backgroundColor,
    '--lime': data.accentColor,
  } as CSSProperties

  return (
    <main className={`link-tree-page link-tree-page--${template}`} style={style}>
      <div className="link-tree-noise" aria-hidden="true" />
      <div className="link-tree-orb link-tree-orb--top" aria-hidden="true" />
      <div className="link-tree-orb link-tree-orb--bottom" aria-hidden="true" />
      <header className="link-tree-header">
        <Link className="link-tree-brand" to={preview ? '/admin/links' : '/'}>
          <span className="link-tree-brand-mark">m/</span>
          <span>mi precio</span>
        </Link>
        <div className="link-tree-header-actions">
          <span className="link-tree-header-note">{preview ? 'Vista previa' : 'Perfil público'}</span>
          <button type="button" className="link-tree-icon-button" aria-label="Compartir perfil" onClick={() => void share()}>
            <LinkTreeIcon name="share" size={17} />
          </button>
        </div>
      </header>

      <section className="link-tree-content" aria-labelledby="linktree-profile-name">
        <div className="link-tree-profile">
          <div className="profile-avatar" aria-hidden={!data.avatarUrl}>
            {data.avatarUrl ? <img src={data.avatarUrl} alt="" /> : <span>{data.displayName.slice(0, 2).toUpperCase()}</span>}
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
          {data.instagramUrl && <a href={data.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram">Instagram</a>}
          {data.whatsappUrl && <a href={data.whatsappUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp">WhatsApp</a>}
          {data.websiteUrl && <a href={data.websiteUrl} target="_blank" rel="noreferrer" aria-label="Sitio web">Sitio web</a>}
          <button type="button" onClick={() => void copyLink()} aria-label="Copiar link"><LinkTreeIcon name="link" size={15} /><span>Copiar link</span></button>
        </div>
        <p className="link-tree-footer">Un link. Todo tu negocio. <span>✳</span></p>
      </section>
      {toast && <div className="link-tree-toast" role="status">{toast}</div>}
    </main>
  )
}
