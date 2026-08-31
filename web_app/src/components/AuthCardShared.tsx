import type { ReactNode } from 'react'

export const AUTH_INPUT_CLASS_NAME = [
  'min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-medium text-[#0F172A] outline-none',
  'placeholder:text-[#94A3B8] focus:border-0 focus:outline-none focus:ring-0',
].join(' ')
export const AUTH_SUBMIT_CLASS_NAME = [
  'mt-1 flex h-[52px] items-center justify-center gap-2 rounded-[14px] bg-gradient-to-br',
  'from-[#7C3AED] to-[#A855F7] text-[15px] font-bold text-white',
  'shadow-[0_12px_24px_-6px_rgba(124,58,237,0.4)] transition hover:brightness-105',
  'disabled:cursor-not-allowed disabled:opacity-60',
].join(' ')

export function AuthField({
  label,
  icon,
  children,
}: {
  label: string
  icon: ReactNode
  children: ReactNode
}) {
  const className = [
    'flex h-12 items-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5',
    'transition-colors focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/15',
  ].join(' ')
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-[#334155]">{label}</label>
      <div className={className}>
        <span className="text-[#94A3B8]">{icon}</span>
        {children}
      </div>
    </div>
  )
}

export function AuthError({ error }: { error: string | null }) {
  return error ? (
    <p className="rounded-xl bg-[#FEF2F2] px-3.5 py-2.5 text-sm font-medium text-[#DC2626]">
      {error}
    </p>
  ) : null
}
