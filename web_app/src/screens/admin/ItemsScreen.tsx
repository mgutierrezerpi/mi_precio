import { useEffect } from 'react'
import { LoadingSpinner } from '../../components'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  fetchItems,
  selectIsLoading,
  selectItems,
} from '../../store/slices/menuSlice'
import type { Item } from '../../types'

export function ItemsScreen() {
  const dispatch = useAppDispatch()
  const items = useAppSelector(selectItems)
  const isLoading = useAppSelector(selectIsLoading)
  useEffect(() => {
    dispatch(fetchItems('1'))
  }, [dispatch])
  return isLoading ? <ItemsLoading /> : <ItemsContent items={items} />
}

function ItemsLoading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}

function ItemsContent({ items }: { items: Item[] }) {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-[var(--color-text-primary)]">
            Productos
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Gestiona tus productos y precios
          </p>
        </div>
        <button className="bg-[var(--color-accent)] px-6 py-3 font-medium tracking-wide text-[var(--color-bg-primary)] transition-colors hover:bg-[var(--color-accent-hover)]">
          + Nuevo Ítem
        </button>
      </div>
      <ItemsTable items={items} />
    </div>
  )
}

function ItemsTable({ items }: { items: Item[] }) {
  return (
    <div className="overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-card)]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <TableHeader>Producto</TableHeader>
            <TableHeader className="hidden md:table-cell">
              Descripción
            </TableHeader>
            <TableHeader align="right">Precio</TableHeader>
            <TableHeader align="right">Acciones</TableHeader>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {items.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TableHeader({
  children,
  align = 'left',
  className = '',
}: {
  children: string
  align?: 'left' | 'right'
  className?: string
}) {
  const alignClass = align === 'right' ? 'text-right' : 'text-left'
  return (
    <th
      className={`px-6 py-4 ${alignClass} text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)] ${className}`}
    >
      {children}
    </th>
  )
}

function ItemRow({ item }: { item: Item }) {
  return (
    <tr className="transition-colors hover:bg-[var(--color-bg-elevated)]">
      <td className="px-6 py-4 text-[var(--color-text-primary)]">
        {item.name}
      </td>
      <td className="hidden px-6 py-4 text-sm text-[var(--color-text-muted)] md:table-cell">
        {item.description || '—'}
      </td>
      <td className="px-6 py-4 text-right text-[var(--color-accent)]">
        {formatPrice(item.price)}
      </td>
      <td className="px-6 py-4 text-right">
        <ItemActions />
      </td>
    </tr>
  )
}

function ItemActions() {
  return (
    <div className="flex items-center justify-end gap-2">
      <button className="p-2 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]">
        <EditIcon className="h-4 w-4" />
      </button>
      <button className="p-2 text-[var(--color-text-muted)] transition-colors hover:text-red-400">
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

function formatPrice(price: string): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(parseFloat(price))
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
      />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  )
}

export default ItemsScreen
