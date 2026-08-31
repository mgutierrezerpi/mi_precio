import type { Item } from '../../../types'
import { ListItemEditor } from './ListItemEditor'
import { ListItemSummary } from './ListItemSummary'
import type { ItemDraft } from './listItemTypes'

export type { ItemDraft } from './listItemTypes'

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
            <ListItemEditor
              item={editedItem}
              onChange={onEditedItemChange}
              onSave={onSave}
              onCancel={onCancel}
            />
          ) : (
            <ListItemSummary
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
