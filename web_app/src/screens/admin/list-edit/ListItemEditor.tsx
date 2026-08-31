import { CheckIcon, XIcon } from './ListItemIcons'
import type { ItemDraft } from './listItemTypes'

interface ListItemEditorProps {
  item: ItemDraft
  onChange: (item: ItemDraft) => void
  onSave: () => void
  onCancel: () => void
}

export function ListItemEditor({
  item,
  onChange,
  onSave,
  onCancel,
}: ListItemEditorProps) {
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
