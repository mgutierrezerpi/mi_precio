import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../../store/hooks'
import { selectTenant } from '../../../store/slices/authSlice'
import api from '../../../services/api'
import type { Activity } from '../../../types'
import { useT } from '../../../lib/i18n'
import { NotificationsPanel } from './NotificationsPanel'
import { Icon } from './ui'

const BELL_BUTTON_CLASS = [
  'relative flex h-10 w-10 items-center justify-center rounded-[10px]',
  'border border-transparent bg-[var(--dash-soft)] hover:opacity-80',
].join(' ')
const UNREAD_BADGE_CLASS = [
  'absolute -right-1 -top-1 flex h-[18px] min-w-[18px]',
  'items-center justify-center rounded-full bg-[#EF4444] px-1',
  'text-[10px] font-bold text-white',
].join(' ')

export function NotificationsBell() {
  const tenantId = useAppSelector(selectTenant)?.id
  const t = useT()
  const navigate = useNavigate()
  const { items, unread, setUnread } = useNotifications(tenantId)
  const [open, setOpen] = useState(false)
  const ref = useOutsideClose(open, () => setOpen(false))
  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next && unread > 0 && tenantId) {
      setUnread(0)
      void api.markNotificationsSeen(tenantId)
    }
  }
  return (
    <div ref={ref} className="relative">
      <BellButton unread={unread} title={t('notif.title')} onClick={toggle} />
      {open && (
        <NotificationsPanel
          items={items}
          t={t}
          onSettings={() => {
            setOpen(false)
            navigate('/admin/settings')
          }}
        />
      )}
    </div>
  )
}

function useNotifications(tenantId?: string) {
  const [items, setItems] = useState<Activity[]>([])
  const [unread, setUnread] = useState(0)
  useEffect(() => {
    if (!tenantId) return
    let cancelled = false
    const load = () =>
      api.getNotifications(tenantId).then((res) => {
        if (!cancelled && res.data) {
          setItems(res.data.items)
          setUnread(res.data.unread)
        }
      })
    load()
    const id = setInterval(load, 10000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [tenantId])
  return { items, unread, setUnread }
}

function useOutsideClose(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDocumentMouseDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) close()
    }
    document.addEventListener('mousedown', onDocumentMouseDown)
    return () => document.removeEventListener('mousedown', onDocumentMouseDown)
  }, [close, open])
  return ref
}

function BellButton({
  unread,
  title,
  onClick,
}: {
  unread: number
  title: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={BELL_BUTTON_CLASS}
    >
      <Icon name="bell" className="text-[var(--dash-text2)]" />
      {unread > 0 && (
        <span className={UNREAD_BADGE_CLASS}>
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  )
}
