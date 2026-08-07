import type { Item } from '../../../types'

export interface ItemDraft {
  name: string
  price: string
  description: string
  category: string
}

interface ListItemsProps {
  items: Item[]
  canEdit: boolean
  editingItemId: string | null
  editedItem: ItemDraft
  formatPrice: (price: string) => string
  onEdit: (item: Item) => void
  onDelete: (itemId: string) => void
  onSave: () => void
  onCancel: () => void
  onEditedItemChange: (item: ItemDraft) => void
}

export function ListItems({
  items,
  canEdit,
  editingItemId,
  editedItem,
  formatPrice,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onEditedItemChange,
}: ListItemsProps) {
  return (
    <div className="divide-y divide-[var(--color-border)]">
      {items.map((item) => (
        <article
          key={item.id}
          className="p-4 hover:bg-[var(--color-bg-hover)]/50 transition-colors"
        >
          {editingItemId === item.id ? (
            <ItemEditor
              item={editedItem}
              onChange={onEditedItemChange}
              onSave={onSave}
              onCancel={onCancel}
            />
          ) : (
            <ItemSummary
              item={item}
              canEdit={canEdit}
              formatPrice={formatPrice}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )}
        </article>
      ))}
    </div>
  )
}

interface ItemEditorProps {
  item: ItemDraft
  onChange: (item: ItemDraft) => void
  onSave: () => void
  onCancel: () => void
}

function ItemEditor({ item, onChange, onSave, onCancel }: ItemEditorProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <input
          autoFocus
          className="soft-input md:col-span-5 py-2"
          placeholder="Nombre"
          type="text"
          value={item.name}
          onChange={(event) => onChange({ ...item, name: event.target.value })}
        />
        <input
          className="soft-input md:col-span-2 py-2"
          placeholder="Precio"
          type="number"
          value={item.price}
          onChange={(event) => onChange({ ...item, price: event.target.value })}
        />
        <input
          className="soft-input md:col-span-3 py-2"
          placeholder="Categoría (ej: Bebidas)"
          type="text"
          value={item.category}
          onChange={(event) =>
            onChange({ ...item, category: event.target.value })
          }
        />
        <div className="md:col-span-2 flex items-center justify-end gap-2">
          <button
            aria-label="Guardar producto"
            className="p-2 text-[var(--color-success)] hover:bg-[var(--color-success-soft)]
              rounded-xl transition-colors"
            onClick={onSave}
          >
            <CheckIcon className="w-4 h-4" />
          </button>
          <button
            aria-label="Cancelar edición"
            className="p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)]
              rounded-xl transition-colors"
            onClick={onCancel}
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      <input
        className="soft-input w-full py-2"
        placeholder="Descripción (opcional)"
        type="text"
        value={item.description}
        onChange={(event) =>
          onChange({ ...item, description: event.target.value })
        }
      />
    </div>
  )
}

interface ItemSummaryProps {
  item: Item
  canEdit: boolean
  formatPrice: (price: string) => string
  onEdit: (item: Item) => void
  onDelete: (itemId: string) => void
}

function ItemSummary({
  item,
  canEdit,
  formatPrice,
  onEdit,
  onDelete,
}: ItemSummaryProps) {
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        d="m4.5 12.75 6 6 9-13.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="m6 18 12-12M6 6l12 12" strokeLinecap="round" />
    </svg>
  )
}

function PencilIcon({ className }: { className?: string }) {
  const path = [
    'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82',
    'a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897',
    'l12.682-12.681Z',
  ].join(' ')
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  const path = [
    'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21 1.022.166m-1.022-.165L18.16 19.673',
    'a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79',
    'm14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562 1.022-.165m0 0',
    'a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916a2.25 2.25 0 0 0-2.09-2.201',
    'a51.964 51.964 0 0 0-3.32 0 2.25 2.25 0 0 0-2.09 2.201v.916m7.5 0',
    'a48.667 48.667 0 0 0-7.5 0',
  ].join(' ')
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
