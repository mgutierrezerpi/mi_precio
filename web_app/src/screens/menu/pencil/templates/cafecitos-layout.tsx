import { useRef, useState } from 'react'
import type { DesignProps } from '../../designs'
import type { PencilConfig } from '..'

const CODE = "'Code Pro', 'DM Sans', Arial, sans-serif"
const VIDEOS = [
  '/cafecitos-DcYv0vBgdfZ.mp4',
  '/cafecitos-Db6v779A9YV.mp4',
  '/cafecitos-DbtnZtbAh25.mp4',
]
const DANI_IMAGE = '/cafecitos-dani-hero.jpg'

function StoriesPhone() {
  const [active, setActive] = useState(0)
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const go = (direction: -1 | 1) =>
    setActive(
      (current) => (current + direction + VIDEOS.length) % VIDEOS.length
    )
  return (
    <article className="relative">
      <video
        key={VIDEOS[active]}
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
        aria-label={`Historia ${active + 1} de Cafecitos con Dani`}
      >
        <source src={VIDEOS[active]} type="video/mp4" />
      </video>
      <div className="absolute inset-0 z-10 p-4 text-white">
        <div className="flex gap-1">
          {VIDEOS.map((_, index) => (
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
            src={DANI_IMAGE}
            alt=""
            className="h-7 w-7 rounded-full border border-white/80 object-cover"
          />
          <span className="text-[11px] font-bold">cafecitos.uy</span>
          <span className="text-[11px] text-white/75">hoy</span>
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
  const price = props.money
  const services = props.sections.flatMap((section) => section.items)
  const title = hero?.title || 'Contenido que conecta con tu comunidad.'
  const story =
    hero?.body ||
    'Disfrutando mis 30s entre cafés y plancitos que me hacen feliz.'
  return (
    <div
      className="min-h-[100svh] overflow-x-clip bg-[#F8FAF7] px-5 py-6 text-[#16352A] sm:px-10 sm:py-10"
      style={{ fontFamily: CODE }}
    >
      <main className="mx-auto max-w-[1040px]">
        <header className="flex items-center justify-between border-b border-[#C9E2D5] pb-5 text-[12px] font-bold uppercase tracking-[1.5px]">
          <span className="text-[#007239]">Cafecitos con Dani</span>
          <span className="text-[#5E7067]">Colaboraciones</span>
        </header>
        <section className="grid gap-8 py-11 md:grid-cols-[minmax(0,1fr)_400px] md:items-center">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[1.6px] text-[#007239]">
              Hola, soy Dani
            </p>
            <h1 className="mt-4 max-w-[14ch] text-[48px] font-bold leading-[.92] tracking-[-.055em] sm:text-[72px]">
              {title}
            </h1>
            <p className="mt-6 max-w-[48ch] text-[17px] leading-relaxed text-[#5E7067]">
              {story}
            </p>
          </div>
          <div className="cafecitos-film mx-auto w-full max-w-[400px]">
            <img
              src={DANI_IMAGE}
              alt="Dani, Cafecitos con Dani"
              className="aspect-[3/4] w-full rounded-[31px] object-cover"
            />
          </div>
        </section>
        <section className="border-y border-[#C9E2D5] py-10">
          <p className="mb-5 text-[12px] font-bold uppercase tracking-[1.6px] text-[#007239]">
            Formas de colaborar
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((item, index) => (
              <article
                key={item.id}
                className="rounded-[26px] bg-[#EAF4EE] p-6"
              >
                <div className="flex gap-4">
                  <span className="text-[13px] font-bold text-[#007239]">
                    0{index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-[25px] font-bold leading-[1.02] tracking-[-.04em]">
                        {item.name}
                      </h2>
                      <span className="shrink-0 rounded-full bg-[#00613E] px-3.5 py-1.5 text-[14px] text-white">
                        {price(item.price)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="mt-4 text-[14px] leading-relaxed text-[#5E7067]">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section
          aria-label="Videos recientes de Cafecitos con Dani"
          className="py-11"
        >
          <p className="mb-5 text-[12px] font-bold uppercase tracking-[1.6px] text-[#007239]">
            Historias recientes
          </p>
          <div>
            <StoriesPhone />
          </div>
        </section>
      </main>
    </div>
  )
}
