import { useParams } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { selectCanEdit, selectTenant } from '../../store/slices/authSlice'
import { CrmLayout } from './crm/CrmLayout'
import { ListCustomizeEditorialSection } from './ListCustomizeEditorialSection'
import { ListCustomizeHeader } from './ListCustomizeHeader'
import { ListCustomizeHeroSection } from './ListCustomizeHeroSection'
import { ListCustomizePriceSection } from './ListCustomizePriceSection'
import { ListCustomizePreview } from './ListCustomizePreview'
import { ListCustomizeStoriesSection } from './ListCustomizeStoriesSection'
import { PreviewToggle } from './ListCustomizeShared'
import { useListCustomizeEditor } from './useListCustomizeEditor'

export function ListCustomizeScreen() {
  const { id } = useParams<{ id: string }>()
  const tenant = useAppSelector(selectTenant)
  const canEdit = useAppSelector(selectCanEdit)
  const editor = useListCustomizeEditor(id, tenant, canEdit)
  const currentDesign = editor.list?.design || tenant?.listDesign || ''
  const isStoriesTemplate = currentDesign === 'pencil-cafecitos'
  const isEditorial = currentDesign.startsWith('pencil-') && !isStoriesTemplate

  return (
    <CrmLayout
      active="Listas de precios"
      title="Listas de precios"
      subtitle="Personalizá tu catálogo público"
      hideContext
    >
      <main className="mx-auto flex min-h-full w-full max-w-[1320px] flex-col gap-5 overflow-x-hidden px-4 py-6 md:px-10 md:py-8">
        <ListCustomizeHeader
          listName={editor.list?.name}
          publicUrl={editor.publicUrl}
          dirty={editor.dirty}
          saving={editor.saving}
          onOpenPreview={() => editor.setPreviewOpen(true)}
          onSave={() => void editor.save()}
        />
        {editor.error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            {editor.error}
          </div>
        )}
        {editor.loading && (
          <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-8 text-center text-sm text-[var(--dash-muted)]">
            Cargando editor…
          </div>
        )}
        {!editor.loading && editor.list && editor.content && (
          <div
            className={`grid min-w-0 items-start gap-5 ${editor.previewOpen ? 'xl:grid-cols-[minmax(0,1fr)_390px]' : 'xl:grid-cols-1'}`}
          >
            <section className="min-w-0 space-y-5">
              <ListCustomizeHeroSection
                content={editor.content}
                canEdit={canEdit}
                onHeroChange={editor.updateHero}
                onTemplateChange={editor.updateTemplate}
              />
              {isEditorial && (
                <ListCustomizeEditorialSection
                  content={editor.content}
                  canEdit={canEdit}
                  uploading={editor.uploadingImage}
                  imageRef={editor.imageRef}
                  onUpload={(event) => void editor.uploadImage(event)}
                  onChange={editor.updateTemplate}
                />
              )}
              {isStoriesTemplate && (
                <ListCustomizeStoriesSection
                  content={editor.content}
                  canEdit={canEdit}
                  uploading={editor.uploadingImage}
                  uploadingIndex={editor.uploadingStoryIndex}
                  imageRef={editor.imageRef}
                  onUploadImage={(event) =>
                    void editor.uploadImage(event, 'profileImage')
                  }
                  onUploadVideo={editor.uploadStoryVideo}
                  onChange={editor.updateTemplate}
                  onStoriesChange={editor.updateStories}
                />
              )}
              <ListCustomizePriceSection
                content={editor.content}
                canEdit={canEdit}
                onChange={(value) =>
                  editor.updateTemplate('priceFormat', value)
                }
              />
            </section>
            <ListCustomizePreview
              publicUrl={editor.publicUrl}
              open={editor.previewOpen}
              revision={editor.previewRevision}
              onClose={() => editor.setPreviewOpen(false)}
            />
          </div>
        )}
      </main>
      {editor.list && (
        <PreviewToggle
          open={editor.previewOpen}
          onToggle={() => editor.setPreviewOpen((open) => !open)}
        />
      )}
    </CrmLayout>
  )
}

export default ListCustomizeScreen
