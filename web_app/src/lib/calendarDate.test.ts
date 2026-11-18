import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import {
  addCalendarDays,
  calendarDay,
  formatCalendarDay,
  nextMondayCalendarDay,
  todayCalendarDay,
} from './calendarDate'

describe('calendar days in Montevideo (UTC-3)', () => {
  beforeAll(() => {
    vi.stubEnv('TZ', 'America/Montevideo')
  })

  afterAll(() => {
    vi.unstubAllEnvs()
  })

  it('shows the day that was picked, not the day before', () => {
    expect(formatCalendarDay('2026-09-01', 'es-UY')).toBe('1/9/2026')
    expect(formatCalendarDay('2026-09-30', 'es-UY')).toBe('30/9/2026')
  })

  it('reads rows saved as midnight UTC as the day they were written for', () => {
    expect(calendarDay('2026-09-01T00:00:00Z')).toBe('2026-09-01')
    expect(formatCalendarDay('2026-09-01T00:00:00Z', 'es-UY')).toBe('1/9/2026')
  })

  it('reads rows saved with a time as the day they were written for', () => {
    expect(calendarDay('2026-09-01T21:30')).toBe('2026-09-01')
  })

  it('has nothing to show without a date', () => {
    expect(calendarDay(null)).toBeNull()
    expect(formatCalendarDay(undefined)).toBe('')
  })

  it('takes today from the local calendar, late at night too', () => {
    // 22:00 on the 30th in Montevideo is already the 1st in UTC.
    expect(todayCalendarDay(new Date('2026-10-01T01:00:00Z'))).toBe(
      '2026-09-30'
    )
  })

  it('adds days across the end of a month', () => {
    expect(addCalendarDays('2026-09-30', 1)).toBe('2026-10-01')
    expect(addCalendarDays('2026-09-01', 30)).toBe('2026-10-01')
  })

  it('finds the next Monday', () => {
    expect(nextMondayCalendarDay('2026-11-18')).toBe('2026-11-23') // Wednesday
    expect(nextMondayCalendarDay('2026-11-22')).toBe('2026-11-23') // Sunday
    expect(nextMondayCalendarDay('2026-11-23')).toBe('2026-11-30') // Monday
  })
})
