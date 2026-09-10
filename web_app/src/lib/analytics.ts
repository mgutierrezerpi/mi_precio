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

/**
 * Records a completed sign-in without sending an email address or other direct
 * identifier to Umami. The opaque account ID is hashed in the browser so
 * returning-user logins can be grouped in Umami's activity dashboard.
 */
export async function trackCompletedLogin(
  userId: string,
  isNewUser: boolean
): Promise<void> {
  let userIdHash: string | undefined

  if (window.crypto?.subtle) {
    const bytes = new TextEncoder().encode(userId)
    const digest = await window.crypto.subtle.digest('SHA-256', bytes)
    userIdHash = Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, '0')
    ).join('').slice(0, 16)
  }

  trackEvent('Completed Login', {
    account_status: isNewUser ? 'new' : 'existing',
    ...(userIdHash ? { user_id_hash: userIdHash } : {}),
  })
}
