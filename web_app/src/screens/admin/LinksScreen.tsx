import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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
}: {
  link: LinkTreeLink
  index: number
  total: number
  onChange: (link: LinkTreeLink) => void
  onRemove: () => void
  onMove: (direction: -1 | 1) => void
}) {
  const set = <K extends keyof LinkTreeLink>(key: K, value: LinkTreeLink[K]) =>
    onChange({ ...link, [key]: value })
  return (
    <article className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--dash-soft)] text-xs font-bold text-[var(--dash-link)]">{index + 1}</span>
          <span className="text-sm font-extrabold text-[var(--dash-text)]">Link</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" disabled={index === 0} onClick={() => onMove(-1)} className="rounded-md p-1.5 text-[var(--dash-muted)] hover:bg-[var(--dash-soft)] disabled:opacity-30" aria-label="Mover arriba">↑</button>
          <button type="button" disabled={index === total - 1} onClick={() => onMove(1)} className="rounded-md p-1.5 text-[var(--dash-muted)] hover:bg-[var(--dash-soft)] disabled:opacity-30" aria-label="Mover abajo">↓</button>
          <button type="button" onClick={onRemove} className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50" aria-label="Eliminar link"><Icon name="circle-x" size={15} /></button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Título"><input className={inputClass} value={link.title} onChange={(event) => set('title', event.target.value)} /></Field>
        <Field label="URL"><input className={inputClass} placeholder="https://… o /p/tu-negocio" value={link.url} onChange={(event) => set('url', event.target.value)} /></Field>
        <Field label="Descripción"><input className={inputClass} value={link.description || ''} onChange={(event) => set('description', event.target.value || null)} /></Field>
        <Field label="Estilo"><select className={inputClass} value={link.style} onChange={(event) => set('style', event.target.value as LinkTreeLinkStyle)}><option value="featured">Destacado</option><option value="dark">Oscuro</option><option value="light">Claro</option></select></Field>
      </div>
      <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--dash-text2)]"><input type="checkbox" checked={link.enabled} onChange={(event) => set('enabled', event.target.checked)} className="checkbox checkbox-sm" /> Mostrar este link</label>
    </article>
  )
}

export function LinksScreen() {
  const tenant = useAppSelector(selectTenant)
  const canEdit = useAppSelector(selectCanEdit)
  const [tree, setTree] = useState<LinkTree | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!tenant?.id) return
    void api.getLinkTree(tenant.id).then((response) => {
      setIsLoading(false)
      if (response.data) setTree(response.data)
      else setError(response.error || 'No pudimos cargar tu Linktree')
    })
  }, [tenant?.id])

  const publicUrl = useMemo(
    () => (tenant ? `${window.location.origin}/l/${tenant.subdomain}` : ''),
    [tenant]
  )
  const update = <K extends keyof LinkTree>(key: K, value: LinkTree[K]) =>
    setTree((current) => (current ? { ...current, [key]: value } : current))
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
  const save = async () => {
    if (!tenant || !tree || isSaving || !canEdit) return
    setIsSaving(true)
    setSaved(false)
    setError('')
    const response = await api.updateLinkTree(tenant.id, tree)
    setIsSaving(false)
    if (response.data) {
      setTree(response.data)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2200)
    } else setError(response.error || 'No pudimos guardar los cambios')
  }

  return (
    <CrmLayout active="Links" title="Links" subtitle="Configurá la página pública de tu negocio" hideContext>
      <main className="mx-auto flex min-h-full w-full max-w-[1320px] flex-col gap-5 px-4 py-6 md:px-10 md:py-8">
        <header className="flex flex-col gap-4 border-b border-[var(--dash-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--dash-link)]">Tu presencia digital</p><h1 className="mt-1 text-[28px] font-extrabold leading-tight text-[var(--dash-text)]">Links</h1><p className="mt-1 text-sm text-[var(--dash-text2)]">Un link para compartir todo lo importante de tu negocio.</p></div>
          <div className="flex flex-wrap items-center gap-2">
            {publicUrl && <a href={publicUrl} target="_blank" rel="noreferrer" className="btn btn-sm rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 py-2 text-xs font-bold text-[var(--dash-text)]">Abrir página <Icon name="external-link" size={14} /></a>}
            <button type="button" disabled={!tree || isSaving || !canEdit} onClick={() => void save()} className="btn btn-sm rounded-lg bg-[var(--dash-text)] px-4 py-2 text-xs font-bold text-[var(--dash-surface)] disabled:opacity-50">{isSaving ? 'Guardando…' : saved ? 'Guardado' : 'Guardar cambios'}</button>
          </div>
        </header>

        {error && <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
        {isLoading && <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-8 text-center text-sm text-[var(--dash-muted)]">Cargando tu Linktree…</div>}
        {!isLoading && tree && (
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
            <section className="space-y-5">
              <article className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5">
                <div className="mb-4"><h2 className="text-base font-extrabold text-[var(--dash-text)]">Perfil del negocio</h2><p className="mt-1 text-xs text-[var(--dash-muted)]">Estos datos aparecen arriba de tus links.</p></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nombre público"><input className={inputClass} value={tree.displayName} onChange={(event) => update('displayName', event.target.value)} /></Field>
                  <Field label="Usuario o handle"><input className={inputClass} placeholder="@tu_negocio" value={tree.handle || ''} onChange={(event) => update('handle', event.target.value || null)} /></Field>
                  <Field label="Descripción"><textarea className={textareaClass} value={tree.bio || ''} onChange={(event) => update('bio', event.target.value || null)} /></Field>
                  <Field label="Foto de perfil (URL)"><input className={inputClass} placeholder="https://…" value={tree.avatarUrl || ''} onChange={(event) => update('avatarUrl', event.target.value || null)} /></Field>
                  <Field label="Categorías"><input className={inputClass} placeholder="cerámica, diseño, regalos" value={tree.tags.join(', ')} onChange={(event) => update('tags', event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 8))} /></Field>
                  <label className="flex items-center gap-3 self-end text-sm font-bold text-[var(--dash-text2)]"><input type="checkbox" checked={tree.published} onChange={(event) => update('published', event.target.checked)} className="toggle toggle-sm" /> Página publicada</label>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Color de acento"><div className="mt-1 flex gap-2"><input type="color" value={tree.accentColor} onChange={(event) => update('accentColor', event.target.value.toUpperCase())} className="h-10 w-12 cursor-pointer rounded-lg border border-[var(--dash-border)] bg-transparent p-1" /><input className={inputClass.replace('mt-1 ', '')} value={tree.accentColor} onChange={(event) => update('accentColor', event.target.value)} /></div></Field><Field label="Color de fondo"><div className="mt-1 flex gap-2"><input type="color" value={tree.backgroundColor} onChange={(event) => update('backgroundColor', event.target.value.toUpperCase())} className="h-10 w-12 cursor-pointer rounded-lg border border-[var(--dash-border)] bg-transparent p-1" /><input className={inputClass.replace('mt-1 ', '')} value={tree.backgroundColor} onChange={(event) => update('backgroundColor', event.target.value)} /></div></Field><Field label="Plantilla"><select className={inputClass} value={tree.template} onChange={(event) => update('template', event.target.value as LinkTreeTemplate)}><option value="botanical">Botanical · orgánica</option><option value="editorial">Editorial · cálida</option><option value="atelier">Atelier · suave</option></select></Field></div>
              </article>

              <article className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5">
                <div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-base font-extrabold text-[var(--dash-text)]">Tus links</h2><p className="mt-1 text-xs text-[var(--dash-muted)]">Ordená y editá lo que tus clientes pueden abrir.</p></div><button type="button" onClick={() => update('links', [...tree.links, { ...EMPTY_LINK, id: crypto.randomUUID() }])} className="btn btn-sm rounded-lg bg-[var(--dash-soft)] px-3 py-2 text-xs font-bold text-[var(--dash-link)]">+ Agregar link</button></div>
                <div className="space-y-3">{tree.links.map((link, index) => <LinkEditor key={link.id || index} link={link} index={index} total={tree.links.length} onChange={(next) => updateLink(index, next)} onRemove={() => removeLink(index)} onMove={(direction) => moveLink(index, direction)} />)}</div>
              </article>

              <article className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5"><div className="mb-4"><h2 className="text-base font-extrabold text-[var(--dash-text)]">Redes y contacto</h2><p className="mt-1 text-xs text-[var(--dash-muted)]">Se muestran como accesos rápidos al pie de la página.</p></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Instagram"><input className={inputClass} placeholder="https://instagram.com/…" value={tree.instagramUrl || ''} onChange={(event) => update('instagramUrl', event.target.value || null)} /></Field><Field label="WhatsApp"><input className={inputClass} placeholder="https://wa.me/…" value={tree.whatsappUrl || ''} onChange={(event) => update('whatsappUrl', event.target.value || null)} /></Field><Field label="Sitio web"><input className={inputClass} placeholder="https://…" value={tree.websiteUrl || ''} onChange={(event) => update('websiteUrl', event.target.value || null)} /></Field><Field label="Ubicación"><input className={inputClass} placeholder="https://maps.google.com/…" value={tree.locationUrl || ''} onChange={(event) => update('locationUrl', event.target.value || null)} /></Field></div></article>
            </section>

            <aside className="xl:sticky xl:top-5">
              <div className="mb-3 flex items-center justify-between"><div><h2 className="text-sm font-extrabold text-[var(--dash-text)]">Preview</h2><p className="mt-1 text-xs text-[var(--dash-muted)]">Así lo ve tu cliente.</p></div>{publicUrl && <Link to={`/l/${tenant?.subdomain}`} target="_blank" className="text-xs font-bold text-[var(--dash-link)]">Ver página ↗</Link>}</div>
              <div className="max-h-[760px] overflow-y-auto rounded-2xl border border-[var(--dash-border)] bg-[#d9d7d0] p-3 shadow-lg"><LinkTreeView data={tree} preview publicUrl={publicUrl} /></div>
            </aside>
          </div>
        )}
      </main>
    </CrmLayout>
  )
}
