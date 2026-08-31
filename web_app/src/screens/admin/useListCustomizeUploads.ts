import { useCallback, useState, type ChangeEvent } from 'react'
import type { ListContent, Tenant } from '../../types'
import api from '../../services/api'
import type { StoryMetric } from './ListCustomizeStoryEditor'

type TemplateKey = keyof NonNullable<ListContent['template']>
type TemplateChange = (key: TemplateKey, value: string) => void
type StoriesChange = (videos: string[], metrics: StoryMetric[]) => void

export function useListCustomizeUploads(
  tenant: Tenant | null,
  content: ListContent | null,
  updateTemplate: TemplateChange,
  updateStories: StoriesChange,
  setError: (error: string) => void
) {
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingStoryIndex, setUploadingStoryIndex] = useState<number | null>(
    null
  )

  const uploadImage = useCallback(
    async (
      event: ChangeEvent<HTMLInputElement>,
      field: 'image' | 'profileImage' = 'image'
    ) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file || !tenant) return
      setUploadingImage(true)
      setError('')
      try {
        const response = await api.uploadListTemplateImage(tenant.id, file)
        if (!response.data)
          setError(response.error || 'No pudimos subir la imagen')
        else updateTemplate(field, response.data.url)
      } finally {
        setUploadingImage(false)
      }
    },
    [setError, tenant, updateTemplate]
  )

  const uploadStoryVideo = useCallback(
    async (index: number, event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file || !tenant || !content) return
      setUploadingStoryIndex(index)
      setError('')
      try {
        const response = await api.uploadListTemplateVideo(tenant.id, file)
        if (!response.data)
          setError(response.error || 'No pudimos subir el video')
        else {
          const videos = [...(content.template?.storyVideos || [])]
          videos[index] = response.data.url
          const metrics = [...(content.template?.storyMetrics || [])]
          while (metrics.length < videos.length)
            metrics.push({ views: '', likes: '', comments: '' })
          updateStories(videos, metrics)
        }
      } finally {
        setUploadingStoryIndex(null)
      }
    },
    [content, setError, tenant, updateStories]
  )

  return {
    uploadingImage,
    uploadingStoryIndex,
    uploadImage,
    uploadStoryVideo,
  }
}
