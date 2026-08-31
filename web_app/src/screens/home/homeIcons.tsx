import type { ReactNode } from 'react'

/* ── Inline icons (lucide-style) ──────────────────────────────── */
type IcoProps = { className?: string; size?: number }
const line = (
  size: number,
  className: string | undefined,
  children: ReactNode
) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
)
export const Package = ({ className, size = 22 }: IcoProps) =>
  line(
    size,
    className,
    <>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
      <path d="m7.5 4.27 9 5.15" />
    </>
  )
export const Link2 = ({ className, size = 22 }: IcoProps) =>
  line(
    size,
    className,
    <>
      <path d="M9 17H7A5 5 0 0 1 7 7h2" />
      <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
      <line x1="8" x2="16" y1="12" y2="12" />
    </>
  )
export const QrCode = ({ className, size = 22 }: IcoProps) =>
  line(
    size,
    className,
    <>
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
    </>
  )
export const DollarSign = ({ className, size = 22 }: IcoProps) =>
  line(
    size,
    className,
    <>
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </>
  )
export const CircleCheck = ({ className, size = 20 }: IcoProps) =>
  line(
    size,
    className,
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </>
  )
export const Check = ({ className, size = 18 }: IcoProps) =>
  line(size, className, <path d="M20 6 9 17l-5-5" />)
export const Sparkles = ({ className, size = 14 }: IcoProps) =>
  line(
    size,
    className,
    <>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </>
  )
export const ArrowRight = ({ className, size = 18 }: IcoProps) =>
  line(
    size,
    className,
    <>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </>
  )
export const Plus = ({ className, size = 20 }: IcoProps) =>
  line(
    size,
    className,
    <>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </>
  )
