import { describe, expect, it } from 'vitest'
import { publicListStatus } from '../../src/lib/publicListStatus'

const list = (overrides = {}) => ({
  published: true,
  live: true,
  showOnIndex: false,
  isPrivate: false,
  ...overrides,
})

describe('publicListStatus', () => {
  it('asks to create a list only when there are none', () => {
    expect(publicListStatus([])).toEqual({ kind: 'none' })
  })

  it('reports a published private list as private', () => {
    expect(publicListStatus([list({ isPrivate: true })])).toEqual({
      kind: 'private',
    })
  })

  it('does not offer a private main list as the public link', () => {
    const open = list()
    const status = publicListStatus([
      list({ isPrivate: true, showOnIndex: true }),
      open,
    ])
    expect(status).toEqual({ kind: 'public', list: open })
  })

  it('prefers the main list among the public ones', () => {
    const main = list({ showOnIndex: true })
    expect(publicListStatus([list(), main])).toEqual({
      kind: 'public',
      list: main,
    })
  })

  it('tells drafts apart from lists the plan is not serving', () => {
    expect(publicListStatus([list({ published: false })])).toEqual({
      kind: 'draft',
    })
    expect(publicListStatus([list({ live: false })])).toEqual({
      kind: 'hidden',
    })
  })
})
