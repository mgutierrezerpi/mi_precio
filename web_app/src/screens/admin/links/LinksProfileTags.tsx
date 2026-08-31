import type { LinkTree } from '../../../types'
import { Field } from './Field'
import { inputClass } from './linksConstants'
import type { UpdateTree } from './linksTypes'

export function LinksProfileTags({
  tree,
  update,
}: {
  tree: LinkTree
  update: UpdateTree
}) {
  return (
    <>
      <Field label="Categorías">
        <input
          className={inputClass}
          placeholder="cerámica, diseño, regalos"
          value={tree.tags.join(', ')}
          onChange={(event) =>
            update(
              'tags',
              event.target.value
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
                .slice(0, 8)
            )
          }
        />
      </Field>
      <label className="flex items-center gap-3 self-end text-sm font-bold text-[var(--dash-text2)]">
        <input
          type="checkbox"
          checked={tree.published}
          onChange={(event) => update('published', event.target.checked)}
          className="toggle toggle-sm"
        />{' '}
        Página publicada
      </label>
    </>
  )
}
