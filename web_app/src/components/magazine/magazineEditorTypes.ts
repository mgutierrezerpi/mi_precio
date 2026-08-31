import type { MagazinePage, Magazine } from '../../types'
import type { TFn } from '../../lib/i18n'
import type { MagazineProductContent } from './templateCatalog'

export type MagazineMetadataDraft = {
  name: string
  issue: string
  description: string
  design: string
  coverImageUrl: string
  published: boolean
  showOnIndex: boolean
}

export type MagazinePageDraft = {
  position: number
  pageType: string
  layout: string
  title: string
  imageUrl: string
  images: string[]
  imagePositions: string[]
  eyebrow: string
  headline: string
  body: string
  quote: string
  footer: string
  copy: string
  products?: MagazineProductContent[]
}

export type Result<T> = { data?: T; error?: string }
export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'
export type PageEditorHandle = { saveNow: () => Promise<boolean> }

export type EditorProps = {
  magazine: Magazine | null
  onClose: () => void
  onSaveMagazine: (draft: MagazineMetadataDraft) => Promise<Result<Magazine>>
  onCreatePage: (draft: MagazinePageDraft) => Promise<Result<MagazinePage>>
  onSavePage: (
    pageId: string,
    draft: MagazinePageDraft
  ) => Promise<Result<MagazinePage>>
  onDeletePage: (pageId: string) => Promise<Result<{ deleted: boolean }>>
  t: TFn
}
