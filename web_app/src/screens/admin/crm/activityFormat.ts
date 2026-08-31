import type { Activity, PlanId } from '../../../types'
import type { TFn } from '../../../lib/i18n'
import { planById } from '../../../lib/plans'

function localizedMeta(
  meta: Record<string, string> | null,
  t: TFn
): Record<string, string> {
  if (!meta) return {}
  const localized = { ...meta }
  if (localized.role) {
    const role = t(`role.${localized.role}`)
    localized.role = role === `role.${localized.role}` ? localized.role : role
  }
  if (localized.plan) localized.plan = planById(localized.plan as PlanId).name
  for (const field of ['event', 'status'] as const) {
    if (!localized[field]) continue
    const key = `billing${field === 'event' ? 'Event' : 'Status'}.${localized[field]}`
    const value = t(key)
    if (value !== key) localized[field] = value
  }
  return localized
}

export function activityText(activity: Activity, t: TFn): string {
  const key = `activity.${activity.action}`
  if (activity.meta) {
    const text = t(key, localizedMeta(activity.meta, t))
    if (text !== key && !text.includes('{')) return text
  }
  return activity.summary
}

export function activityAgo(iso: string, t: TFn): string {
  const hasTimezone = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(iso)
  const secondsAgo =
    (Date.now() - new Date(hasTimezone ? iso : `${iso}Z`).getTime()) / 1000
  if (secondsAgo < 60) return t('time.now')
  if (secondsAgo < 3600)
    return t('time.minAgo', { n: Math.floor(secondsAgo / 60) })
  if (secondsAgo < 86400)
    return t('time.hAgo', { n: Math.floor(secondsAgo / 3600) })
  const daysAgo = Math.floor(secondsAgo / 86400)
  return daysAgo < 2 ? t('time.yesterday') : t('time.daysAgo', { n: daysAgo })
}
