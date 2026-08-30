import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { selectCanEdit, selectTenant } from '../../store/slices/authSlice'
import api from '../../services/api'
import type { ListContent, PriceList } from '../../types'
import { CrmLayout } from './crm/CrmLayout'
import { Icon } from './crm/ui'
import { pencilTemplateDefaults } from '../menu/pencil'

const inputClass = 'mt-1 h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-sm text-[var(--dash-text)] outline-none transition focus:border-[var(--dash-link)] focus:ring-2 focus:ring-[var(--dash-link)]/20 disabled:opacity-50'
const textareaClass = `${inputClass} h-auto min-h-20 py-2.5`

const starterContent = (name: string): ListContent => ({
  schemaVersion: 1,
  hero: { title: name },
  blocks: [],
})

const contentWithTemplateDefaults = (content: ListContent, list: PriceList, tenantDesign?: PriceList['design']): ListContent => {
  const defaults = pencilTemplateDefaults(list.design || tenantDesign || 'store')
  if (!defaults) return content
  return { ...content, template: { ...defaults, ...content.template } }
}

function Field({ label, wide = false, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={`block text-xs font-bold text-[var(--dash-text2)] ${wide ? 'sm:col-span-2' : ''}`}>{label}{children}</label>
}

export function ListCustomizeScreen() {
  const { id } = useParams<{ id: string }>()
  const tenant = useAppSelector(selectTenant)
  const canEdit = useAppSelector(selectCanEdit)
  const [list, setList] = useState<PriceList | null>(null)
  const [versionId, setVersionId] = useState('')
  const [revision, setRevision] = useState(0)
  const [content, setContent] = useState<ListContent | null>(null)
  const [snapshot, setSnapshot] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [previewOpen, setPreviewOpen] = useState(() => window.innerWidth >= 640)
  const [previewRevision, setPreviewRevision] = useState(0)
  const [uploadingImage, setUploadingImage] = useState(false)
  const imageRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    void api.getList(id).then((response) => {
      if (cancelled) return
      setLoading(false)
      if (!response.data) {
        setError(response.error || 'No pudimos cargar esta lista')
        return
      }
      const version = response.data.versions?.[0]
      if (!version) {
        setError('Esta lista no tiene una versión para personalizar.')
        return
      }
      const next = contentWithTemplateDefaults(
        version.content || starterContent(response.data.name),
        response.data,
        tenant?.listDesign
      )
      setList(response.data)
      setVersionId(version.id)
      setRevision(version.contentRevision || 0)
      setContent(next)
      setSnapshot(JSON.stringify(next))
    })
    return () => { cancelled = true }
  }, [id, tenant?.listDesign])

  const publicUrl = useMemo(
    () => list && tenant ? `${window.location.origin}/p/${tenant.subdomain}/${list.slug || list.id}` : '',
    [list, tenant]
  )
  const isEditorial = (list?.design || tenant?.listDesign || '').startsWith('pencil-')
  const isStoriesTemplate = (list?.design || tenant?.listDesign) === 'pencil-cafecitos'
  const dirty = !!content && snapshot !== JSON.stringify(content)
  const update = (patch: Partial<ListContent>) => setContent((current) => ({ ...(current || starterContent(list?.name || 'Mi lista')), ...patch }))
  const updateHero = (key: 'eyebrow' | 'title' | 'body', value: string) => {
    const current = content || starterContent(list?.name || 'Mi lista')
    update({ hero: { ...current.hero, [key]: value } })
  }
  const updateTemplate = (key: keyof NonNullable<ListContent['template']>, value: string) => {
    const current = content || starterContent(list?.name || 'Mi lista')
    update({ template: { ...current.template, [key]: value } })
  }
  const updateStoryVideos = (value: string) => {
    const current = content || starterContent(list?.name || 'Mi lista')
    update({ template: { ...current.template, storyVideos: value.split('\n').map((url) => url.trim()).filter(Boolean) } })
  }
  const updateStoryMetrics = (value: string) => {
    const current = content || starterContent(list?.name || 'Mi lista')
    const storyMetrics = value.split('\n').map((line) => line.split('|').map((part) => part.trim())).filter((parts) => parts.length === 3 && parts.every(Boolean)).map(([views, likes, comments]) => ({ views, likes, comments }))
    update({ template: { ...current.template, storyMetrics } })
  }
  const save = useCallback(async () => {
    if (!versionId || !content || !dirty || saving || !canEdit) return
    setSaving(true)
    setError('')
    const response = await api.updateVersionContent(versionId, content, revision)
    setSaving(false)
    if (!response.data) {
      setError(response.error || 'No pudimos guardar los cambios')
      return
    }
    setContent(response.data.content)
    setRevision(response.data.contentRevision)
    setSnapshot(JSON.stringify(response.data.content))
    setPreviewRevision((value) => value + 1)
  }, [canEdit, content, dirty, revision, saving, versionId])

  useEffect(() => {
    if (!dirty || !canEdit || saving) return
    const timer = window.setTimeout(() => void save(), 800)
    return () => window.clearTimeout(timer)
  }, [canEdit, dirty, save, saving])

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !tenant) return
    setUploadingImage(true)
    setError('')
    try {
      const response = await api.uploadListTemplateImage(tenant.id, file)
      if (!response.data) setError(response.error || 'No pudimos subir la imagen')
      else updateTemplate('image', response.data.url)
    } finally {
      setUploadingImage(false)
    }
  }

  return <CrmLayout active="Listas de precios" title="Listas de precios" subtitle="Personalizá tu catálogo público" hideContext>
    <main className="mx-auto flex min-h-full w-full max-w-[1320px] flex-col gap-5 overflow-x-hidden px-4 py-6 md:px-10 md:py-8">
      <header className="flex flex-col gap-4 border-b border-[var(--dash-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div><Link to="/admin/lists" className="inline-flex items-center gap-1 text-xs font-bold text-[var(--dash-link)] hover:underline"><Icon name="chevron-left" size={14} /> Volver a listas</Link><p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--dash-link)]">Diseño de lista</p><h1 className="mt-1 text-[28px] font-extrabold leading-tight text-[var(--dash-text)]">{list ? list.name : 'Personalizar lista'}</h1><p className="mt-1 text-sm text-[var(--dash-text2)]">Editá los detalles de tu plantilla y mirá el resultado al instante.</p></div>
        <div className="flex items-center gap-2">{publicUrl && <a href={publicUrl} target="_blank" rel="noreferrer" className="btn btn-sm tooltip tooltip-bottom inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] !p-0 text-[var(--dash-text)]" title="Abrir página pública"><Icon name="external-link" size={15} /></a>}<button type="button" onClick={() => setPreviewOpen(true)} className="btn btn-sm inline-flex h-9 items-center gap-1 rounded-lg bg-[var(--dash-text)] px-3 text-xs font-bold text-[var(--dash-surface)] sm:hidden"><Icon name="eye" size={14} /> Preview</button>{(dirty || saving) && <button type="button" onClick={() => void save()} disabled={!dirty || saving} className="btn btn-sm h-9 rounded-lg bg-[var(--dash-text)] px-3 text-xs font-bold text-[var(--dash-surface)] disabled:opacity-50">{saving ? 'Guardando…' : 'Guardar ahora'}</button>}</div>
      </header>
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
      {loading && <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-8 text-center text-sm text-[var(--dash-muted)]">Cargando editor…</div>}
      {!loading && list && content && <div className={`grid min-w-0 items-start gap-5 ${previewOpen ? 'xl:grid-cols-[minmax(0,1fr)_390px]' : 'xl:grid-cols-1'}`}>
        <section className="min-w-0 space-y-5">
          <article className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5"><div className="mb-4"><h2 className="text-base font-extrabold text-[var(--dash-text)]">Encabezado</h2><p className="mt-1 text-xs text-[var(--dash-muted)]">La introducción que abre tu lista pública.</p></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Antetítulo"><input disabled={!canEdit} className={inputClass} value={content.hero?.eyebrow || ''} onChange={(e) => updateHero('eyebrow', e.target.value)} placeholder="NOVEDADES" /></Field><Field label="Título"><input disabled={!canEdit} className={inputClass} value={content.hero?.title || ''} onChange={(e) => updateHero('title', e.target.value)} /></Field><Field wide label="Descripción"><textarea disabled={!canEdit} className={textareaClass} value={content.hero?.body || ''} onChange={(e) => updateHero('body', e.target.value)} placeholder="Una breve introducción a la lista." /></Field><Field label="Tipografía"><select disabled={!canEdit} className={inputClass} value={content.template?.font || 'sans'} onChange={(e) => updateTemplate('font', e.target.value)}><option value="sans">Sans · moderna</option><option value="editorial">Editorial · serif</option><option value="serif">Serif · clásica</option><option value="mono">Mono · técnica</option><option value="code-pro">Code Pro</option></select></Field><Field label="Canal para pedidos"><select disabled={!canEdit} className={inputClass} value={content.template?.checkoutChannel || 'whatsapp'} onChange={(e) => updateTemplate('checkoutChannel', e.target.value)}><option value="whatsapp">WhatsApp · mensaje con pedido</option><option value="instagram">Instagram · copiar pedido y abrir DM</option></select></Field>{content.template?.checkoutChannel === 'instagram' && <Field label="Usuario de Instagram"><input disabled={!canEdit} className={inputClass} value={content.template?.instagramHandle || ''} onChange={(e) => updateTemplate('instagramHandle', e.target.value.replace(/^@/, '').replace(/[^a-zA-Z0-9._]/g, ''))} placeholder="cafecitos.uy" /><span className="mt-1 block text-[11px] font-medium text-[var(--dash-muted)]">Abrimos el DM y copiamos el pedido para que lo peguen.</span></Field>}</div></article>
          {isEditorial && <article className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5"><div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="text-base font-extrabold text-[var(--dash-text)]">Contenido editorial</h2><p className="mt-1 text-xs text-[var(--dash-muted)]">Esta plantilla tiene imagen, promoción y textos de pie propios.</p></div><button type="button" disabled={!canEdit || uploadingImage} onClick={() => imageRef.current?.click()} className="btn btn-sm inline-flex h-9 items-center gap-1 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-bold text-[var(--dash-link)] disabled:opacity-50"><Icon name="upload" size={14} /> {uploadingImage ? 'Subiendo…' : 'Subir imagen'}</button><input ref={imageRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(e) => void uploadImage(e)} /></div><div className="grid gap-4 sm:grid-cols-2"><Field wide label="Imagen editorial"><input disabled={!canEdit} className={inputClass} value={content.template?.image || ''} onChange={(e) => updateTemplate('image', e.target.value)} placeholder="https://…" /></Field>{content.template?.image && <img src={content.template.image} alt="Vista previa editorial" className="h-44 w-full rounded-xl object-cover sm:col-span-2" />}<Field label="Etiqueta de imagen"><input disabled={!canEdit} className={inputClass} value={content.template?.imageLabel || ''} onChange={(e) => updateTemplate('imageLabel', e.target.value)} /></Field><Field label="Título de imagen"><input disabled={!canEdit} className={inputClass} value={content.template?.imageTitle || ''} onChange={(e) => updateTemplate('imageTitle', e.target.value)} /></Field><Field label="Antetítulo de promoción"><input disabled={!canEdit} className={inputClass} value={content.template?.promoEyebrow || ''} onChange={(e) => updateTemplate('promoEyebrow', e.target.value)} /></Field><Field label="Título de promoción"><input disabled={!canEdit} className={inputClass} value={content.template?.promoTitle || ''} onChange={(e) => updateTemplate('promoTitle', e.target.value)} /></Field><Field wide label="Texto de promoción"><textarea disabled={!canEdit} className={textareaClass} value={content.template?.promoBody || ''} onChange={(e) => updateTemplate('promoBody', e.target.value)} /></Field><Field label="Precio o llamada"><input disabled={!canEdit} className={inputClass} value={content.template?.promoPrice || ''} onChange={(e) => updateTemplate('promoPrice', e.target.value)} /></Field><Field label="Nota de promoción"><input disabled={!canEdit} className={inputClass} value={content.template?.promoNote || ''} onChange={(e) => updateTemplate('promoNote', e.target.value)} /></Field><Field label="Pie izquierdo"><input disabled={!canEdit} className={inputClass} value={content.template?.footerLeft || ''} onChange={(e) => updateTemplate('footerLeft', e.target.value)} /></Field><Field label="Pie derecho"><input disabled={!canEdit} className={inputClass} value={content.template?.footerRight || ''} onChange={(e) => updateTemplate('footerRight', e.target.value)} /></Field></div></article>}
          {isStoriesTemplate && <article className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5"><div className="mb-4"><h2 className="text-base font-extrabold text-[var(--dash-text)]">Historias destacadas</h2><p className="mt-1 text-xs text-[var(--dash-muted)]">Esta plantilla se adapta a cualquier creador: identidad, imagen y videos se editan por lista.</p></div><div className="grid gap-4 sm:grid-cols-2"><Field wide label="Logo (URL opcional)"><input disabled={!canEdit} className={inputClass} value={content.template?.logo || ''} onChange={(e) => updateTemplate('logo', e.target.value)} placeholder="Usa el logo del negocio si lo dejás vacío" /></Field><Field wide label="Videos de historias"><textarea disabled={!canEdit} className={textareaClass} value={content.template?.storyVideos?.join('\n') || ''} onChange={(e) => updateStoryVideos(e.target.value)} placeholder="Una URL .mp4 por línea" /></Field><Field wide label="Métricas por historia (opcional)"><textarea disabled={!canEdit} className={textareaClass} value={content.template?.storyMetrics?.map((metric) => `${metric.views} | ${metric.likes} | ${metric.comments}`).join('\n') || ''} onChange={(e) => updateStoryMetrics(e.target.value)} placeholder="Vistas | Me gusta | Comentarios (una línea por video)" /></Field></div></article>}
          <article className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5">
            <h2 className="text-base font-extrabold text-[var(--dash-text)]">Formato de precios</h2>
            <p className="mt-1 text-xs text-[var(--dash-muted)]">Elegí cómo se muestra el símbolo delante de cada precio.</p>
            <div className="mt-4 max-w-xs"><Field label="Formato"><select disabled={!canEdit} className={inputClass} value={content.template?.priceFormat || '$'} onChange={(event) => updateTemplate('priceFormat', event.target.value)}><option value="$">$</option><option value="U$D">U$D</option><option value="USD">USD</option></select></Field></div>
          </article>
        </section>
        <aside className={`order-first min-w-0 xl:sticky xl:top-5 xl:order-none ${previewOpen ? 'max-sm:fixed max-sm:inset-0 max-sm:z-40 max-sm:overflow-y-auto max-sm:bg-[var(--dash-bg)]' : 'hidden'}`}><div className="overflow-hidden rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-sm max-sm:min-h-full max-sm:rounded-none max-sm:border-0"><div className="flex items-center justify-between border-b border-[var(--dash-border)] px-4 py-3"><div><h2 className="text-sm font-extrabold text-[var(--dash-text)]">Vista previa</h2><p className="mt-0.5 text-xs text-[var(--dash-muted)]">Se actualiza al guardar</p></div><button type="button" onClick={() => setPreviewOpen(false)} className="hidden rounded-lg border border-[var(--dash-border)] p-1.5 text-[var(--dash-text2)] max-sm:inline-flex" aria-label="Cerrar preview"><Icon name="circle-x" size={16} /></button></div><div className="bg-[radial-gradient(circle_at_top,#eceae2,#d8d6ce)] p-5 max-sm:p-0"><div className="mx-auto w-full max-w-[350px] overflow-hidden rounded-[28px] border-[7px] border-[#272924] bg-white shadow-[0_20px_42px_rgba(25,30,23,.22)] max-sm:max-w-none max-sm:rounded-none max-sm:border-0"><iframe key={previewRevision} title="Vista previa de la lista" src={publicUrl ? `${publicUrl}?preview=editor` : ''} className="block h-[620px] w-full border-0 max-sm:h-[100dvh]" /></div></div></div></aside>
      </div>}
    </main>
    {list && <button type="button" onClick={() => setPreviewOpen((open) => !open)} className="fixed right-6 top-1/2 z-30 hidden h-[112px] w-10 -translate-y-1/2 flex-col items-center justify-center gap-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] py-3 text-xs font-bold text-[var(--dash-text)] shadow-[0_8px_22px_rgba(0,0,0,.12)] hover:bg-[var(--dash-soft)] xl:inline-flex" aria-label={previewOpen ? 'Ocultar vista previa' : 'Abrir vista previa'}><Icon name={previewOpen ? 'chevron-right' : 'eye'} size={15} /><span className="[writing-mode:vertical-rl]">{previewOpen ? 'Ocultar preview' : 'Abrir preview'}</span></button>}
  </CrmLayout>
}

export default ListCustomizeScreen
