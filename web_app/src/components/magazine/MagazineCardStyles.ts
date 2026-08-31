export const MAGAZINE_CARD_CLASSES = {
  card: [
    'flex min-h-[245px] flex-col overflow-hidden rounded-2xl border border-[var(--dash-border)]',
    'bg-[var(--dash-surface)] shadow-[0_10px_30px_-24px_rgba(15,23,42,0.8)]',
  ].join(' '),
  actionButton: [
    'flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--dash-soft)]',
    'text-[var(--dash-text2)] hover:text-[var(--dash-text)]',
  ].join(' '),
  openLink: [
    'flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--dash-soft)]',
    'text-xs font-bold text-[var(--dash-link)] hover:opacity-80',
  ].join(' '),
  publishButton: [
    'flex h-9 items-center justify-center rounded-lg bg-[var(--dash-soft)] px-2.5 text-xs',
    'font-bold text-[var(--dash-text2)] hover:text-[var(--dash-text)]',
  ].join(' '),
  unpublished: [
    'flex h-9 flex-1 items-center justify-center rounded-lg bg-[var(--dash-soft)]',
    'text-xs font-semibold text-[var(--dash-muted)]',
  ].join(' '),
} as const
