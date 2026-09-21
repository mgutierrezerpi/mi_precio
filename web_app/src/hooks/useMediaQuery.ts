import { useEffect, useState } from 'react'

/** Reactive media-query match. Returns true while the query matches. */
export function useMediaQuery(query: string): boolean {
  // Without `matchMedia` (jsdom, some embedded webviews) report "no match" —
  // the phone layout — instead of throwing.
  const supported =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  const [matches, setMatches] = useState(() =>
    supported ? window.matchMedia(query).matches : false
  )

  useEffect(() => {
    if (!supported) return
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query, supported])

  return matches
}

/** True at Tailwind's lg breakpoint and up (≥1024px). */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}
