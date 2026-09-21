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

  it('hides the whole Northline, Wild Stem, Casa Férrea and Fromage families, and Parchment', () => {
    const offered = pickableListDesigns('store')
    for (const design of [
      'pencil-workshop',
      'pencil-hardware-weekend',
      'pencil-hardware-shelf',
      'pencil-hardware-alternating',
      'pencil-flower',
      'pencil-flower-winter',
      'pencil-flower-spring',
      'pencil-flower-summer',
      'pencil-casa-ritual',
      'pencil-casa-bath',
      'pencil-casa-signature',
      'pencil-casa-services',
      'pencil-cheese',
      'pencil-cheese-alternating',
      'pencil-wine',
      'pencil-blush-bloom',
    ] as const)
      expect(offered).not.toContain(design)
    // Not part of any request: the base designs and the other Pencil ones stay.
    expect(offered).toContain('store')
    expect(offered).toContain('pencil-auto-detail')
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
