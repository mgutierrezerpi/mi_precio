export const inputCls =
  'h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 text-sm font-medium text-[var(--dash-text)] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 placeholder:text-[var(--dash-muted)]'

export function ToggleRow({
  label,
  desc,
  value,
  onToggle,
}: {
  label: string
  desc: string
  value: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-3.5 py-3">
      <div className="flex flex-col">
        <span className="text-[13px] font-bold text-[var(--dash-text)]">{label}</span>
        <span className="text-[11px] font-medium text-[var(--dash-muted)]">{desc}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={onToggle}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${value ? 'bg-[#10B981]' : 'bg-[var(--dash-border)]'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${value ? 'left-[22px]' : 'left-0.5'}`}
        />
      </button>
    </div>
  )
}

export function formatListPrice(
  price: string,
  currency: string,
  locale: string
): string {
  const value = Number(price)
  if (Number.isNaN(value)) return price
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)
  }
}
