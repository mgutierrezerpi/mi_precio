import type { Item } from '../../../types'
import { PencilIcon, TrashIcon } from './ListItemIcons'

interface ListItemSummaryProps {
  item: Item
  canEdit: boolean
  formatPrice: (price: string) => string
  onEdit: (item: Item) => void
  onDelete: (itemId: string) => void
}

export function ListItemSummary({
  item,
  canEdit,
  formatPrice,
  onEdit,
  onDelete,
}: ListItemSummaryProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <span className="text-[var(--color-text-primary)] font-medium truncate">
            {item.name}
          </span>
          {item.category && (
            <span className="soft-badge text-[10px]">{item.category}</span>
          )}
          {item.description && (
            <span className="text-[var(--color-text-subtle)] text-sm truncate hidden md:inline">
              — {item.description}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[var(--color-accent)] font-medium whitespace-nowrap">
          {formatPrice(item.price)}
        </span>
        {canEdit && (
          <div className="flex items-center gap-1">
            <button
              aria-label={`Editar ${item.name}`}
              className="p-2 text-[var(--color-text-subtle)] hover:text-[var(--color-accent)]
                hover:bg-[var(--color-accent-soft)] rounded-xl transition-all"
              onClick={() => onEdit(item)}
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              aria-label={`Eliminar ${item.name}`}
              className="p-2 text-[var(--color-text-subtle)] hover:text-[var(--color-error)]
                hover:bg-[var(--color-error-soft)] rounded-xl transition-all"
              onClick={() => onDelete(item.id)}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
