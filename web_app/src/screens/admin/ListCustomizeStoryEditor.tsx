import type { ChangeEvent } from 'react'
import { Field, inputClass } from './ListCustomizeShared'
import { Icon } from './crm/ui'

export type StoryMetric = { views: string; likes: string; comments: string }

type Props = {
  index: number
  total: number
  video: string
  metric: StoryMetric
  disabled: boolean
  uploading: boolean
  onChange: (video: string, metric: StoryMetric) => void
  onRemove: () => void
  onMove: (direction: -1 | 1) => void
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void
}

export function ListCustomizeStoryEditor({
  index,
  total,
  video,
  metric,
  disabled,
  uploading,
  onChange,
  onRemove,
  onMove,
  onUpload,
}: Props) {
  return (
    <article className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)]">
      <div className="flex items-center gap-3 p-3.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--dash-soft)] text-xs font-bold text-[var(--dash-link)]">
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-extrabold text-[var(--dash-text)]">
            Historia {index + 1}
          </span>
          <span className="block text-xs text-[var(--dash-muted)]">
            {video ? 'Video cargado' : 'Subí un video para esta historia'}
          </span>
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={disabled || index === 0}
            onClick={() => onMove(-1)}
            className="rounded-md p-1.5 text-[var(--dash-muted)] hover:bg-[var(--dash-soft)] disabled:opacity-30"
            aria-label="Mover historia arriba"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={disabled || index === total - 1}
            onClick={() => onMove(1)}
            className="rounded-md p-1.5 text-[var(--dash-muted)] hover:bg-[var(--dash-soft)] disabled:opacity-30"
            aria-label="Mover historia abajo"
          >
            ↓
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onRemove}
            className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-30"
            aria-label="Eliminar historia"
          >
            <Icon name="circle-x" size={15} />
          </button>
        </div>
      </div>
      <div className="grid gap-3 border-t border-[var(--dash-border)] p-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <div className="flex items-center gap-3">
            <div className="h-24 w-[54px] shrink-0 overflow-hidden rounded-lg bg-black">
              {video && (
                <video
                  src={video}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <label className="flex h-10 cursor-pointer items-center rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-xs font-bold text-[var(--dash-link)] disabled:opacity-50">
              {uploading
                ? 'Subiendo…'
                : video
                  ? 'Reemplazar video'
                  : 'Subir video'}
              <input
                type="file"
                accept="video/mp4"
                disabled={disabled || uploading}
                className="sr-only"
                onChange={onUpload}
              />
            </label>
          </div>
        </div>
        <Field label="Vistas">
          <input
            disabled={disabled}
            className={inputClass}
            value={metric.views}
            onChange={(event) =>
              onChange(video, { ...metric, views: event.target.value })
            }
            placeholder="195K"
          />
        </Field>
        <Field label="Me gusta">
          <input
            disabled={disabled}
            className={inputClass}
            value={metric.likes}
            onChange={(event) =>
              onChange(video, { ...metric, likes: event.target.value })
            }
            placeholder="5.5K"
          />
        </Field>
        <Field label="Comentarios">
          <input
            disabled={disabled}
            className={inputClass}
            value={metric.comments}
            onChange={(event) =>
              onChange(video, { ...metric, comments: event.target.value })
            }
            placeholder="158"
          />
        </Field>
      </div>
    </article>
  )
}
