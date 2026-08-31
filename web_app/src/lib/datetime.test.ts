import { describe, it, expect } from 'vitest'
import { parseUtc, formatDateTime } from './datetime'

describe('parseUtc', () => {
  it('reads an offset-less timestamp as UTC, not as local time', () => {
    // The bug this exists for: the API used to send naive `datetime.utcnow()`,
    // and `new Date()` reads a string with no offset as *local*. A lead created
    // at 09:52 in Montevideo (12:52 UTC) then rendered as 12:52.
    const d = parseUtc('2026-08-28T12:52:23')
    expect(d?.toISOString()).toBe('2026-08-28T12:52:23.000Z')
  })

  it('leaves an explicit Z alone', () => {
    expect(parseUtc('2026-08-28T12:52:23Z')?.toISOString()).toBe(
      '2026-08-28T12:52:23.000Z'
    )
  })

  it('leaves an explicit numeric offset alone', () => {
    // Same instant, written from Montevideo.
    expect(parseUtc('2026-08-28T09:52:23-03:00')?.toISOString()).toBe(
      '2026-08-28T12:52:23.000Z'
    )
    expect(parseUtc('2026-08-28T09:52:23-0300')?.toISOString()).toBe(
      '2026-08-28T12:52:23.000Z'
    )
  })

  it('agrees whether or not the server stamped the offset', () => {
    expect(parseUtc('2026-08-28T12:52:23')?.getTime()).toBe(
      parseUtc('2026-08-28T12:52:23Z')?.getTime()
    )
  })

  it('returns null for nothing and for junk', () => {
    expect(parseUtc(null)).toBeNull()
    expect(parseUtc(undefined)).toBeNull()
    expect(parseUtc('')).toBeNull()
    expect(parseUtc('no es una fecha')).toBeNull()
  })
})

describe('formatDateTime', () => {
  it('returns null when there is no timestamp', () => {
    expect(formatDateTime(null, 'es-UY')).toBeNull()
  })

  it('formats the instant, so it never shows the raw UTC clock', () => {
    // Whatever zone the test machine is in, formatting must not echo "12:52"
    // back unless that machine really is on UTC.
    const out = formatDateTime('2026-08-28T12:52:23', 'es-UY')
    expect(out).not.toBeNull()
    const viaDate = new Date('2026-08-28T12:52:23Z').toLocaleString('es-UY')
    expect(out).toBe(viaDate)
  })
})
