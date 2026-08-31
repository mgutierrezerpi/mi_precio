import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ListContent, PriceList, Tenant } from '../../types'
import api from '../../services/api'
import {
  contentWithTemplateDefaults,
  starterContent,
} from './ListCustomizeShared'
import type { StoryMetric } from './ListCustomizeStoryEditor'
import { useListCustomizeUploads } from './useListCustomizeUploads'
export function useListCustomizeEditor(
  id: string | undefined,
  tenant: Tenant | null,
  canEdit: boolean
) {
  const [list, setList] = useState<PriceList | null>(null)
  const [versionId, setVersionId] = useState('')
  const [revision, setRevision] = useState(0)
  const [content, setContent] = useState<ListContent | null>(null)
  const [snapshot, setSnapshot] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [previewOpen, setPreviewOpen] = useState(() => window.innerWidth >= 640)
  const [previewRevision, setPreviewRevision] = useState(0)
  const imageRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    void api.getList(id).then((response) => {
      if (cancelled) return
      setLoading(false)
      if (!response.data) {
        setError(response.error || 'No pudimos cargar esta lista')
        return
      }
      const version = response.data.versions?.[0]
      if (!version) {
        setError('Esta lista no tiene una versión para personalizar.')
        return
      }
      const next = contentWithTemplateDefaults(
        version.content || starterContent(response.data.name),
        response.data,
        tenant?.listDesign
      )
      setList(response.data)
      setVersionId(version.id)
      setRevision(version.contentRevision || 0)
      setContent(next)
      setSnapshot(JSON.stringify(next))
    })
    return () => {
      cancelled = true
    }
  }, [id, tenant?.listDesign])

  const publicUrl = useMemo(
    () =>
      list && tenant
        ? `${window.location.origin}/p/${tenant.subdomain}/${list.slug || list.id}`
        : '',
    [list, tenant]
  )
  const dirty = !!content && snapshot !== JSON.stringify(content)
  const update = useCallback(
    (patch: Partial<ListContent>) =>
      setContent((current) => ({
        ...(current || starterContent(list?.name || 'Mi lista')),
        ...patch,
      })),
    [list?.name]
  )
  const updateHero = useCallback(
    (key: 'eyebrow' | 'title' | 'body', value: string) => {
      const current = content || starterContent(list?.name || 'Mi lista')
      update({ hero: { ...current.hero, [key]: value } })
    },
    [content, list?.name, update]
  )
  const updateTemplate = useCallback(
    (key: keyof NonNullable<ListContent['template']>, value: string) => {
      const current = content || starterContent(list?.name || 'Mi lista')
      update({ template: { ...current.template, [key]: value } })
    },
    [content, list?.name, update]
  )
  const updateStories = useCallback(
    (storyVideos: string[], storyMetrics: StoryMetric[]) => {
      const current = content || starterContent(list?.name || 'Mi lista')
      update({ template: { ...current.template, storyVideos, storyMetrics } })
    },
    [content, list?.name, update]
  )
  const save = useCallback(async () => {
    if (!versionId || !content || !dirty || saving || !canEdit) return
    setSaving(true)
    setError('')
    const response = await api.updateVersionContent(
      versionId,
      content,
      revision
    )
    setSaving(false)
    if (!response.data) {
      setError(response.error || 'No pudimos guardar los cambios')
      return
    }
    setContent(response.data.content)
    setRevision(response.data.contentRevision)
    setSnapshot(JSON.stringify(response.data.content))
    setPreviewRevision((value) => value + 1)
  }, [canEdit, content, dirty, revision, saving, versionId])

  useEffect(() => {
    if (!dirty || !canEdit || saving) return
    const timer = window.setTimeout(() => void save(), 800)
    return () => window.clearTimeout(timer)
  }, [canEdit, dirty, save, saving])

  const uploads = useListCustomizeUploads(
    tenant,
    content,
    updateTemplate,
    updateStories,
    setError
  )

  return {
    list,
    content,
    loading,
    error,
    dirty,
    saving,
    publicUrl,
    previewOpen,
    setPreviewOpen,
    previewRevision,
    uploadingImage: uploads.uploadingImage,
    uploadingStoryIndex: uploads.uploadingStoryIndex,
    imageRef,
    save,
    updateHero,
    updateTemplate,
    updateStories,
    uploadImage: uploads.uploadImage,
    uploadStoryVideo: uploads.uploadStoryVideo,
  }
}
