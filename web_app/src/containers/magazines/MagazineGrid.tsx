import type { TFn } from '../../lib/i18n'
import type { Magazine } from '../../types'
import { MagazineCard } from '../../components/magazine/MagazineCard'

export function MagazineGrid({
  rows,
  subdomain,
  canEdit,
  t,
  onDelete,
  onEdit,
  onToggleIndex,
  onTogglePublished,
}: {
  rows: Magazine[]
  subdomain?: string
  canEdit: boolean
  t: TFn
  onDelete: (magazine: Magazine) => void
  onEdit: (magazine: Magazine) => void
  onToggleIndex: (magazine: Magazine) => void
  onTogglePublished: (magazine: Magazine) => void
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((magazine) => (
        <MagazineCard
          key={magazine.id}
          magazine={magazine}
          subdomain={subdomain}
          canEdit={canEdit}
          onEdit={() => onEdit(magazine)}
          onTogglePublished={() => onTogglePublished(magazine)}
          onToggleIndex={() => onToggleIndex(magazine)}
          onDelete={() => onDelete(magazine)}
          t={t}
        />
      ))}
    </div>
  )
}
