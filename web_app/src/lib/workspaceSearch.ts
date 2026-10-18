import api from '../services/api'

/** Where «Buscar en el espacio de trabajo» should take the user.
 *
 *  It used to open Products for any query, so searching a customer («Methol»)
 *  or a list found nothing. Now the query goes to the first screen that has a
 *  match — products, then customers, then lists — and that screen opens
 *  already filtered by it. */

interface Searchable {
  products: { name: string; sku?: string | null; category?: string | null }[]
  customers: { name: string; email?: string | null; phone?: string | null }[]
  lists: { name: string }[]
}

const has = (q: string, ...fields: (string | null | undefined)[]) =>
  fields.some((field) => field?.toLowerCase().includes(q))

export function pickSearchTarget(query: string, data: Searchable): string {
  const q = query.trim().toLowerCase()
  if (!q) return '/admin/items'
  const param = `?q=${encodeURIComponent(query.trim())}`
  if (data.products.some((p) => has(q, p.name, p.sku, p.category)))
    return `/admin/items${param}`
  if (data.customers.some((c) => has(q, c.name, c.email, c.phone)))
    return `/admin/customers${param}`
  if (data.lists.some((l) => has(q, l.name))) return `/admin/lists${param}`
  return `/admin/items${param}`
}

export async function workspaceSearchTarget(
  tenantId: string,
  query: string
): Promise<string> {
  if (!query.trim()) return '/admin/items'
  const [products, customers, lists] = await Promise.all([
    api.getProducts(tenantId),
    api.getCustomers(tenantId),
    api.getLists(tenantId),
  ])
  return pickSearchTarget(query, {
    products: products.data ?? [],
    customers: customers.data ?? [],
    lists: lists.data ?? [],
  })
}
