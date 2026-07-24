import type { Activity, PlanId } from '../../../types'
import { useT, type TFn } from '../../../lib/i18n'
import { planById } from '../../../lib/plans'
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

/** Localize enum-like meta values (role, plan, billing event/status) before interpolation. */
function localizedMeta(meta: Record<string, string> | null, t: TFn): Record<string, string> {
  if (!meta) return {}
  const out = { ...meta }
  if (out.role) {
    const r = t(`role.${out.role}`)
    out.role = r === `role.${out.role}` ? out.role : r
  }
  if (out.plan) out.plan = planById(out.plan as PlanId).name
  // Billing codes → words (leave unknown codes untouched, like role).
  for (const field of ['event', 'status'] as const) {
    if (!out[field]) continue
    const key = `billing${field === 'event' ? 'Event' : 'Status'}.${out[field]}`
    const v = t(key)
    if (v !== key) out[field] = v
  }
  return out
}

/** The activity line in the viewer's language: rebuilt from `action` + `meta`,
 * falling back to the stored Spanish `summary` for pre-i18n rows or unknown actions. */
export function activityText(a: Activity, t: TFn): string {
  const key = `activity.${a.action}`
  if (a.meta) {
    const s = t(key, localizedMeta(a.meta, t))
    // Use the localized line only if it fully resolved. Rows missing a meta
    // field leave an unfilled `{placeholder}` — fall back to the stored summary.
    if (s !== key && !s.includes('{')) return s
  }
  return a.summary
}

// Backend timestamps are naive UTC; tag as UTC so relative time is correct.
export function activityAgo(iso: string, t: TFn): string {
  const hasTz = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(iso)
  const s = (Date.now() - new Date(hasTz ? iso : `${iso}Z`).getTime()) / 1000
  if (s < 60) return t('time.now')
  if (s < 3600) return t('time.minAgo', { n: Math.floor(s / 60) })
  if (s < 86400) return t('time.hAgo', { n: Math.floor(s / 3600) })
  const d = Math.floor(s / 86400)
  return d < 2 ? t('time.yesterday') : t('time.daysAgo', { n: d })
}

const actorShort = (actor: string | null) => (actor ? actor.split('@')[0] : null)

/** One row of the activity feed (icon + summary + actor/time), shared by Dashboard and Reportes. */
export function ActivityRow({ activity: a }: { activity: Activity }) {
  const t = useT()
  const st = activityStyle(a.action)
  const who = actorShort(a.actor)
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={tone(st.tone)}><Icon name={st.icon} /></span>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[13px] font-bold text-[var(--dash-text)]">{activityText(a, t)}</span>
        <span className="truncate text-[11px] font-medium text-[var(--dash-muted)]">{who ? `${who} · ` : ''}{activityAgo(a.createdAt, t)}</span>
      </div>
    </div>
  )
}
