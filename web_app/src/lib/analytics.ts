type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>

type UmamiTracker = {
  track: (eventName: string, properties?: AnalyticsProperties) => void
}

declare global {
  interface Window {
    umami?: UmamiTracker
  }
}

const queuedEvents: Array<[string, AnalyticsProperties]> = []
let trackerRequested = false

/** Load Umami only when this deployment supplies its tracker URL and website ID. */
export function initAnalytics(): void {
  const scriptUrl = import.meta.env.VITE_UMAMI_SCRIPT_URL
  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID
  if (!scriptUrl || !websiteId || trackerRequested) return

  trackerRequested = true
  const script = document.createElement('script')
  script.defer = true
  script.src = scriptUrl
  script.dataset.websiteId = websiteId
  script.onload = () => {
    while (queuedEvents.length) {
      const [eventName, properties] = queuedEvents.shift()!
      window.umami?.track(eventName, properties)
    }
  }
  document.head.append(script)
}

export function trackEvent(
  eventName: string,
  eventProperties?: AnalyticsProperties
): void {
  const properties = {
    ...eventProperties,
    environment: import.meta.env.DEV ? 'development' : 'production',
  }
  if (window.umami) {
    window.umami.track(eventName, properties)
  } else if (trackerRequested) {
    queuedEvents.push([eventName, properties])
  }
}
