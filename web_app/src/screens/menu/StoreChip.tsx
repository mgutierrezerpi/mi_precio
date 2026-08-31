import type { CSSProperties } from 'react'
import type { StoreColors } from './designs'

export function StoreChip({
  active,
  onClick,
  label,
  count,
  colors,
  gradient,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
  colors: StoreColors
  gradient: CSSProperties
}) {
  const style = active
    ? { ...gradient, color: '#fff', borderColor: 'transparent' }
    : { background: '#fff', color: colors.body, borderColor: colors.line }
  const badge = active
    ? { background: 'rgba(255,255,255,0.22)', color: '#fff' }
    : { background: '#F1F5F9', color: colors.body }
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 items-center gap-2 rounded-full border px-4 text-[13px] font-bold"
      style={style}
    >
      {label}
      <span
        className="rounded-full px-2 py-0.5 text-[11px] font-bold"
        style={badge}
      >
        {count}
      </span>
    </button>
  )
}
