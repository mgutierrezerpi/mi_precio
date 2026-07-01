import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../../store/hooks'
import { selectTenant } from '../../../store/slices/authSlice'
import api from '../../../services/api'
import type { Activity } from '../../../types'
import { useT } from '../../../lib/i18n'
import { activityText, activityAgo } from './activity'
import { Icon, type IconName } from './ui'
import { tone, type Tone } from './theme'

// Activity action → icon + color tone (mirrors the dashboard activity feed).
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
const styleFor = (action: string) => STYLE[action] || { icon: 'bell' as IconName, tone: 'slate' as Tone }

const actorShort = (a: string | null) => (a ? a.split('@')[0] : null)

/** Topbar bell: polls in-app notifications, shows an unread badge, opens a feed. */
export function NotificationsBell() {
  const navigate = useNavigate()
  const t = useT()
  const tenant = useAppSelector(selectTenant)
  const tenantId = tenant?.id
  const [items, setItems] = useState<Activity[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Poll so a teammate's actions surface live.
  useEffect(() => {
    if (!tenantId) return
    let cancelled = false
    const load = () => api.getNotifications(tenantId).then((res) => {
      if (!cancelled && res.data) { setItems(res.data.items); setUnread(res.data.unread) }
    })
    load()
    const id = setInterval(load, 10000)
    return () => { cancelled = true; clearInterval(id) }
  }, [tenantId])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const toggle = () => {
    const next = !open
    setOpen(next)
    // Opening the panel marks everything as read.
    if (next && unread > 0 && tenantId) {
      setUnread(0)
      void api.markNotificationsSeen(tenantId)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        title={t('notif.title')}
        className="relative flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--dash-soft-border)] bg-[var(--dash-soft)] hover:opacity-80"
      >
        <Icon name="bell" className="text-[var(--dash-text2)]" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[360px] overflow-hidden rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-[0_18px_50px_-12px_rgba(30,27,75,0.3)]">
          <div className="flex items-center justify-between border-b border-[var(--dash-divider)] px-4 py-3">
            <span className="text-sm font-extrabold text-[var(--dash-text)]">{t('notif.title')}</span>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--dash-muted)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#10B981]" /> {t('notif.live')}
            </span>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs font-medium text-[var(--dash-muted)]">{t('notif.empty')}</p>
            ) : items.map((a) => {
              const st = styleFor(a.action)
              const who = actorShort(a.actor)
              return (
                <div key={a.id} className="flex items-center gap-3 border-b border-[var(--dash-divider)] px-4 py-3 last:border-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={tone(st.tone)}><Icon name={st.icon} /></span>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[13px] font-bold text-[var(--dash-text)]">{activityText(a, t)}</span>
                    <span className="truncate text-[11px] font-medium text-[var(--dash-muted)]">{who ? `${who} · ` : ''}{activityAgo(a.createdAt, t)}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => { setOpen(false); navigate('/admin/settings') }}
            className="flex w-full items-center justify-center gap-1.5 border-t border-[var(--dash-divider)] py-2.5 text-[12px] font-bold text-[var(--dash-link)] hover:bg-[var(--dash-soft)]"
          >
            <Icon name="settings" size={14} /> {t('notif.prefs')}
          </button>
        </div>
      )}
    </div>
  )
}
