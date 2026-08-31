import type { RefObject } from 'react'
import type { LinkTree } from '../../../types'
import { LinksProfileAppearance } from './LinksProfileAppearance'
import { LinksContact } from './LinksContact'
import { LinksProfileIdentity } from './LinksProfileIdentity'
import { LinksProfileTags } from './LinksProfileTags'
import type { UpdateTree } from './linksTypes'

export function LinksProfile({
  tree,
  tenantLogo,
  canEdit,
  update,
  avatarInputRef,
  uploading,
  selectLogo,
  uploadAvatar,
}: {
  tree: LinkTree
  tenantLogo?: string | null
  canEdit: boolean
  update: UpdateTree
  avatarInputRef: RefObject<HTMLInputElement | null>
  uploading: boolean
  selectLogo: (logo: string) => void
  uploadAvatar: (file?: File) => void
}) {
  return (
    <>
      <article className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5">
        <div className="mb-4">
          <h2 className="text-base font-extrabold text-[var(--dash-text)]">
            Perfil del negocio
          </h2>
          <p className="mt-1 text-xs text-[var(--dash-muted)]">
            Estos datos aparecen arriba de tus links.
          </p>
        </div>
        <LinksProfileIdentity
          tree={tree}
          tenantLogo={tenantLogo}
          canEdit={canEdit}
          update={update}
          avatarInputRef={avatarInputRef}
          uploading={uploading}
          selectLogo={selectLogo}
          uploadAvatar={uploadAvatar}
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <LinksProfileTags tree={tree} update={update} />
        </div>
        <LinksProfileAppearance tree={tree} update={update} />
      </article>
      <article className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5">
        <div className="mb-4">
          <h2 className="text-base font-extrabold text-[var(--dash-text)]">
            Redes y contacto
          </h2>
          <p className="mt-1 text-xs text-[var(--dash-muted)]">
            Se muestran como accesos rápidos al pie de la página.
          </p>
        </div>
        <LinksContact tree={tree} update={update} />
      </article>
    </>
  )
}
