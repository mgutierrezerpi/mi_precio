import type { Activity } from '../../../types'
import { Icon, type IconName } from './ui'
import { tone, type Tone } from './theme'

// Maps an activity action key to its icon + color tone.
const ACTIVITY_STYLE: Record<string, { icon: IconName; tone: Tone }> = {
  'product.created': { icon: 'package', tone: 'green' },
  'product.deleted': { icon: 'circle-x', tone: 'red' },
  'list.created': { icon: 'list-checks', tone: 'violet' },
  'list.published': { icon: 'share-2', tone: 'violet' },
  'customer.created': { icon: 'user-plus', tone: 'blue' },
  'order.created': { icon: 'trending-up', tone: 'green' },
}

const activityStyle = (action: string) =>
  ACTIVITY_STYLE[action] || { icon: 'ellipsis' as IconName, tone: 'slate' as Tone }

// Backend timestamps are naive UTC; tag as UTC so relative time is correct.
function activityAgo(iso: string): string {
  const hasTz = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(iso)
  const s = (Date.now() - new Date(hasTz ? iso : `${iso}Z`).getTime()) / 1000
  if (s < 60) return 'Recién'
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`
  const d = Math.floor(s / 86400)
  return d < 2 ? 'ayer' : `hace ${d} días`
}

const actorShort = (actor: string | null) => (actor ? actor.split('@')[0] : null)

/** One row of the activity feed (icon + summary + actor/time), shared by Dashboard and Reportes. */
export function ActivityRow({ activity: a }: { activity: Activity }) {
  const st = activityStyle(a.action)
  const who = actorShort(a.actor)
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={tone(st.tone)}><Icon name={st.icon} /></span>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[13px] font-bold text-[var(--dash-text)]">{a.summary}</span>
        <span className="truncate text-[11px] font-medium text-[var(--dash-muted)]">{who ? `${who} · ` : ''}{activityAgo(a.createdAt)}</span>
      </div>
    </div>
  )
}
