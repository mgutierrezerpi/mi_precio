import type { Activity } from '../../../types'
import { activityAgo, activityText } from './activityFormat'
import { Icon, type IconName } from './ui'
import { tone, type Tone } from './theme'

type Translate = (key: string) => string

const PANEL_CLASS = [
  'absolute right-0 top-12 z-50 w-[360px] overflow-hidden rounded-2xl',
  'border border-[var(--dash-border)] bg-[var(--dash-surface)]',
  'shadow-[0_18px_50px_-12px_rgba(30,27,75,0.3)]',
].join(' ')
const SETTINGS_BUTTON_CLASS = [
  'flex w-full items-center justify-center gap-1.5 border-t',
  'border-[var(--dash-divider)] py-2.5 text-[12px] font-bold',
  'text-[var(--dash-link)] hover:bg-[var(--dash-soft)]',
].join(' ')

const STYLE: Record<string, { icon: IconName; tone: Tone }> = {
  'order.created': { icon: 'trending-up', tone: 'green' },
  'product.created': { icon: 'package', tone: 'green' },
  'product.deleted': { icon: 'circle-x', tone: 'red' },
  'list.created': { icon: 'list-checks', tone: 'violet' },
  'list.published': { icon: 'share-2', tone: 'violet' },
  'customer.created': { icon: 'user-plus', tone: 'blue' },
  'member.invited': { icon: 'user-plus', tone: 'amber' },
  'member.role_changed': { icon: 'settings', tone: 'sky' },
  'member.removed': { icon: 'circle-x', tone: 'slate' },
}

function styleFor(action: string) {
  return STYLE[action] || { icon: 'bell' as IconName, tone: 'slate' as Tone }
}

export function NotificationsPanel({
  items,
  t,
  onSettings,
}: {
  items: Activity[]
  t: Translate
  onSettings: () => void
}) {
  return (
    <div className={PANEL_CLASS}>
      <div className="flex items-center justify-between border-b border-[var(--dash-divider)] px-4 py-3">
        <span className="text-sm font-extrabold text-[var(--dash-text)]">
          {t('notif.title')}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--dash-muted)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#10B981]" />
          {t('notif.live')}
        </span>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {items.length ? (
          items.map((item) => <NotificationRow key={item.id} item={item} t={t} />)
        ) : (
          <p className="px-4 py-8 text-center text-xs font-medium text-[var(--dash-muted)]">
            {t('notif.empty')}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onSettings}
        className={SETTINGS_BUTTON_CLASS}
      >
        <Icon name="settings" size={14} />
        {t('notif.prefs')}
      </button>
    </div>
  )
}

function NotificationRow({ item, t }: { item: Activity; t: Translate }) {
  const style = styleFor(item.action)
  const actor = item.actor?.split('@')[0]
  return (
    <div className="flex items-center gap-3 border-b border-[var(--dash-divider)] px-4 py-3 last:border-0">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
        style={tone(style.tone)}
      >
        <Icon name={style.icon} />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[13px] font-bold text-[var(--dash-text)]">
          {activityText(item, t)}
        </span>
        <span className="truncate text-[11px] font-medium text-[var(--dash-muted)]">
          {actor ? `${actor} · ` : ''}
          {activityAgo(item.createdAt, t)}
        </span>
      </div>
    </div>
  )
}
