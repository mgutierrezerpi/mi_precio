import { useRef, useState } from 'react'
import type { DesignProps } from '../../designs'
import type { PencilConfig } from '..'

const CODE = "'Code Pro', 'DM Sans', Arial, sans-serif"
const DEFAULT_STORY_VIDEOS = [
  '/cafecitos-DZTNiLXgjc9.mp4',
  '/cafecitos-DaoEHZCAkrO.mp4',
  '/cafecitos-Da-lOC3ANUt.mp4',
]
const DEFAULT_STORY_METRICS = [
  { views: '195K', likes: '5.5K', comments: '158' },
  { views: '68.8K', likes: '1.7K', comments: '35' },
  { views: '9K', likes: '172', comments: '12' },
]
const DEFAULT_PROFILE_IMAGE = '/cafecitos-dani-hero.jpg'
const DEFAULT_FILM_IMAGES = [
  '/cafecitos-dani-hero.jpg',
  '/cafecitos-dani-card-1.jpg',
  '/cafecitos-dani-card-2.jpg',
  '/cafecitos-dani-card-3.jpg',
  '/cafecitos-dani-card-4.jpg',
  '/cafecitos-dani-card-5.jpg',
]

function StoryMetricIcon({ type }: { type: 'views' | 'likes' | 'comments' }) {
  const common = {
    width: 17,
    height: 17,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  if (type === 'views') {
    return <svg {...common}><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>
  }
  if (type === 'likes') {
    return <svg {...common}><path d="M20.8 4.8a5.3 5.3 0 0 0-7.5 0L12 6.1l-1.3-1.3a5.3 5.3 0 1 0-7.5 7.5L12 21l8.8-8.7a5.3 5.3 0 0 0 0-7.5Z" /></svg>
  }
  return <svg {...common}><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-3.1-.6L4 20l1.6-4A7.3 7.3 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" /></svg>
}

function StoriesPhone({
  videos,
  metrics,
  profileImage,
  profileName,
}: {
  videos: string[]
  metrics: { views: string; likes: string; comments: string }[]
  profileImage: string
  profileName: string
}) {
  const [active, setActive] = useState(0)
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const go = (direction: -1 | 1) =>
    setActive(
      (current) => (current + direction + videos.length) % videos.length
    )
  const stats = metrics[active]
  return (
    <article className="relative">
      <video
        key={videos[active]}
        ref={videoRef}
        autoPlay
        muted={muted}
        playsInline
        onTimeUpdate={(event) =>
          setProgress(
            event.currentTarget.duration
              ? event.currentTarget.currentTime / event.currentTarget.duration
              : 0
          )
        }
        onEnded={() => go(1)}
        aria-label={`Historia ${active + 1} de ${profileName}`}
      >
        <source src={videos[active]} type="video/mp4" />
      </video>
      {stats && <aside
        key={active}
        className="pointer-events-none absolute inset-0 z-30 block text-[#16352A]"
        aria-label={`Estadísticas de la historia ${active + 1}`}
      >
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5">
          <div className="flex h-9 items-center gap-1.5 rounded-full bg-[#DDF0E6] px-2.5 text-[#007239] shadow-[0_12px_25px_-18px_rgba(0,49,34,.7)]">
            <StoryMetricIcon type="views" />
            <strong className="text-[14px] leading-none tracking-[-.04em]">{stats.views}</strong>
          </div>
          <div className="flex h-9 items-center gap-1.5 rounded-full bg-white px-2.5 text-[#16352A] shadow-[0_12px_25px_-18px_rgba(0,49,34,.7)]">
            <StoryMetricIcon type="likes" />
            <strong className="text-[14px] leading-none tracking-[-.04em]">{stats.likes}</strong>
          </div>
          <div className="flex h-9 items-center gap-1.5 rounded-full bg-[#00613E] px-2.5 text-white shadow-[0_12px_25px_-18px_rgba(0,49,34,.7)]">
            <StoryMetricIcon type="comments" />
            <strong className="text-[14px] leading-none tracking-[-.04em]">{stats.comments}</strong>
          </div>
        </div>
      </aside>}
      <div className="absolute inset-0 z-10 p-4 text-white">
        <div className="flex gap-1">
          {videos.map((_, index) => (
            <span
              key={index}
              className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/35"
            >
              <span
                className="block h-full bg-white transition-[width] duration-100"
                style={{
                  width: `${index < active ? 100 : index === active ? progress * 100 : 0}%`,
                }}
              />
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <img
            src={profileImage}
            alt=""
            className="h-7 w-7 rounded-full border border-white/80 object-cover"
          />
          <span className="text-[11px] font-bold">{profileName}</span>
        </div>
        <button
          type="button"
          onClick={() => go(-1)}
          className="absolute inset-y-0 left-0 w-1/3"
          aria-label="Historia anterior"
        />
        <button
          type="button"
          onClick={() => go(1)}
          className="absolute inset-y-0 right-0 w-1/3"
          aria-label="Historia siguiente"
        />
        <button
          type="button"
          onClick={() => {
            const next = !muted
            setMuted(next)
            if (videoRef.current) {
              videoRef.current.muted = next
              void videoRef.current.play()
            }
          }}
          className="story-sound-toggle absolute bottom-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-gray-500/80 text-white backdrop-blur"
          aria-label={muted ? 'Activar sonido' : 'Silenciar historia'}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M11 5 6 9H3v6h3l5 4Z" />
            {muted ? (
              <path d="m16 9 5 5m0-5-5 5" />
            ) : (
              <>
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                <path d="M19 5a10 10 0 0 1 0 14" />
              </>
            )}
          </svg>
        </button>
      </div>
    </article>
  )
}

export function CafecitosTemplate({
  props,
  config,
}: {
  props: DesignProps
  config: PencilConfig
}) {
  const hero = props.content?.hero
  const template = props.content?.template
  const price = props.money
  const services = props.sections.flatMap((section) => section.items)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const title = hero?.title || 'Contenido que conecta con tu comunidad.'
  const story =
    hero?.body ||
    'Compartí tu propuesta y creemos contenido que conecte con tu comunidad.'
  const storyVideos = template?.storyVideos?.filter(Boolean).slice(0, 6)
  const videos = storyVideos?.length ? storyVideos : DEFAULT_STORY_VIDEOS
  const metrics = template?.storyMetrics?.slice(0, videos.length) || (storyVideos?.length ? [] : DEFAULT_STORY_METRICS)
  const profileImage = template?.profileImage || config.image || DEFAULT_PROFILE_IMAGE
  const filmImages = template?.filmImages?.filter(Boolean).slice(0, 8) || DEFAULT_FILM_IMAGES
  const profileName = template?.profileName || hero?.eyebrow?.replace(/^hola,?\s*soy\s*/i, '') || props.tenant.name
  const logo = template?.logo || '/cafecitos-logo.svg'
  const collaborationHeading = template?.collaborationHeading || 'Promocioná tu marca conmigo'
  const storiesHeading = template?.storiesHeading || 'Historias destacadas'
  const selectedService = services.find((item) => item.id === selectedServiceId)
  const checkoutChannel = props.checkoutChannel === 'instagram' ? 'instagram' : 'whatsapp'
  const contactMessage = selectedService
    ? `Hola ${profileName}, me interesa ${selectedService.name} (${price(selectedService.price)}). ¿Coordinamos una colaboración?`
    : ''
  const instagramHandle = (props.content?.template?.instagramHandle || props.tenant.instagramUrl || '')
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .split(/[/?#]/)[0]
  const contactHref = checkoutChannel === 'instagram'
    ? instagramHandle ? `https://ig.me/m/${instagramHandle}` : 'https://instagram.com'
    : `https://wa.me/?text=${encodeURIComponent(contactMessage)}`
  return (
    <div
      className="min-h-[100svh] overflow-x-clip bg-[#F8FAF7] px-5 py-3 text-[#16352A] sm:px-10 sm:py-10"
      style={{ fontFamily: CODE }}
    >
      <main className="mx-auto max-w-[1040px]">
        <section className="grid gap-8 py-5 sm:py-11 md:grid-cols-[minmax(0,1fr)_400px] md:items-center">
          <div>
            <img
              src={logo}
              alt={profileName}
              className="mx-auto mb-7 w-36 sm:mx-0 sm:w-64"
            />
            <p className="text-[16px] font-bold uppercase tracking-[1.2px] text-[#007239]">
              Hola, soy {profileName}
            </p>
            <h1 className="mt-4 max-w-[16ch] text-[40px] font-bold leading-[.98] tracking-[-.045em] sm:text-[52px]">
              {title}
            </h1>
            <p className="mt-6 max-w-[48ch] text-[17px] leading-relaxed text-[#5E7067]">
              {story}
            </p>
          </div>
          <div className="cafecitos-film mx-auto w-full max-w-[400px]">
            <div className="cafecitos-film-track">{[...filmImages, ...filmImages].map((image, index) => <img key={`${image}-${index}`} src={image} alt="" />)}</div>
          </div>
        </section>
        <section className="border-y border-[#C9E2D5] py-10">
          <p className="mb-5 text-[16px] font-bold uppercase tracking-[1.2px] text-[#007239]">
            {collaborationHeading}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() =>
                  setSelectedServiceId((current) => current === item.id ? null : item.id)
                }
                aria-pressed={selectedServiceId === item.id}
                className={`rounded-[26px] bg-[#EAF4EE] p-6 text-left transition ${selectedServiceId === item.id ? 'ring-2 ring-[#007239] ring-offset-2 ring-offset-[#F8FAF7]' : 'hover:-translate-y-0.5 hover:bg-[#DDF0E6]'}`}
              >
                <div className="flex gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-[28px] font-bold leading-[1.08] tracking-[-.035em] sm:text-[30px]">
                        {item.name}
                      </h2>
                      <span className="shrink-0 rounded-full bg-[#00613E] px-3.5 py-1.5 text-[15px] text-white">
                        {price(item.price)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="mt-4 text-[16px] leading-relaxed text-[#5E7067]">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {selectedService && (
            <a
              href={contactHref}
              target="_blank"
              rel="noreferrer"
              onClick={() => {
                if (checkoutChannel === 'instagram') {
                  void navigator.clipboard?.writeText(contactMessage)
                }
              }}
              className="mt-5 flex w-full items-center justify-center rounded-full bg-[#00613E] px-5 py-4 text-center text-[16px] font-bold text-white no-underline transition hover:bg-[#007239]"
            >
              {checkoutChannel === 'instagram' ? 'Enviar consulta por Instagram' : 'Enviar consulta por WhatsApp'}
            </a>
          )}
        </section>
        <section
          aria-label={storiesHeading}
          className="cafecitos-stories py-11"
        >
          <p className="mb-5 text-[12px] font-bold uppercase tracking-[1.6px] text-[#007239]">
            {storiesHeading}
          </p>
          <div>
            <StoriesPhone videos={videos} metrics={metrics} profileImage={profileImage} profileName={profileName} />
          </div>
        </section>
      </main>
    </div>
  )
}
