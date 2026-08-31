import type { ReactNode } from 'react'

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block text-xs font-bold text-[var(--dash-text2)]">
      {label}
      {children}
    </label>
  )
}
