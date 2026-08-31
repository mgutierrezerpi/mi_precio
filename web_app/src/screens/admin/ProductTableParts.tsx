import { gradient } from './crm/theme'

export function Checkbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked?: boolean
  indeterminate?: boolean
  onChange?: () => void
}) {
  const on = checked || indeterminate
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : !!checked}
      onClick={(event) => {
        event.stopPropagation()
        onChange?.()
      }}
      className={`flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border-[1.5px] text-white transition ${on ? `border-transparent ${gradient}` : 'border-[#CBD5E1] bg-[var(--dash-surface)] hover:border-[var(--dash-link)]'}`}
    >
      {indeterminate ? (
        <span className="h-[2px] w-2.5 rounded bg-white" />
      ) : checked ? (
        <span className="text-[11px] font-black leading-none">✓</span>
      ) : null}
    </button>
  )
}
