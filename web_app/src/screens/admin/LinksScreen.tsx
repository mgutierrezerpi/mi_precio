import { CrmLayout } from './crm/CrmLayout'
import { LinksHeader } from './links/LinksHeader'
import { LinksList } from './links/LinksList'
import { LinksPreview } from './links/LinksPreview'
import { LinksPreviewToggle } from './links/LinksPreviewToggle'
import { LinksProfile } from './links/LinksProfile'
import { useLinksEditor } from './links/useLinksEditor'

export function LinksScreen() {
  const editor = useLinksEditor()
  return (
    <CrmLayout
      active="Links"
      title="Links"
      subtitle="Configurá la página pública de tu negocio"
      hideContext
    >
      <main className="mx-auto flex min-h-full w-full max-w-[1320px] flex-col gap-5 overflow-x-hidden px-4 py-6 md:px-10 md:py-8">
        <LinksHeader
          publicUrl={editor.publicUrl}
          copied={editor.copied}
          dirty={editor.isDirty}
          saving={editor.isSaving}
          tree={!!editor.tree}
          canEdit={editor.canEdit}
          copy={() => void editor.copyPublicUrl()}
          save={() => void editor.save()}
          openPreview={() => editor.setIsPreviewOpen(true)}
        />
        {editor.error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            {editor.error}
          </div>
        )}
        {editor.isLoading && (
          <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-8 text-center text-sm text-[var(--dash-muted)]">
            Cargando tu Linktree…
          </div>
        )}
        {!editor.isLoading && editor.tree && (
          <div
            className={`grid min-w-0 items-start gap-5 ${editor.isPreviewOpen ? 'xl:grid-cols-[minmax(0,1fr)_390px]' : 'xl:grid-cols-1'}`}
          >
            <section className="min-w-0 space-y-5">
              <LinksProfile
                tree={editor.tree}
                tenantLogo={editor.tenant?.logoUrl}
                canEdit={editor.canEdit}
                update={editor.update}
                avatarInputRef={editor.avatarInputRef}
                uploading={editor.isUploadingAvatar}
                selectLogo={(logo) => void editor.selectCompanyLogo(logo)}
                uploadAvatar={(file) => void editor.uploadAvatar(file)}
              />
              <LinksList
                tree={editor.tree}
                canEdit={editor.canEdit}
                update={editor.update}
                updateLink={editor.updateLink}
                removeLink={editor.removeLink}
                moveLink={editor.moveLink}
              />
            </section>
            <LinksPreview
              tree={editor.tree}
              tenantLogo={editor.tenant?.logoUrl}
              publicUrl={editor.publicUrl}
              open={editor.isPreviewOpen}
              close={() => editor.setIsPreviewOpen(false)}
            />
          </div>
        )}
      </main>
      {editor.tree && (
        <LinksPreviewToggle
          open={editor.isPreviewOpen}
          toggle={() => editor.setIsPreviewOpen((open) => !open)}
        />
      )}
    </CrmLayout>
  )
}
