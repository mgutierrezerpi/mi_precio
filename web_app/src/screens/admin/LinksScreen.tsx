import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAppSelector } from '../../store/hooks'
import { selectCanEdit, selectTenant } from '../../store/slices/authSlice'
import api from '../../services/api'
import type { LinkTree, LinkTreeLink, LinkTreeLinkStyle, LinkTreeTemplate } from '../../types'
import { LinkTreeView } from '../../components/linktree/LinkTreeView'
import { CrmLayout } from './crm/CrmLayout'
import { Icon } from './crm/ui'

const EMPTY_LINK: LinkTreeLink = {
  id: null,
  title: 'Nuevo link',
  description: null,
  url: '',
  icon: 'link',
  style: 'light',
  enabled: true,
}

const inputClass =
  'mt-1 h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-sm text-[var(--dash-text)] outline-none focus:border-[var(--dash-link)] focus:ring-2 focus:ring-[var(--dash-link)]/20'
const textareaClass = `${inputClass} h-auto min-h-24 py-2.5`

function toHex(value: number) {
  return Math.round(value).toString(16).padStart(2, '0')
}

/** Finds the most represented saturated colour, then creates a quiet surface
 * colour from it. It deliberately ignores near-white/near-black pixels. */
async function colorsFromLogo(src: string) {
  const image = new Image()
  image.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('logo image could not load'))
    image.src = src
  })
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 72
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('canvas unavailable')
  context.drawImage(image, 0, 0, 72, 72)
  const buckets = new Map<string, { count: number; r: number; g: number; b: number }>()
  const pixels = context.getImageData(0, 0, 72, 72).data
  for (let index = 0; index < pixels.length; index += 16) {
    const [r, g, b, alpha] = [pixels[index], pixels[index + 1], pixels[index + 2], pixels[index + 3]]
    const high = Math.max(r, g, b)
    const low = Math.min(r, g, b)
    if (alpha < 180 || high < 45 || high > 238 || high - low < 28) continue
    const key = `${Math.round(r / 32)}-${Math.round(g / 32)}-${Math.round(b / 32)}`
    const bucket = buckets.get(key) || { count: 0, r: 0, g: 0, b: 0 }
    bucket.count += 1
    bucket.r += r
    bucket.g += g
    bucket.b += b
    buckets.set(key, bucket)
  }
  const winner = [...buckets.values()].sort((a, b) => b.count - a.count)[0]
  if (!winner) throw new Error('no usable logo colour')
  const colour = { r: winner.r / winner.count, g: winner.g / winner.count, b: winner.b / winner.count }
  const accent = `#${toHex(colour.r)}${toHex(colour.g)}${toHex(colour.b)}`.toUpperCase()
  const background = `#${toHex(255 - (255 - colour.r) * 0.1)}${toHex(255 - (255 - colour.g) * 0.1)}${toHex(255 - (255 - colour.b) * 0.1)}`.toUpperCase()
  return { accent, background }
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block text-xs font-bold text-[var(--dash-text2)]">
      {label}
      {children}
    </label>
  )
}

function LinkEditor({
  link,
  index,
  total,
  onChange,
  onRemove,
  onMove,
  disabled,
}: {
  link: LinkTreeLink
  index: number
  total: number
  onChange: (link: LinkTreeLink) => void
  onRemove: () => void
  onMove: (direction: -1 | 1) => void
  disabled: boolean
}) {
  const [isOpen, setIsOpen] = useState(!link.url)
  const set = <K extends keyof LinkTreeLink>(key: K, value: LinkTreeLink[K]) =>
    onChange({ ...link, [key]: value })
  return (
    <article className={`overflow-hidden rounded-xl border bg-[var(--dash-bg)] transition-colors ${isOpen ? 'border-[var(--dash-link)]/45 shadow-sm' : 'border-[var(--dash-border)]'}`}>
      <div className="flex items-center gap-3 p-3.5">
        <button type="button" onClick={() => setIsOpen((open) => !open)} className="min-w-0 flex flex-1 items-center gap-3 text-left" aria-expanded={isOpen}>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--dash-soft)] text-xs font-bold text-[var(--dash-link)]">{index + 1}</span>
          <span className="min-w-0"><span className="block truncate text-sm font-extrabold text-[var(--dash-text)]">{link.title || 'Link sin título'}</span><span className="block truncate text-xs text-[var(--dash-muted)]">{link.url || 'Agregá un destino'}</span></span>
          {!link.enabled && <span className="rounded-full bg-[var(--dash-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--dash-muted)]">Oculto</span>}
          <Icon name={isOpen ? 'chevron-down' : 'chevron-right'} size={16} className="ml-auto shrink-0 text-[var(--dash-muted)]" />
        </button>
        <div className="flex items-center gap-1">
          <button type="button" disabled={disabled || index === 0} onClick={() => onMove(-1)} className="rounded-md p-1.5 text-[var(--dash-muted)] hover:bg-[var(--dash-soft)] disabled:opacity-30" aria-label="Mover arriba">↑</button>
          <button type="button" disabled={disabled || index === total - 1} onClick={() => onMove(1)} className="rounded-md p-1.5 text-[var(--dash-muted)] hover:bg-[var(--dash-soft)] disabled:opacity-30" aria-label="Mover abajo">↓</button>
          <button type="button" disabled={disabled} onClick={onRemove} className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-30" aria-label="Eliminar link"><Icon name="circle-x" size={15} /></button>
        </div>
      </div>
      {isOpen && <div className="border-t border-[var(--dash-border)] p-4 pt-3"><div className="grid gap-3 sm:grid-cols-2">
        <Field label="Título"><input disabled={disabled} className={inputClass} value={link.title} onChange={(event) => set('title', event.target.value)} /></Field>
        <Field label="URL"><input disabled={disabled} className={inputClass} placeholder="https://… o /p/tu-negocio" value={link.url} onChange={(event) => set('url', event.target.value)} /></Field>
        <Field label="Descripción"><input disabled={disabled} className={inputClass} value={link.description || ''} onChange={(event) => set('description', event.target.value || null)} /></Field>
        <Field label="Estilo"><select disabled={disabled} className={inputClass} value={link.style} onChange={(event) => set('style', event.target.value as LinkTreeLinkStyle)}><option value="featured">Destacado</option><option value="dark">Oscuro</option><option value="light">Claro</option></select></Field>
      </div><label className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--dash-text2)]"><input disabled={disabled} type="checkbox" checked={link.enabled} onChange={(event) => set('enabled', event.target.checked)} className="checkbox checkbox-sm" /> Mostrar este link</label></div>}
    </article>
  )
}

export function LinksScreen() {
  const tenant = useAppSelector(selectTenant)
  const canEdit = useAppSelector(selectCanEdit)
  const [tree, setTree] = useState<LinkTree | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(() => window.innerWidth >= 640)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [savedSnapshot, setSavedSnapshot] = useState('')

  useEffect(() => {
    if (!tenant?.id) return
    void api.getLinkTree(tenant.id).then(async (response) => {
      setIsLoading(false)
      if (response.data) {
        setSavedSnapshot(JSON.stringify(response.data))
        const logo = response.data.avatarUrl || tenant.logoUrl
        const hasDefaultPalette = response.data.accentColor === '#D6EE4A' && response.data.backgroundColor === '#F5F4ED'
        if (logo && hasDefaultPalette) {
          try {
            const colors = await colorsFromLogo(logo)
            setTree({ ...response.data, accentColor: colors.accent, backgroundColor: colors.background })
            return
          } catch {
            // Keep the default palette if a hosted logo disallows pixel reading.
          }
        }
        setTree(response.data)
      }
      else setError(response.error || 'No pudimos cargar tu Linktree')
    })
  }, [tenant?.id])

  const publicUrl = useMemo(
    () => (tree ? `${window.location.origin}/l/${tree.publicSlug}` : ''),
    [tree]
  )
  const update = <K extends keyof LinkTree>(key: K, value: LinkTree[K]) =>
    setTree((current) => (current ? { ...current, [key]: value } : current))
  const isDirty = !!tree && savedSnapshot !== JSON.stringify(tree)
  const copyPublicUrl = async () => {
    if (!publicUrl) return
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      setError('No pudimos copiar el link. Copialo desde la barra del navegador.')
    }
  }
  const uploadAvatar = async (file?: File) => {
    if (!file || !tenant) return
    try {
      setIsUploadingAvatar(true)
      const response = await api.uploadLinkTreeAvatar(tenant.id, file)
      if (!response.data) throw new Error(response.error)
      update('avatarUrl', response.data.url)
      const colors = await colorsFromLogo(response.data.url)
      update('accentColor', colors.accent)
      update('backgroundColor', colors.background)
    } catch {
      setError('No pudimos subir esa imagen. Probá con otro archivo.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }
  const selectCompanyLogo = async (logo: string) => {
    try {
      setIsUploadingAvatar(true)
      let storedLogo = logo
      // Older tenant logos may still be embedded data URLs. Move those to
      // object storage before reusing them in a Linktree record.
      if (logo.startsWith('data:') && tenant) {
        const file = await (await fetch(logo)).blob()
        const response = await api.uploadLinkTreeAvatar(tenant.id, file)
        if (!response.data) throw new Error(response.error)
        storedLogo = response.data.url
      }
      update('avatarUrl', storedLogo)
      const colors = await colorsFromLogo(storedLogo)
      update('accentColor', colors.accent)
      update('backgroundColor', colors.background)
    } catch {
      setError('No pudimos usar ese logo. Probá subir una imagen nueva.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }
  const updateLink = (index: number, link: LinkTreeLink) =>
    setTree((current) => current ? { ...current, links: current.links.map((item, itemIndex) => itemIndex === index ? link : item) } : current)
  const removeLink = (index: number) =>
    setTree((current) => current ? { ...current, links: current.links.filter((_, itemIndex) => itemIndex !== index) } : current)
  const moveLink = (index: number, direction: -1 | 1) =>
    setTree((current) => {
      if (!current) return current
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= current.links.length) return current
      const links = [...current.links]
      const [item] = links.splice(index, 1)
      links.splice(nextIndex, 0, item)
      return { ...current, links }
    })
  const save = useCallback(async () => {
    if (!tenant || !tree || isSaving || !canEdit) return
    setIsSaving(true)
    setError('')
    const response = await api.updateLinkTree(tenant.id, tree)
    setIsSaving(false)
    if (response.data) {
      setSavedSnapshot(JSON.stringify(response.data))
      setTree(response.data)
    } else setError(response.error || 'No pudimos guardar los cambios')
  }, [canEdit, isSaving, tenant, tree])

  useEffect(() => {
    if (!isDirty || !canEdit || isSaving) return
    const timer = window.setTimeout(() => void save(), 850)
    return () => window.clearTimeout(timer)
  }, [canEdit, isDirty, isSaving, save])

  return (
    <CrmLayout active="Links" title="Links" subtitle="Configurá la página pública de tu negocio" hideContext>
      <main className="mx-auto flex min-h-full w-full max-w-[1320px] flex-col gap-5 overflow-x-hidden px-4 py-6 md:px-10 md:py-8">
        <header className="flex flex-col gap-4 border-b border-[var(--dash-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--dash-link)]">Tu presencia digital</p><h1 className="mt-1 text-[28px] font-extrabold leading-tight text-[var(--dash-text)]">Tu página de links</h1><p className="mt-1 text-sm text-[var(--dash-text2)]">Compartí catálogo, contacto y redes con un solo link.</p></div>
          <div className="flex flex-wrap items-center gap-2">
            {publicUrl && <button type="button" onClick={() => void copyPublicUrl()} aria-label={copied ? 'Link copiado' : 'Copiar link'} title={copied ? 'Link copiado' : 'Copiar link'} className="btn btn-sm tooltip tooltip-bottom inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] !p-0 text-[var(--dash-text)]" data-tip={copied ? 'Link copiado' : 'Copiar link'}><Icon name="copy" size={15} /></button>}
            {publicUrl && <div className="flex items-center gap-2"><a href={publicUrl} target="_blank" rel="noreferrer" aria-label="Ver página pública" title="Ver página pública" className="btn btn-sm tooltip tooltip-bottom inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] !p-0 text-[var(--dash-text)]" data-tip="Ver página pública"><Icon name="eye" size={15} /></a><button type="button" onClick={() => setIsPreviewOpen(true)} className="btn btn-sm hidden rounded-lg bg-[var(--dash-text)] px-3 py-2 text-xs font-bold text-[var(--dash-surface)] sm:hidden"><Icon name="eye" size={14} /> Abrir preview</button></div>}
            {(isDirty || isSaving) && <button type="button" disabled={!tree || isSaving || !canEdit || !isDirty} onClick={() => void save()} className="btn btn-sm rounded-lg bg-[var(--dash-text)] px-4 py-2 text-xs font-bold text-[var(--dash-surface)] disabled:opacity-50">{isSaving ? 'Guardando…' : 'Guardar ahora'}</button>}
          </div>
        </header>

        {error && <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
        {isLoading && <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-8 text-center text-sm text-[var(--dash-muted)]">Cargando tu Linktree…</div>}
        {!isLoading && tree && (
          <div className={`grid min-w-0 items-start gap-5 ${isPreviewOpen ? 'xl:grid-cols-[minmax(0,1fr)_390px]' : 'xl:grid-cols-1'}`}>
            <section className="min-w-0 space-y-5">
              <article className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5">
                <div className="mb-4"><h2 className="text-base font-extrabold text-[var(--dash-text)]">Perfil del negocio</h2><p className="mt-1 text-xs text-[var(--dash-muted)]">Estos datos aparecen arriba de tus links.</p></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nombre público"><input disabled={!canEdit} className={inputClass} value={tree.displayName} onChange={(event) => update('displayName', event.target.value)} /></Field>
                  <Field label="Usuario o handle"><input className={inputClass} placeholder="@tu_negocio" value={tree.handle || ''} onChange={(event) => update('handle', event.target.value || null)} /></Field>
                  <Field label="Link público"><div className="mt-1 flex h-10 overflow-hidden rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] focus-within:border-[var(--dash-link)] focus-within:ring-2 focus-within:ring-[var(--dash-link)]/20"><span className="flex items-center border-r border-[var(--dash-border)] px-2 text-xs font-bold text-[var(--dash-muted)]">/l/</span><input disabled={!canEdit} className="min-w-0 flex-1 bg-transparent px-2 text-sm text-[var(--dash-text)] outline-none" value={tree.publicSlug} onChange={(event) => update('publicSlug', event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} /></div><p className="mt-1 text-[11px] font-medium text-[var(--dash-muted)]">Este es el link que vas a compartir.</p></Field>
                  <Field label="Descripción"><textarea className={textareaClass} value={tree.bio || ''} onChange={(event) => update('bio', event.target.value || null)} /></Field>
                  <Field label="Imagen de perfil"><div className="mt-1 flex items-center gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)] p-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--dash-border)] bg-[var(--dash-soft)] text-xs font-bold text-[var(--dash-link)]">{tree.avatarUrl || tenant?.logoUrl ? <img src={tree.avatarUrl || tenant?.logoUrl || ''} alt="Logo del negocio" className="h-full w-full object-contain" /> : tree.displayName.slice(0, 2).toUpperCase()}</div><div className="flex min-w-0 flex-1 gap-2"><button type="button" disabled={!canEdit || !tenant?.logoUrl || isUploadingAvatar} onClick={() => void selectCompanyLogo(tenant?.logoUrl || '')} aria-label="Usar logo del negocio" title="Usar logo del negocio" className="btn btn-sm tooltip tooltip-bottom inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] !p-0 text-[var(--dash-text)] disabled:opacity-40" data-tip="Usar logo del negocio"><Icon name="package" size={15} /></button><button type="button" disabled={!canEdit || isUploadingAvatar} onClick={() => avatarInputRef.current?.click()} aria-label={isUploadingAvatar ? 'Subiendo imagen' : 'Subir imagen'} title={isUploadingAvatar ? 'Subiendo imagen' : 'Subir imagen'} className="btn btn-sm tooltip tooltip-bottom inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--dash-text)] !p-0 text-[var(--dash-surface)] disabled:opacity-40" data-tip={isUploadingAvatar ? 'Subiendo imagen' : 'Subir imagen'}><Icon name="upload" size={15} /></button><input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => { void uploadAvatar(event.target.files?.[0]); event.target.value = '' }} /></div></div><p className="mt-2 text-[11px] font-medium text-[var(--dash-muted)]">Las imágenes se optimizan y guardan de forma segura. Al elegir una, tomamos su color dominante para la página.</p></Field>
                  <Field label="Categorías"><input className={inputClass} placeholder="cerámica, diseño, regalos" value={tree.tags.join(', ')} onChange={(event) => update('tags', event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 8))} /></Field>
                  <label className="flex items-center gap-3 self-end text-sm font-bold text-[var(--dash-text2)]"><input type="checkbox" checked={tree.published} onChange={(event) => update('published', event.target.checked)} className="toggle toggle-sm" /> Página publicada</label>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Color de acento"><div className="mt-1 flex gap-2"><input type="color" value={tree.accentColor} onChange={(event) => update('accentColor', event.target.value.toUpperCase())} className="h-10 w-12 cursor-pointer rounded-lg border border-[var(--dash-border)] bg-transparent p-1" /><input className={inputClass.replace('mt-1 ', '')} value={tree.accentColor} onChange={(event) => update('accentColor', event.target.value)} /></div></Field><Field label="Color de fondo"><div className="mt-1 flex gap-2"><input type="color" value={tree.backgroundColor} onChange={(event) => update('backgroundColor', event.target.value.toUpperCase())} className="h-10 w-12 cursor-pointer rounded-lg border border-[var(--dash-border)] bg-transparent p-1" /><input className={inputClass.replace('mt-1 ', '')} value={tree.backgroundColor} onChange={(event) => update('backgroundColor', event.target.value)} /></div></Field><Field label="Plantilla"><select className={inputClass} value={tree.template} onChange={(event) => update('template', event.target.value as LinkTreeTemplate)}><option value="botanical">Botanical · orgánica</option><option value="editorial">Editorial · cálida</option><option value="atelier">Atelier · suave</option></select></Field><Field label="Tipografía"><select className={inputClass} value={tree.font || 'sans'} onChange={(event) => update('font', event.target.value as LinkTreeFont)}><option value="sans">Sans · moderna</option><option value="editorial">Editorial · serif</option><option value="mono">Mono · técnica</option><option value="code-pro">Code Pro</option></select></Field></div>
              </article>

              <article className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5">
                <div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-base font-extrabold text-[var(--dash-text)]">Tus links <span className="ml-1 rounded-full bg-[var(--dash-soft)] px-2 py-0.5 text-xs text-[var(--dash-text2)]">{tree.links.filter((link) => link.enabled).length}</span></h2><p className="mt-1 text-xs text-[var(--dash-muted)]">Abrí un link para editarlo. Usá las flechas para ordenar.</p></div><button type="button" disabled={!canEdit} onClick={() => update('links', [...tree.links, { ...EMPTY_LINK, id: crypto.randomUUID() }])} aria-label="Agregar link" title="Agregar link" className="btn btn-sm tooltip tooltip-left inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--dash-soft)] !p-0 text-[var(--dash-link)] disabled:opacity-50" data-tip="Agregar link"><Icon name="plus" size={16} /></button></div>
                <div className="space-y-3">{tree.links.map((link, index) => <LinkEditor key={link.id || index} link={link} index={index} total={tree.links.length} disabled={!canEdit} onChange={(next) => updateLink(index, next)} onRemove={() => removeLink(index)} onMove={(direction) => moveLink(index, direction)} />)}</div>
              </article>

              <article className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5"><div className="mb-4"><h2 className="text-base font-extrabold text-[var(--dash-text)]">Redes y contacto</h2><p className="mt-1 text-xs text-[var(--dash-muted)]">Se muestran como accesos rápidos al pie de la página.</p></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Instagram"><input className={inputClass} placeholder="https://instagram.com/…" value={tree.instagramUrl || ''} onChange={(event) => update('instagramUrl', event.target.value || null)} /></Field><Field label="TikTok"><input className={inputClass} placeholder="https://tiktok.com/@…" value={tree.tiktokUrl || ''} onChange={(event) => update('tiktokUrl', event.target.value || null)} /></Field><Field label="Email"><input className={inputClass} type="email" placeholder="hola@tu-negocio.com" value={tree.emailUrl?.replace(/^mailto:/i, '') || ''} onChange={(event) => update('emailUrl', event.target.value || null)} /></Field><Field label="WhatsApp"><input className={inputClass} placeholder="https://wa.me/…" value={tree.whatsappUrl || ''} onChange={(event) => update('whatsappUrl', event.target.value || null)} /></Field><Field label="Sitio web"><input className={inputClass} placeholder="https://…" value={tree.websiteUrl || ''} onChange={(event) => update('websiteUrl', event.target.value || null)} /></Field><Field label="Ubicación"><input className={inputClass} placeholder="https://maps.google.com/…" value={tree.locationUrl || ''} onChange={(event) => update('locationUrl', event.target.value || null)} /></Field></div></article>
            </section>

            <aside id="links-preview" className={`order-first min-w-0 xl:sticky xl:top-5 xl:order-none ${isPreviewOpen ? 'max-sm:fixed max-sm:inset-0 max-sm:z-40 max-sm:overflow-y-auto max-sm:bg-[var(--dash-bg)]' : 'hidden'}`}>
              <div className="overflow-hidden rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-sm max-sm:min-h-full max-sm:rounded-none max-sm:border-0">
                <div className="flex items-center justify-between border-b border-[var(--dash-border)] px-4 py-3"><div><h2 className="text-sm font-extrabold text-[var(--dash-text)]">Vista previa</h2><p className="mt-0.5 text-xs text-[var(--dash-muted)]">Actualización en tiempo real</p></div><div className="flex items-center gap-3">{publicUrl && <a href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[var(--dash-link)]">Abrir <Icon name="external-link" size={13} /></a>}<button type="button" onClick={() => setIsPreviewOpen(false)} className="hidden rounded-lg border border-[var(--dash-border)] p-1.5 text-[var(--dash-text2)] max-sm:inline-flex" aria-label="Cerrar preview"><Icon name="circle-x" size={16} /></button></div></div>
                <div className="bg-[radial-gradient(circle_at_top,#eceae2,#d8d6ce)] px-5 py-6 max-sm:p-0">
                  <div className="mx-auto w-full max-w-[350px] overflow-hidden rounded-[28px] border-[7px] border-[#272924] bg-[var(--dash-surface)] shadow-[0_20px_42px_rgba(25,30,23,.22)] max-sm:max-w-none max-sm:rounded-none max-sm:border-0 max-sm:shadow-none">
                    <div className="flex h-5 items-center justify-center bg-[#272924] max-sm:hidden"><span className="h-1 w-14 rounded-full bg-white/25" /></div>
                    <div><LinkTreeView data={tree} preview publicUrl={publicUrl} fallbackAvatarUrl={tenant?.logoUrl} /></div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
      {tree && <button
        type="button"
        aria-controls="links-preview"
        aria-expanded={isPreviewOpen}
        onClick={() => setIsPreviewOpen((open) => !open)}
        className="fixed right-6 top-1/2 z-30 inline-flex h-[112px] w-10 -translate-y-1/2 flex-col items-center justify-center gap-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] py-3 text-xs font-bold text-[var(--dash-text)] shadow-[0_8px_22px_rgba(0,0,0,.12)] transition-colors hover:bg-[var(--dash-soft)] max-sm:hidden"
        aria-label={isPreviewOpen ? 'Ocultar vista previa' : 'Mostrar vista previa'}
      >
        <Icon name={isPreviewOpen ? 'chevron-right' : 'eye'} size={15} />
        <span className="[writing-mode:vertical-rl]">{isPreviewOpen ? 'Ocultar preview' : 'Abrir preview'}</span>
      </button>}
    </CrmLayout>
  )
}
