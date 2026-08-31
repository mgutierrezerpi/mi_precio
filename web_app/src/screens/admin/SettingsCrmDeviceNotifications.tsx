import { useEffect, useState } from 'react'
import { type TFn } from '../../lib/i18n'
import {
  disablePush,
  enablePush,
  getPushStatus,
  type PushStatus,
} from '../../lib/push'
import { gradient } from './crm/theme'

export function DeviceNotifications({
  t,
  tenantId,
}: {
  t: TFn
  tenantId?: string
}) {
  const [status, setStatus] = useState<PushStatus>('default')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    getPushStatus().then((nextStatus) => {
      if (!cancelled) setStatus(nextStatus)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const toggle = async () => {
    if (!tenantId || busy) return
    setBusy(true)
    try {
      setStatus(
        status === 'subscribed'
          ? await disablePush(tenantId)
          : await enablePush(tenantId)
      )
    } finally {
      setBusy(false)
    }
  }

  const isOn = status === 'subscribed'
  const note =
    status === 'unsupported'
      ? t('set.notif.unsupported')
      : status === 'denied'
        ? t('set.notif.denied')
        : isOn
          ? t('set.notif.active')
          : t('set.notif.deviceDesc')
  const disabled = busy || status === 'unsupported' || status === 'denied'

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--dash-border)] px-4 py-3.5">
      <div className="flex min-w-0 flex-col">
        <span className="text-[13px] font-bold text-[var(--dash-text)]">
          {t('set.notif.deviceTitle')}
        </span>
        <span className="text-[11px] font-medium text-[var(--dash-muted)]">
          {note}
        </span>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={toggle}
        className={`shrink-0 rounded-xl px-3.5 py-2 text-[12px] font-bold text-white transition ${isOn ? 'bg-[var(--dash-border)] text-[var(--dash-text2)]' : gradient} ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:opacity-90'}`}
      >
        {busy
          ? t('set.notif.enabling')
          : isOn
            ? t('set.notif.disable')
            : t('set.notif.enable')}
      </button>
    </div>
  )
}
