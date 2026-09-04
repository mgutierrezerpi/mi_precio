import { useState, type FormEvent } from 'react'
import type { Magazine, Tenant } from '../../types'
import { MagazineViewer, type JournalPage } from './pencilJournal'
import { StoriesPhone } from './pencil/templates/cafecitos-layout'
import api from '../../services/api'

const FONT = "'Code Pro', 'DM Sans', Arial, sans-serif"
const GREEN = '#007239'
const MUTED = '#5E7067'

type KitPage = {
  label: string
  eyebrow: string
  title: string
  body?: string
  image?: string
  imagePosition?: string
  cards?: { title: string; body: string }[]
  stats?: { value: string; label: string }[]
  reels?: { brand: string; video: string }[]
}

const KIT_PAGES: KitPage[] = [
  {
    label: 'Portada',
    eyebrow: 'MEDIA KIT 2026',
    title: 'Cafecitos con Dani',
    body: 'Contenido positivo para descubrir lugares, compartir experiencias y conectar marcas con una comunidad real.',
    image: '/cafecitos-dani-hero.jpg',
  },
  {
    label: 'Detrás de Cafecitos',
    eyebrow: 'HOLA, SOY DANI',
    title: 'Un espacio para compartir lo que me inspira.',
    body: 'Tengo 31 años y creé Cafecitos.uy en 2022 como un espacio para ser yo misma, descubrir lugares y compartir un poquito de mi vida con quienes me siguen a diario. Además de crear contenido, trabajo en marketing y gestiono marcas en los rubros de estética y medicina.',
    image: '/cafecitos-dani-card-1.jpg',
    imagePosition: 'center 18%',
  },
  {
    label: 'Mi comunidad',
    eyebrow: 'MI COMUNIDAD',
    title: 'Una audiencia que confía y participa.',
    stats: [
      { value: '9.556', label: 'seguidores' },
      { value: '86%', label: 'mujeres' },
      { value: '27,9%', label: '35–44 años' },
      { value: '25,4%', label: '45–54 años' },
    ],
  },
  {
    label: 'Métricas',
    eyebrow: 'MÉTRICAS',
    title: 'Alcance mensual que convierte en conversación.',
    stats: [
      { value: '251.770', label: 'impresiones mensuales' },
      { value: '14.431', label: 'interacciones mensuales' },
      { value: '2.863', label: 'visitas al perfil' },
    ],
  },
  {
    label: 'Líneas de comunicación',
    eyebrow: 'LÍNEAS DE COMUNICACIÓN',
    title: 'Historias que se sienten cercanas.',
    cards: [
      { title: 'Cafeterías tour', body: 'Reseñas de desayunos o meriendas en distintos lugares.' },
      { title: 'Review de producto', body: 'Productos alineados con mi estilo de vida y los intereses de mi comunidad.' },
      { title: 'Mi día a día', body: 'Detrás de escena de crear contenido, mi rutina y escapadas.' },
      { title: 'Planes y experiencias', body: 'Hoteles, cafeterías temáticas y eventos para descubrir juntos.' },
    ],
  },
  {
    label: 'Reels de colaboración',
    eyebrow: 'COLABORACIONES EN MOVIMIENTO',
    title: 'Experiencias que cobran vida en video.',
    reels: [
      { brand: 'Sofitel Montevideo', video: '/cafecitos-DZTNiLXgjc9.mp4' },
      { brand: 'Vico Atelier', video: '/cafecitos-DbrFdCngtTP.mp4' },
    ],
  },
  {
    label: 'Reels de colaboración II',
    eyebrow: 'COLABORACIONES EN MOVIMIENTO',
    title: 'Recomendaciones para mirar, guardar y compartir.',
    reels: [
      { brand: 'Experiencia gastronómica', video: '/cafecitos-Da-lOC3ANUt.mp4' },
      { brand: 'Experiencia de marca', video: '/cafecitos-DaoEHZCAkrO.mp4' },
    ],
  },
  {
    label: 'Reels de colaboración III',
    eyebrow: 'COLABORACIONES EN MOVIMIENTO',
    title: 'Historias que la comunidad lleva consigo.',
    reels: [
      { brand: 'Plan para compartir', video: '/cafecitos-Db6v779A9YV.mp4' },
      { brand: 'Recomendación gastronómica', video: '/cafecitos-DbtnZtbAh25.mp4' },
    ],
  },
  {
    label: 'Contacto',
    eyebrow: 'HABLEMOS',
    title: '¿Te imaginás tu marca acá?',
    body: 'Conozcámonos y pensemos una colaboración.',
    cards: [
      { title: 'Mail', body: 'cafecitosuycontacto@gmail.com' },
      { title: 'Celular', body: '098 402 451' },
    ],
  },
]

function ReelsPhone() {
  return (
    <div className="cafecitos-story-phone mx-auto mt-8">
      <StoriesPhone
        videos={[
          '/cafecitos-DZTNiLXgjc9.mp4',
          '/cafecitos-DaoEHZCAkrO.mp4',
          '/cafecitos-Da-lOC3ANUt.mp4',
        ]}
        metrics={[
          { views: '195K', likes: '5.5K', comments: '158' },
          { views: '68.8K', likes: '1.7K', comments: '35' },
          { views: '9K', likes: '172', comments: '12' },
        ]}
        profileImage="/cafecitos-dani-hero.jpg"
        profileName="Cafecitos con Dani"
      />
    </div>
  )
}

function MetricsGraph() {
  const rows = [
    { label: 'Impresiones', value: '251.770', width: '100%' },
    { label: 'Interacciones', value: '14.431', width: '56%' },
    { label: 'Visitas al perfil', value: '2.863', width: '32%' },
  ]
  return (
    <div className="mt-10 space-y-6 rounded-[30px] bg-[#004C30] p-8 text-white">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <span className="text-[12px] font-semibold uppercase tracking-[1px] text-[#B6DCC8]">{row.label}</span>
            <strong className="text-[22px] font-semibold tracking-[-.05em]">{row.value}</strong>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-[#B6DCC8]" style={{ width: row.width }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function CollaborationVideos({
  reels,
}: {
  reels: NonNullable<KitPage['reels']>
}) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-7 px-8">
      {reels.map((reel) => (
        <figure key={reel.brand} className="min-w-0">
          <div className="overflow-hidden rounded-[30px] border-[7px] border-[#0C1612] bg-black shadow-[0_22px_38px_-22px_rgba(0,49,34,.78)]">
            <video autoPlay muted loop playsInline className="aspect-[9/14] w-full object-cover">
              <source src={reel.video} type="video/mp4" />
            </video>
          </div>
          <figcaption className="mt-3 text-center text-[11px] font-bold uppercase tracking-[.7px]" style={{ color: GREEN }}>
            {reel.brand}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

function ContactForm({ tenant, magazine }: { tenant: Tenant; magazine: Magazine }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const normalizedName = name.trim()
    const normalizedEmail = email.trim()
    if (!normalizedName || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail)) {
      setError('Ingresá tu nombre y un email válido para que podamos responderte.')
      setState('error')
      return
    }
    setState('sending')
    setError('')
    const response = await api.createLead(tenant.subdomain, {
      name: normalizedName,
      email: normalizedEmail,
      message: message.trim() || undefined,
      listId: magazine.id,
      listName: magazine.name,
      source: 'media_kit',
    })
    if (response.data) setState('sent')
    else {
      setError(response.error || 'No pudimos enviar tu consulta. Probá de nuevo.')
      setState('error')
    }
  }
  if (state === 'sent') return <div className="mt-9 rounded-[26px] bg-[#EAF4EE] p-7 text-[18px] font-semibold" style={{ color: GREEN }}>¡Gracias! Dani se va a poner en contacto pronto.</div>
  const input = 'w-full rounded-xl border border-[#C9E2D5] bg-white px-4 py-3 text-[14px] outline-none placeholder:text-[#8BA195] focus:border-[#007239]'
  return <form onSubmit={submit} className="mt-8 flex max-w-[500px] flex-col gap-3">
    <input className={input} value={name} onChange={(event) => setName(event.target.value)} placeholder="Tu nombre" required />
    <input className={input} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Tu email" type="email" required />
    <textarea className={`${input} min-h-[104px] resize-none`} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Contame sobre tu marca o propuesta" />
    {state === 'error' && <p className="text-sm font-medium text-red-600">{error}</p>}
    <button type="submit" disabled={state === 'sending'} className="mt-1 rounded-xl bg-[#007239] px-5 py-3 text-[14px] font-semibold text-white disabled:opacity-60">{state === 'sending' ? 'Enviando…' : 'Enviar consulta'}</button>
  </form>
}

function NativeKitPage({ page, tenant, magazine }: { page: KitPage; tenant?: Tenant; magazine: Magazine }) {
  const cover = page.label === 'Portada'
  const metrics = page.label === 'Métricas'
  const community = page.label === 'Mi comunidad'
  const pageBackground = '#FFFFFF'
  const foreground = '#16352A'
  const secondary = MUTED

  return (
    <article
      className="cafecitos-media-kit-page flex h-[var(--magazine-page-height,980px)] w-[var(--magazine-page-width,700px)] flex-col overflow-y-auto px-10 py-9 sm:px-12 sm:py-12"
      style={{ background: pageBackground, color: foreground, fontFamily: FONT }}
    >
      <p className="text-[12px] font-semibold uppercase tracking-[1.5px]" style={{ color: GREEN }}>
        {page.eyebrow}
      </p>
      <h1 className="mt-5 max-w-[14ch] text-[47px] font-bold leading-[.98] tracking-[-.05em]">
        {page.title}
      </h1>
      {page.body && (
        <p className="mt-5 max-w-[39ch] text-[18px] leading-relaxed" style={{ color: secondary }}>
          {page.body}
        </p>
      )}
      {cover && <ReelsPhone />}
      {page.image && !cover && (
        <img
          src={page.image}
          alt={page.label}
          className="mt-8 h-[330px] w-full rounded-[32px] object-cover"
          style={{ objectPosition: page.imagePosition }}
        />
      )}
      {page.stats && community && (
        <div className="mt-8 grid flex-1 grid-cols-2 grid-rows-2 gap-4 pb-2">
          {page.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col justify-end rounded-[30px] bg-[#EAF4EE] p-7">
              <p className="text-[51px] font-semibold leading-none tracking-[-.07em]" style={{ color: GREEN }}>
                {stat.value}
              </p>
              <p className="mt-4 text-[12px] font-semibold uppercase tracking-[1px]" style={{ color: MUTED }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      )}
      {page.stats && !metrics && !community && (
        <div className="mt-8 grid grid-cols-2 gap-3">
          {page.stats.map((stat) => (
            <div key={stat.label} className="rounded-[22px] bg-[#EAF4EE] p-6">
              <p className="text-[35px] font-semibold leading-none tracking-[-.05em]" style={{ color: GREEN }}>
                {stat.value}
              </p>
              <p className="mt-3 text-[13px] font-semibold uppercase tracking-[.7px]" style={{ color: MUTED }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      )}
      {metrics && <MetricsGraph />}
      {page.reels && <CollaborationVideos reels={page.reels} />}
      {page.label === 'Contacto' && tenant ? <ContactForm tenant={tenant} magazine={magazine} /> : page.cards && (
        <div className="mt-8 grid grid-cols-2 gap-4">
          {page.cards.map((card) => (
            <div key={card.title} className="rounded-[26px] border border-[#C9E2D5] bg-white p-6">
              <h2 className="text-[23px] font-bold leading-[1.02] tracking-[-.04em]">{card.title}</h2>
              <p className="mt-4 text-[15px] leading-relaxed" style={{ color: MUTED }}>{card.body}</p>
            </div>
          ))}
        </div>
      )}
      <footer className="mt-auto pt-8 text-[10px] font-semibold uppercase tracking-[1.4px]" style={{ color: secondary }}>
        Cafecitos con Dani · Media kit 2026
      </footer>
    </article>
  )
}

export function CafecitosMediaKit({ magazine, tenant }: { magazine: Magazine; tenant?: Tenant }) {
  const pages: JournalPage[] = KIT_PAGES.map((page) => ({
    label: page.label,
    node: <NativeKitPage page={page} tenant={tenant} magazine={magazine} />,
  }))

  return (
    <MagazineViewer
      pages={pages}
      title={magazine.name}
      theme="cafecitos"
      hideArrowsOnMobile
      mobileSwipeHint
      footer={
        <a
          href="https://miprecio.app"
          target="_blank"
          rel="noreferrer"
          aria-label="Powered by MiPrecio"
          className="relative z-10 -mt-px flex w-full items-center justify-center gap-2 bg-transparent px-5 py-4 text-[9px] font-bold uppercase tracking-[0.12em] text-white no-underline"
        >
          <span>Powered by</span>
          <span className="relative block h-5 w-[82px] overflow-hidden" aria-hidden="true">
            <span
              className="absolute inset-0 bg-white"
              style={{
                WebkitMask: "url('/miprecio-logo-white-pencil.webp') left center / contain no-repeat",
                mask: "url('/miprecio-logo-white-pencil.webp') left center / contain no-repeat",
              }}
            />
          </span>
        </a>
      }
    />
  )
}
