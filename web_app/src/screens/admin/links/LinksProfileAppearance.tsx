import type { LinkTree, LinkTreeFont, LinkTreeTemplate } from '../../../types'
import { Field } from './Field'
import { inputClass } from './linksConstants'
import type { UpdateTree } from './linksTypes'

export function LinksProfileAppearance({
  tree,
  update,
}: {
  tree: LinkTree
  update: UpdateTree
}) {
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <Field label="Color de acento">
        <div className="mt-1 flex gap-2">
          <input
            type="color"
            value={tree.accentColor}
            onChange={(event) =>
              update('accentColor', event.target.value.toUpperCase())
            }
            className="h-10 w-12 cursor-pointer rounded-lg border border-[var(--dash-border)] bg-transparent p-1"
          />
          <input
            className={inputClass.replace('mt-1 ', '')}
            value={tree.accentColor}
            onChange={(event) => update('accentColor', event.target.value)}
          />
        </div>
      </Field>
      <Field label="Color de fondo">
        <div className="mt-1 flex gap-2">
          <input
            type="color"
            value={tree.backgroundColor}
            onChange={(event) =>
              update('backgroundColor', event.target.value.toUpperCase())
            }
            className="h-10 w-12 cursor-pointer rounded-lg border border-[var(--dash-border)] bg-transparent p-1"
          />
          <input
            className={inputClass.replace('mt-1 ', '')}
            value={tree.backgroundColor}
            onChange={(event) => update('backgroundColor', event.target.value)}
          />
        </div>
      </Field>
      <Field label="Plantilla">
        <select
          className={inputClass}
          value={tree.template}
          onChange={(event) =>
            update('template', event.target.value as LinkTreeTemplate)
          }
        >
          <option value="botanical">Botanical · orgánica</option>
          <option value="editorial">Editorial · cálida</option>
          <option value="atelier">Atelier · suave</option>
        </select>
      </Field>
      <Field label="Tipografía">
        <select
          className={inputClass}
          value={tree.font || 'sans'}
          onChange={(event) =>
            update('font', event.target.value as LinkTreeFont)
          }
        >
          <option value="sans">Sans · moderna</option>
          <option value="editorial">Editorial · serif</option>
          <option value="mono">Mono · técnica</option>
          <option value="code-pro">Code Pro</option>
        </select>
      </Field>
    </div>
  )
}
