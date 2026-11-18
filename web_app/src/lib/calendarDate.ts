/** Calendar days (`YYYY-MM-DD`), such as a price list's validity period.
 *
 *  They name the day the owner picked, not an instant. Reading one with
 *  `new Date('2026-09-01')` means midnight UTC, which Montevideo shows as
 *  31/8, so these helpers only ever build dates from local year/month/day. */

const pad = (value: number) => String(value).padStart(2, '0')

const toCalendarDay = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

function localDate(day: string): Date {
  const [year, month, date] = day.split('-').map(Number)
  return new Date(year, month - 1, date)
}

/** The day a value was written for, ignoring any time or offset it carries. */
export function calendarDay(value?: string | null): string | null {
  return value?.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? null
}

/** That same day in the reader's date format, or `''` when there is none. */
export function formatCalendarDay(
  value?: string | null,
  locale?: string
): string {
  const day = calendarDay(value)
  return day ? localDate(day).toLocaleDateString(locale) : ''
}

export function todayCalendarDay(now: Date = new Date()): string {
  return toCalendarDay(now)
}

export function addCalendarDays(day: string, days: number): string {
  const date = localDate(day)
  date.setDate(date.getDate() + days)
  return toCalendarDay(date)
}

/** The next Monday after `day`; a Monday gives the one a week later. */
export function nextMondayCalendarDay(day: string): string {
  return addCalendarDays(day, (8 - localDate(day).getDay()) % 7 || 7)
}
