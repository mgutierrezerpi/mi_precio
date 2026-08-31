import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Product } from '../../types'
import {
  parseUtcDate,
  readPageSize,
  savePageSize,
  type PageSize,
} from './productScreenUtils'
import type { SortKey, Status } from './productScreenTypes'

export function useProductFilters(products: Product[], tenantId?: string) {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [status, setStatus] = useState<Status>('all')
  const [category, setCategory] = useState(searchParams.get('cat') || 'all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(() =>
    readPageSize(tenantId)
  )
  const [sort, setSort] = useState<SortKey>('recent')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')

  useEffect(() => {
    if (tenantId) savePageSize(tenantId, pageSize)
  }, [pageSize, tenantId])

  const categories = useMemo(() => {
    const values = new Map<string, string>()
    products.forEach((product) => {
      const value = product.category?.trim()
      if (value && !values.has(value.toLowerCase()))
        values.set(value.toLowerCase(), value)
    })
    return Array.from(values.values()).sort((a, b) => a.localeCompare(b))
  }, [products])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const cat = category.trim().toLowerCase()
    const min = parseFloat(priceMin)
    const max = parseFloat(priceMax)
    return products.filter((product) => {
      if (
        category !== 'all' &&
        (product.category?.trim().toLowerCase() ?? '') !== cat
      )
        return false
      const price = parseFloat(product.price)
      if (!Number.isNaN(min) && (Number.isNaN(price) || price < min))
        return false
      if (!Number.isNaN(max) && (Number.isNaN(price) || price > max))
        return false
      return (
        !query ||
        [product.name, product.sku, product.category].some((value) =>
          value?.toLowerCase().includes(query)
        )
      )
    })
  }, [products, search, category, priceMin, priceMax])

  const visible = useMemo(() => {
    const source =
      status === 'recent'
        ? [...filtered]
            .sort(
              (a, b) => +parseUtcDate(b.createdAt) - +parseUtcDate(a.createdAt)
            )
            .slice(0, 12)
        : filtered.filter(
            (product) =>
              status === 'all' ||
              (status === 'nophoto' && !product.imageUrl) ||
              (status === 'available' && product.available) ||
              (status === 'unavailable' && !product.available)
          )
    const price = (product: Product) => parseFloat(product.price) || 0
    const compare: Record<SortKey, (a: Product, b: Product) => number> = {
      recent: (a, b) => +parseUtcDate(b.createdAt) - +parseUtcDate(a.createdAt),
      'name-asc': (a, b) => a.name.localeCompare(b.name),
      'name-desc': (a, b) => b.name.localeCompare(a.name),
      'price-asc': (a, b) => price(a) - price(b),
      'price-desc': (a, b) => price(b) - price(a),
    }
    return [...source].sort(compare[sort])
  }, [filtered, status, sort])

  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageItems = visible.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  )
  const resetTo = (action: () => void) => {
    action()
    setPage(1)
  }
  const clearFilters = () =>
    resetTo(() => {
      setStatus('all')
      setCategory('all')
      setPriceMin('')
      setPriceMax('')
      setSearch('')
    })
  return {
    search,
    setSearch,
    status,
    setStatus,
    category,
    setCategory,
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    setSort,
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    categories,
    visible,
    pageItems,
    totalPages,
    safePage,
    resetTo,
    clearFilters,
  }
}
