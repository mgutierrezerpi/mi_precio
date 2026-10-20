import { describe, expect, it } from 'vitest'
import { initialsOf } from './initials'

describe('initialsOf (B11)', () => {
  it('takes one letter per word, the same everywhere', () => {
    expect(initialsOf('Café Ñandú QA')).toBe('CÑ')
    expect(initialsOf('Café Aurora')).toBe('CA')
    expect(initialsOf('Kiosco')).toBe('K')
    expect(initialsOf('  doble   espacio ')).toBe('DE')
  })

  it('falls back when there is no name', () => {
    expect(initialsOf('')).toBe('U')
    expect(initialsOf(' ', '?')).toBe('?')
  })
})
