import { describe, expect, it } from 'vitest'
import { pickDisplayLists } from './displayLists'

const menu = { id: 'm1', slug: 'menu', showOnIndex: true }
const promos = { id: 'p1', slug: 'promos', showOnIndex: false }
const wholesale = { id: 'w1', slug: 'mayorista', showOnIndex: false }

describe('pickDisplayLists', () => {
  it('shows only the main list on the index, not every list merged', () => {
    expect(pickDisplayLists([promos, menu, wholesale])).toEqual([menu])
  })

  it('falls back to the first list when none is marked as main', () => {
    expect(pickDisplayLists([promos, wholesale])).toEqual([promos])
  })

  it('shows nothing when the shop has no published lists', () => {
    expect(pickDisplayLists([])).toEqual([])
  })

  it('finds a specific list by slug or by id', () => {
    expect(pickDisplayLists([menu, promos], 'promos')).toEqual([promos])
    expect(pickDisplayLists([menu, promos], 'p1')).toEqual([promos])
    expect(pickDisplayLists([menu, promos], 'nope')).toEqual([])
  })
})
