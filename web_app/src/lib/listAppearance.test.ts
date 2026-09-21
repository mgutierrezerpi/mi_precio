import { describe, expect, it } from 'vitest'
import {
  HIDDEN_LIST_DESIGNS,
  LIST_DESIGNS,
  pickableListDesigns,
} from './listAppearance'

describe('pickableListDesigns', () => {
  it('keeps only "Diario" of the Maison Étoile editions on offer', () => {
    const offered = pickableListDesigns('store')
    expect(offered).toContain('pencil-bakery')
    expect(offered).not.toContain('pencil-garden')
    expect(offered).not.toContain('pencil-market')
    expect(offered).not.toContain('pencil-evening')
  })

  it('still lists a hidden design for the shop already using it', () => {
    expect(pickableListDesigns('pencil-market')).toContain('pencil-market')
    expect(pickableListDesigns('pencil-market')).not.toContain('pencil-garden')
  })

  it('hides without retiring: hidden designs stay valid list designs', () => {
    for (const design of HIDDEN_LIST_DESIGNS)
      expect(LIST_DESIGNS).toContain(design)
  })
})
