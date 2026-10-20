/** Runs `load` every `ms` while the tab is visible, and once more as soon as
 *  it comes back. The notification bell (10 s) and the activity feeds (7 s)
 *  kept polling the API from tabs nobody was looking at. Returns the cleanup. */
export function pollWhileVisible(load: () => void, ms: number): () => void {
  const id = setInterval(() => {
    if (!document.hidden) load()
  }, ms)
  const onVisible = () => {
    if (!document.hidden) load()
  }
  document.addEventListener('visibilitychange', onVisible)
  return () => {
    clearInterval(id)
    document.removeEventListener('visibilitychange', onVisible)
  }
}
