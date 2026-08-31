import type { Dispatch, SetStateAction } from 'react'
import { type TFn } from '../../lib/i18n'
import api from '../../services/api'
import type { Magazine, MagazinePage } from '../../types'
import {
  type MagazineMetadataDraft,
  type MagazinePageDraft,
} from '../../components/magazine/MagazineEditor'
import { toMagazinePagePayload } from './magazinePagePayload'

export type MagazineResult<T> = { data?: T; error?: string }

export function useMagazineEditorActions({
  editing,
  setCreating,
  setEditing,
  replace,
  t,
  tenantId,
}: {
  editing: Magazine | null
  setCreating: Dispatch<SetStateAction<boolean>>
  setEditing: Dispatch<SetStateAction<Magazine | null>>
  replace: (magazine: Magazine) => void
  t: TFn
  tenantId?: string
}) {
  const updatePages = (change: (pages: MagazinePage[]) => MagazinePage[]) =>
    setEditing((current) =>
      current ? { ...current, pages: change(current.pages) } : current
    )
  const saveMagazine = async (
    draft: MagazineMetadataDraft
  ): Promise<MagazineResult<Magazine>> => {
    const response = editing
      ? await api.updateMagazine(editing.id, draft)
      : tenantId
        ? await api.createMagazine(tenantId, draft)
        : { error: t('common.error') }
    if (response.data) {
      replace(response.data)
      setEditing(response.data)
      setCreating(false)
    }
    return response
  }
  const createPage = async (
    draft: MagazinePageDraft
  ): Promise<MagazineResult<MagazinePage>> => {
    if (!editing) return { error: t('magazines.saveBeforePages') }
    const response = await api.createMagazinePage(
      editing.id,
      toMagazinePagePayload(draft)
    )
    if (response.data) updatePages((pages) => [...pages, response.data!])
    return response
  }
  const savePage = async (
    pageId: string,
    draft: MagazinePageDraft
  ): Promise<MagazineResult<MagazinePage>> => {
    const response = await api.updateMagazinePage(
      pageId,
      toMagazinePagePayload(draft)
    )
    if (response.data)
      updatePages((pages) =>
        pages.map((page) => (page.id === pageId ? response.data! : page))
      )
    return response
  }
  const deletePage = async (
    pageId: string
  ): Promise<MagazineResult<{ deleted: boolean }>> => {
    const response = await api.deleteMagazinePage(pageId)
    if (response.data)
      updatePages((pages) => pages.filter((page) => page.id !== pageId))
    return response
  }
  return { createPage, deletePage, saveMagazine, savePage }
}
