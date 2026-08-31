import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { landingText } from './homeContent'

/** Floating button that scrolls back to the top once the user has scrolled down. */
export function BackToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <button
      type="button"
      aria-label={landingText('Volver arriba', 'Back to top')}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/80 bg-gradient-to-br from-[#2A1C66] to-[#6C43E8] text-white shadow-[0_18px_34px_-8px_rgba(16,9,34,0.95)] ring-4 ring-[#6C43E8]/30 transition-all duration-300 hover:-translate-y-1 hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white ${show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  )
}

/** Fades + slides its content up the first time it scrolls into view. */
export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      style={{ transitionDelay: shown ? `${delay}ms` : '0ms' }}
      className={`transition-all duration-700 ease-out ${shown ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} ${className}`}
    >
      {children}
    </div>
  )
}

export function SectionHead({
  eyebrow,
  title,
  subtitle,
  eyebrowColor = 'text-[#7C3AED]',
  inverted = false,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  eyebrowColor?: string
  inverted?: boolean
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-3.5 text-center">
      <p
        className={`text-[13px] font-bold uppercase tracking-[0.15em] ${eyebrowColor}`}
      >
        {eyebrow}
      </p>
      <h2
        className={`text-3xl font-extrabold leading-tight tracking-tight md:text-[42px] ${inverted ? 'text-white' : 'text-[#0F172A]'}`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`text-base ${inverted ? 'text-indigo-100' : 'text-[#64748B]'}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
/** A live list renderer, deliberately shared with the design-picker thumbnails.
 * This keeps landing examples representative as templates evolve—no stale
 * screenshots or separately maintained mockups. */
export function MiniListPreview({
  className = '',
  variant,
}: {
  className?: string
  variant: 'wild-stem-verano' | 'obsidian'
}) {
  return (
    <div
      className={`landing-list-preview relative h-[430px] overflow-hidden rounded-[28px] border border-[var(--dash-soft-border)] bg-[var(--dash-surface)] sm:h-[500px] ${className}`}
    >
      <iframe
        title={`Vista previa de plantilla ${variant}`}
        src={`/template-preview/${variant}`}
        className="pointer-events-none h-full w-full border-0"
      />
    </div>
  )
}
