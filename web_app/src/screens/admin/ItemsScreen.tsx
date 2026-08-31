import { useEffect } from 'react'
import { LoadingSpinner } from '../../components'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  fetchItems,
  selectIsLoading,
  selectItems,
} from '../../store/slices/menuSlice'
import type { Item } from '../../types'
import { EditIcon, TrashIcon } from './itemIcons'

const TABLE_HEADER_CLASS = [
  'px-6 py-4 text-xs font-medium uppercase tracking-wider',
  'text-[var(--color-text-muted)]',
].join(' ')

const NEW_ITEM_BUTTON_CLASS = [
  'bg-[var(--color-accent)] px-6 py-3 font-medium tracking-wide',
  'text-[var(--color-bg-primary)] transition-colors',
  'hover:bg-[var(--color-accent-hover)]',
].join(' ')

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
        <button className={NEW_ITEM_BUTTON_CLASS}>+ Nuevo Ítem</button>
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
    <th className={`${TABLE_HEADER_CLASS} ${alignClass} ${className}`}>
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

export default ItemsScreen
