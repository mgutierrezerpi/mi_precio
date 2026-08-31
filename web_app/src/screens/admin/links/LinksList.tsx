import type { LinkTree, LinkTreeLink } from '../../../types'
import { Icon } from '../crm/ui'
import { LinkEditor } from './LinkEditor'
import { EMPTY_LINK } from './linksConstants'

export function LinksList({
  tree,
  canEdit,
  update,
  updateLink,
  removeLink,
  moveLink,
}: {
  tree: LinkTree
  canEdit: boolean
  update: <K extends keyof LinkTree>(key: K, value: LinkTree[K]) => void
  updateLink: (index: number, link: LinkTreeLink) => void
  removeLink: (index: number) => void
  moveLink: (index: number, direction: -1 | 1) => void
}) {
  return (
    <article className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-[var(--dash-text)]">
            Tus links{' '}
            <span className="ml-1 rounded-full bg-[var(--dash-soft)] px-2 py-0.5 text-xs text-[var(--dash-text2)]">
              {tree.links.filter((link) => link.enabled).length}
            </span>
          </h2>
          <p className="mt-1 text-xs text-[var(--dash-muted)]">
            Abrí un link para editarlo. Usá las flechas para ordenar.
          </p>
        </div>
        <button
          type="button"
          disabled={!canEdit}
          onClick={() =>
            update('links', [
              ...tree.links,
              { ...EMPTY_LINK, id: crypto.randomUUID() },
            ])
          }
          aria-label="Agregar link"
          title="Agregar link"
          className="btn btn-sm tooltip tooltip-left inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--dash-soft)] !p-0 text-[var(--dash-link)] disabled:opacity-50"
          data-tip="Agregar link"
        >
          <Icon name="plus" size={16} />
        </button>
      </div>
      <div className="space-y-3">
        {tree.links.map((link, index) => (
          <LinkEditor
            key={link.id || index}
            link={link}
            index={index}
            total={tree.links.length}
            disabled={!canEdit}
            onChange={(next) => updateLink(index, next)}
            onRemove={() => removeLink(index)}
            onMove={(direction) => moveLink(index, direction)}
          />
        ))}
      </div>
    </article>
  )
}
