import type { MagazinePage } from '../../types'
import type { MagazinePageContent } from '../../components/magazine/templateCatalog'

const MONO = '"IBM Plex Mono", "Courier New", monospace'

export function MagazineArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: 'previous' | 'next'
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={direction === 'previous' ? 'Previous page' : 'Next page'}
      disabled={disabled}
      onClick={onClick}
      className="absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#F3EDE2]/20 bg-[#3A2A1D]/85 text-3xl font-light text-[#F3EDE2] shadow-lg transition hover:bg-[#3A2A1D] disabled:pointer-events-none disabled:opacity-20 sm:h-14 sm:w-14"
      style={{
        [direction === 'previous' ? 'left' : 'right']:
          'max(12px, calc((100% - 820px) / 2))',
      }}
    >
      {direction === 'previous' ? '‹' : '›'}
    </button>
  )
}

export function MagazineLensControl({
  active,
  onToggle,
}: {
  active: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      aria-label={active ? 'Turn off magnifier' : 'Turn on magnifier'}
      aria-pressed={active}
      onClick={onToggle}
      className={`flex h-9 items-center gap-1.5 rounded-full border px-3 shadow-lg transition ${active ? 'border-[#D6B58B] bg-[#D6B58B] text-[#3A2A1D]' : 'border-[#F3EDE2]/15 bg-[#3A2A1D]/90 text-[#F3EDE2]'}`}
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <circle cx="10.8" cy="10.8" r="6.3" />
        <path d="m15.5 15.5 5 5" strokeLinecap="round" />
      </svg>
      <span
        className="text-[9px] uppercase tracking-[1.2px]"
        style={{ fontFamily: MONO }}
      >
        {active ? 'Lens on' : 'Lens'}
      </span>
    </button>
  )
}

export function PencilLayoutForPage(
  page: MagazinePage,
  content: MagazinePageContent
) {
  if (content.layout) return content.layout
  if (page.position === 0 || page.pageType === 'cover') return 'cover'
  if (page.position === 1) return 'pantry'
  if (page.position === 2) return 'pairing'
  if (page.pageType === 'profile') return 'profile'
  if (page.pageType === 'catalog') return 'hot-shelf'
  if (page.pageType === 'recipe') return 'recipe'
  if (page.pageType === 'history') return 'history'
  if (page.position === 7) return 'long-form'
  if (page.pageType === 'notes') return 'one-image'
  return 'editorial'
}
