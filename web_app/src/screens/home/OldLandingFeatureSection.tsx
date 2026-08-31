import type { ReactNode } from 'react'

export function OldLandingFeatureSection({
  eyebrow,
  title,
  description,
  dark = false,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  dark?: boolean
  children: ReactNode
}) {
  return (
    <section
      className={`border-t border-[var(--color-border)] py-24 px-6 ${dark ? 'bg-[var(--color-bg-secondary)]' : ''}`}
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <span className="text-[var(--color-accent)] text-sm tracking-[0.3em] uppercase">
            {eyebrow}
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-light text-[var(--color-text-primary)] leading-tight">
            {title}
          </h2>
          <p className="mt-6 text-[var(--color-text-muted)] leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex justify-center">
          <div className="space-y-4">{children}</div>
        </div>
      </div>
    </section>
  )
}

export function OldLandingFormatCard({
  icon,
  title,
  description,
  highlighted = false,
}: {
  icon: string
  title: string
  description: string
  highlighted?: boolean
}) {
  const border = highlighted
    ? 'border-[var(--color-accent)]'
    : 'border-[var(--color-border)]'
  return (
    <div
      className={`flex items-center gap-4 p-4 bg-[var(--color-bg-card)] border ${border} rounded`}
    >
      <span className="text-[var(--color-accent)] text-2xl">{icon}</span>
      <div>
        <p className="text-[var(--color-text-primary)] text-sm">{title}</p>
        <p className="text-[var(--color-text-muted)] text-xs">{description}</p>
      </div>
    </div>
  )
}
