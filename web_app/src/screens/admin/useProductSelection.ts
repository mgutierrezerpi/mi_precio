import { useMemo, useState } from 'react'
import type { Product } from '../../types'

export function useProductSelection(products: Product[], visible: Product[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const visibleIds = useMemo(
    () => visible.map((product) => product.id),
    [visible]
  )
  const allSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
  const someSelected = selected.size > 0
  const selectedProducts = useMemo(
    () => products.filter((product) => selected.has(product.id)),
    [products, selected]
  )
  const toggleSelect = (id: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const toggleSelectAll = () =>
    setSelected((current) =>
      visibleIds.every((id) => current.has(id))
        ? new Set([...current].filter((id) => !visibleIds.includes(id)))
        : new Set([...current, ...visibleIds])
    )
  const clearSelection = () => setSelected(new Set())
  return {
    selected,
    allSelected,
    someSelected,
    selectedProducts,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  }
}
