import type { Item, ListContent } from '../../types'

export interface MenuSection {
  key: string
  name: string
  items: Item[]
  min: number
  max: number
}

export function buildMenuSections(
  items: Item[],
  content: ListContent | null,
  normalize: (value?: string | null) => string,
  display: (value?: string | null) => string
): MenuSection[] {
  const map = new Map<string, { key: string; name: string; items: Item[] }>()
  for (const item of items) {
    const key = normalize(item.category)
    if (!map.has(key)) map.set(key, { key, name: display(item.category), items: [] })
    map.get(key)!.items.push(item)
  }
  const inferred = Array.from(map.values()).map((section) => {
    const prices = section.items.map((item) => parseFloat(item.price)).filter((n) => !Number.isNaN(n))
    return {
      ...section,
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    }
  })
  const catalog = content?.blocks.find((block) => block.type === 'catalog')
  if (!catalog || catalog.type !== 'catalog') return inferred
  const remaining = new Map(inferred.map((section) => [section.key, section]))
  const ordered = catalog.sections.flatMap((definition) => {
    const section = remaining.get(normalize(definition.source.value))
    if (!section) return []
    remaining.delete(section.key)
    return [{ ...section, name: definition.title }]
  })
  return [...ordered, ...remaining.values()]
}
