import type { Activity } from '../../../types'
import { useT } from '../../../lib/i18n'
import { Icon, type IconName } from './ui'
import { tone, type Tone } from './theme'
import { activityAgo, activityText } from './activityFormat'

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
  ACTIVITY_STYLE[action] || {
    icon: 'ellipsis' as IconName,
    tone: 'slate' as Tone,
  }

const actorShort = (actor: string | null) =>
  actor ? actor.split('@')[0] : null

/** One row of the activity feed (icon + summary + actor/time), shared by Dashboard and Reportes. */
export function ActivityRow({ activity: a }: { activity: Activity }) {
  const t = useT()
  const st = activityStyle(a.action)
  const who = actorShort(a.actor)
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
        style={tone(st.tone)}
      >
        <Icon name={st.icon} />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[13px] font-bold text-[var(--dash-text)]">
          {activityText(a, t)}
        </span>
        <span className="truncate text-[11px] font-medium text-[var(--dash-muted)]">
          {who ? `${who} · ` : ''}
          {activityAgo(a.createdAt, t)}
        </span>
      </div>
    </div>
  )
}
