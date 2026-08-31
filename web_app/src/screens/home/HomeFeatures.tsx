import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { features, landingText } from './homeContent'
import { Reveal, SectionHead } from './homeShared'

export type Feature = (typeof features)[number]

export function FeatureCard({ Icon, color, bg, title, desc }: Feature) {
  return (
    <article className="flex h-full flex-col gap-3.5 rounded-[20px] border border-[#E2E8F0] bg-white p-6 shadow-[0_4px_16px_-6px_rgba(15,23,42,0.08)]">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: bg, color }}
      >
        <Icon size={22} />
      </div>
      <h3 className="text-lg font-bold text-[#0F172A]">{title}</h3>
      <p className="text-sm leading-relaxed text-[#475569]">{desc}</p>
    </article>
  )
}

export function HomeFeatures() {
  return (
    <section
      id="funciones"
      className="scroll-mt-24 bg-[#F5F3FF] px-5 py-24 md:px-8"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-12">
        <SectionHead
          eyebrow={landingText('Funciones', 'Features')}
          title={landingText(
            'Todo lo que tu negocio necesita para vender mejor.',
            'Everything your business needs to sell better.'
          )}
        />

        {/* Desktop: 2-column grid */}
        <Reveal className="hidden gap-6 md:grid md:grid-cols-2">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </Reveal>

        {/* Mobile: auto-advancing carousel */}
        <HomeMobileCarousel>
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </HomeMobileCarousel>
      </div>
    </section>
  )
}

// Auto-advancing carousel shown only on mobile; siblings render a grid on md+.
export function HomeMobileCarousel({ children }: { children: ReactNode[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const count = children.length

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    // Only auto-advance while the carousel layout is visible (below md).
    const mql = window.matchMedia('(min-width: 768px)')
    let timer: ReturnType<typeof setInterval> | undefined

    const start = () => {
      if (timer || mql.matches) return
      timer = setInterval(() => {
        setActive((prev) => {
          const next = (prev + 1) % count
          const card = track.children[next] as HTMLElement | undefined
          // Scroll only the horizontal track, never the page.
          if (card)
            track.scrollTo({ left: card.offsetLeft, behavior: 'smooth' })
          return next
        })
      }, 3500)
    }
    const stop = () => {
      if (timer) clearInterval(timer)
      timer = undefined
    }
    const sync = () => (mql.matches ? stop() : start())

    sync()
    mql.addEventListener('change', sync)
    return () => {
      stop()
      mql.removeEventListener('change', sync)
    }
  }, [count])

  // Keep the dots in sync when the user swipes manually.
  const onScroll = () => {
    const track = trackRef.current
    if (!track) return
    const idx = Math.round(track.scrollLeft / track.clientWidth)
    setActive(Math.max(0, Math.min(count - 1, idx)))
  }

  const goTo = (i: number) => {
    const track = trackRef.current
    const card = track?.children[i] as HTMLElement | undefined
    if (track && card)
      track.scrollTo({ left: card.offsetLeft, behavior: 'smooth' })
    setActive(i)
  }

  return (
    <div className="md:hidden">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children.map((child, i) => (
          <div key={i} className="w-full shrink-0 snap-center">
            {child}
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-center gap-2">
        {children.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={landingText(
              `Ir a la tarjeta ${i + 1}`,
              `Go to card ${i + 1}`
            )}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all ${active === i ? 'w-6 bg-[#7C3AED]' : 'w-2 bg-[#C4B5FD]'}`}
          />
        ))}
      </div>
    </div>
  )
}
