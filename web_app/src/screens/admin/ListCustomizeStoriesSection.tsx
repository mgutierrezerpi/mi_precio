import type { ChangeEvent, RefObject } from 'react'
import type { ListContent } from '../../types'
import {
  ListCustomizeStoryEditor,
  type StoryMetric,
} from './ListCustomizeStoryEditor'
import { ListCustomizeStoryIdentity } from './ListCustomizeStoryIdentity'
import { Icon } from './crm/ui'

type Props = {
  content: ListContent
  canEdit: boolean
  uploading: boolean
  uploadingIndex: number | null
  imageRef: RefObject<HTMLInputElement | null>
  onUploadImage: (event: ChangeEvent<HTMLInputElement>) => void
  onUploadVideo: (index: number, event: ChangeEvent<HTMLInputElement>) => void
  onChange: (
    key: keyof NonNullable<ListContent['template']>,
    value: string
  ) => void
  onStoriesChange: (videos: string[], metrics: StoryMetric[]) => void
}

const emptyMetric = (): StoryMetric => ({ views: '', likes: '', comments: '' })

export function ListCustomizeStoriesSection({
  content,
  canEdit,
  uploading,
  uploadingIndex,
  imageRef,
  onUploadImage,
  onUploadVideo,
  onChange,
  onStoriesChange,
}: Props) {
  const videos = content.template?.storyVideos || []
  const metrics = content.template?.storyMetrics || []
  const addStory = () =>
    onStoriesChange([...videos, ''], [...metrics, emptyMetric()])
  const changeStory = (index: number, video: string, metric: StoryMetric) => {
    const nextVideos = [...videos]
    const nextMetrics = [...metrics]
    nextVideos[index] = video
    nextMetrics[index] = metric
    onStoriesChange(nextVideos, nextMetrics)
  }
  const removeStory = (index: number) =>
    onStoriesChange(
      videos.filter((_, itemIndex) => itemIndex !== index),
      metrics.filter((_, itemIndex) => itemIndex !== index)
    )
  const moveStory = (index: number, direction: -1 | 1) => {
    const target = index + direction
    const nextVideos = [...videos]
    const nextMetrics = [...metrics]
    ;[nextVideos[index], nextVideos[target]] = [
      nextVideos[target],
      nextVideos[index],
    ]
    ;[nextMetrics[index], nextMetrics[target]] = [
      nextMetrics[target],
      nextMetrics[index],
    ]
    onStoriesChange(nextVideos, nextMetrics)
  }

  return (
    <article className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5">
      <ListCustomizeStoryIdentity
        content={content}
        canEdit={canEdit}
        uploading={uploading}
        imageRef={imageRef}
        onUpload={onUploadImage}
        onChange={onChange}
      />
      <div className="mt-6 border-t border-[var(--dash-border)] pt-5">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-[var(--dash-text)]">
              Tus historias{' '}
              <span className="ml-1 rounded-full bg-[var(--dash-soft)] px-2 py-0.5 text-xs text-[var(--dash-text2)]">
                {videos.length}
              </span>
            </h3>
            <p className="mt-1 text-xs text-[var(--dash-muted)]">
              Subí, editá, eliminá o reordená cada reel.
            </p>
          </div>
          <button
            type="button"
            disabled={!canEdit || videos.length >= 6}
            onClick={addStory}
            aria-label="Agregar historia"
            className="btn btn-sm inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--dash-soft)] !p-0 text-[var(--dash-link)] disabled:opacity-50"
          >
            <Icon name="plus" size={16} />
          </button>
        </div>
        <div className="space-y-3">
          {videos.map((video, index) => (
            <ListCustomizeStoryEditor
              key={`${video}-${index}`}
              index={index}
              total={videos.length}
              video={video}
              metric={metrics[index] || emptyMetric()}
              disabled={!canEdit}
              uploading={uploadingIndex === index}
              onChange={(nextVideo, nextMetric) =>
                changeStory(index, nextVideo, nextMetric)
              }
              onRemove={() => removeStory(index)}
              onMove={(direction) => moveStory(index, direction)}
              onUpload={(event) => onUploadVideo(index, event)}
            />
          ))}
        </div>
      </div>
    </article>
  )
}
