import type { LinkTree } from '../../../types'
import { Field } from './Field'
import { inputClass } from './linksConstants'
import type { UpdateTree } from './linksTypes'

export function LinksContact({
  tree,
  update,
}: {
  tree: LinkTree
  update: UpdateTree
}) {
  const fields = [
    ['Instagram', 'https://instagram.com/…', 'instagramUrl'],
    ['TikTok', 'https://tiktok.com/@…', 'tiktokUrl'],
    ['Email', 'hola@tu-negocio.com', 'emailUrl'],
    ['WhatsApp', 'https://wa.me/…', 'whatsappUrl'],
    ['Sitio web', 'https://…', 'websiteUrl'],
    ['Ubicación', 'https://maps.google.com/…', 'locationUrl'],
  ] as const
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map(([label, placeholder, key]) => (
        <Field key={key} label={label}>
          <input
            className={inputClass}
            type={key === 'emailUrl' ? 'email' : undefined}
            placeholder={placeholder}
            value={
              key === 'emailUrl'
                ? tree.emailUrl?.replace(/^mailto:/i, '') || ''
                : tree[key] || ''
            }
            onChange={(event) => update(key, event.target.value || null)}
          />
        </Field>
      ))}
    </div>
  )
}
