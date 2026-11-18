import type { PriceList } from '../types'

type ListState = Pick<
  PriceList,
  'published' | 'live' | 'showOnIndex' | 'isPrivate'
>

export type PublicListStatus<T> =
  | { kind: 'public'; list: T }
  /** Published and served, but only to people with a code. */
  | { kind: 'private' }
  /** Published, but its dates or the current plan keep it from being served. */
  | { kind: 'hidden' }
  /** Lists exist, none published yet. */
  | { kind: 'draft' }
  | { kind: 'none' }

/** What the shop can actually share right now.
 *
 *  The main list wins, but any list anyone can open counts as public: the
 *  dashboard used to tell shops with a published list to go create one. */
export function publicListStatus<T extends ListState>(
  lists: T[]
): PublicListStatus<T> {
  const served = lists.filter((list) => list.published && list.live)
  const open = served.filter((list) => !list.isPrivate)
  const list = open.find((candidate) => candidate.showOnIndex) ?? open[0]
  if (list) return { kind: 'public', list }
  if (served.length > 0) return { kind: 'private' }
  if (lists.some((candidate) => candidate.published)) return { kind: 'hidden' }
  return { kind: lists.length > 0 ? 'draft' : 'none' }
}
