/** Parsing for the timestamps the API sends.
 *
 *  Older responses can still carry a naive `2026-08-28T12:52:23` with no
 *  offset, and `new Date()` reads one of those as *local* time — which is how a
 *  lead created at 09:52 in Montevideo rendered as 12:52. Anything without an
 *  offset is therefore read as UTC, matching what the server actually stores.
 *
 *  Formatting stays in the viewer's own timezone: a shop owner in Montevideo
 *  sees Montevideo time, and one travelling sees the clock on their wrist.
 *  `toLocale*` with no `timeZone` already does exactly that. */
export function parseUtc(iso?: string | null): Date | null {
  if (!iso) return null
  const hasTz = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(iso)
  const d = new Date(hasTz ? iso : `${iso}Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Date + time in the viewer's timezone, or `null` if there is no timestamp. */
export function formatDateTime(
  iso: string | null | undefined,
  locale: string
): string | null {
  const d = parseUtc(iso)
  return d ? d.toLocaleString(locale) : null
}
