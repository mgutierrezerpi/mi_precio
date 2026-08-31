import type { ReactNode } from 'react'

type IconProps = { className?: string; size?: number }
const SHIELD_PATH = [
  'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6',
  'a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5',
  '19 5a1 1 0 0 1 1 1z',
].join(' ')

function icon(
  size: number,
  className: string | undefined,
  children: ReactNode
) {
  return (
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
}

export const XIcon = ({ className, size = 18 }: IconProps) =>
  icon(
    size,
    className,
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  )

export const MailIcon = ({ className, size = 18 }: IconProps) =>
  icon(
    size,
    className,
    <>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  )

export const LockIcon = ({ className, size = 18 }: IconProps) =>
  icon(
    size,
    className,
    <>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  )

export const ArrowRight = ({ className, size = 18 }: IconProps) =>
  icon(
    size,
    className,
    <>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </>
  )

export const ShieldCheck = ({ className, size = 14 }: IconProps) =>
  icon(
    size,
    className,
    <>
      <path d={SHIELD_PATH} />
      <path d="m9 12 2 2 4-4" />
    </>
  )
