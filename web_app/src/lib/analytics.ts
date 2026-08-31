import * as amplitude from '@amplitude/unified'

type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>

export function trackEvent(eventName: string, eventProperties?: AnalyticsProperties): void {
  if (!import.meta.env.VITE_AMPLITUDE_API_KEY) return
  amplitude.track(eventName, {
    ...eventProperties,
    environment: import.meta.env.DEV ? 'development' : 'production',
  })
}
