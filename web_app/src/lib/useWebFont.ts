import { useEffect } from 'react'

/**
 * Loads a web font stylesheet the first time a component that needs it
 * mounts, instead of from `index.css` for every page. A design-only face (a
 * template's display type) then costs nothing to shops using other designs.
 * Idempotent: one `<link>` per href, however many components ask.
 */
export function useWebFont(href: string) {
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (document.querySelector(`link[data-web-font="${href}"]`)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.dataset.webFont = href
    document.head.appendChild(link)
  }, [href])
}
