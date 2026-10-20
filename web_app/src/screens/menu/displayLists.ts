interface ListRef {
  id: string
  slug: string | null
  showOnIndex?: boolean
}

/**
 * The lists a public page shows. `/p/{sub}/{list}` shows that list (by id or
 * slug); `/p/{sub}` shows the shop's main list — the one marked "principal",
 * else the first published one.
 *
 * The index used to merge every published list, which repeated each product
 * once per list, each with that list's own (possibly special) price.
 */
export function pickDisplayLists<T extends ListRef>(
  lists: T[],
  listId?: string
): T[] {
  if (listId) return lists.filter((l) => l.id === listId || l.slug === listId)
  const main = lists.find((l) => l.showOnIndex) ?? lists[0]
  return main ? [main] : []
}
