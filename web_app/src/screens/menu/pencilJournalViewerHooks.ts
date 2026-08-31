import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import type { MagazineEditSelection } from './pencilJournalTheme'
import { editorTargets, minimumEditorWidth } from './pencilJournalViewerUtils'
import type { InlineRect, ViewerRefs } from './pencilJournalViewerTypes'

export function useViewerNavigation(
  pagesLength: number,
  pageIndex: number | undefined,
  onPageChange: ((index: number) => void) | undefined
) {
  const [currentPage, setCurrentPage] = useState(0)
  const goTo = useCallback((page: number) => {
    const next = Math.max(0, Math.min(pagesLength - 1, page))
    setCurrentPage(next)
    onPageChange?.(next)
  }, [onPageChange, pagesLength])
  useEffect(() => {
    if (pageIndex === undefined) return
    setCurrentPage(Math.max(0, Math.min(pagesLength - 1, pageIndex)))
  }, [pageIndex, pagesLength])
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      if (target instanceof HTMLElement && target.closest('button, a, input, textarea, select, [contenteditable="true"], [role="button"]')) return
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); goTo(currentPage - 1) }
      if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') { event.preventDefault(); goTo(currentPage + 1) }
      if (event.key === 'Home') { event.preventDefault(); goTo(0) }
      if (event.key === 'End') { event.preventDefault(); goTo(pagesLength - 1) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [currentPage, goTo, pagesLength])
  return { currentPage, goTo }
}

export function usePageMeasurement(currentPage: number, refs: ViewerRefs) {
  const [pageHeight, setPageHeight] = useState(900)
  const [pageWidth, setPageWidth] = useState(700)
  const [pageScale, setPageScale] = useState(1)
  useLayoutEffect(() => {
    const fitPage = () => {
      const stage = refs.stageRef.current
      const page = refs.pageRef.current
      if (!stage || !page) return
      setPageWidth(page.offsetWidth)
      setPageHeight(page.offsetHeight)
      setPageScale(Math.min(1, (stage.clientHeight - 16) / page.offsetHeight, (stage.clientWidth - 16) / page.offsetWidth))
    }
    const observer = new ResizeObserver(fitPage)
    if (refs.stageRef.current) observer.observe(refs.stageRef.current)
    if (refs.pageRef.current) observer.observe(refs.pageRef.current)
    fitPage()
    return () => observer.disconnect()
  }, [currentPage])
  return { pageHeight, pageWidth, pageScale }
}

export function useInlineEditorRect(
  refs: ViewerRefs,
  editorMode: boolean,
  inlineEditing: MagazineEditSelection | null | undefined,
  inlineValue: string,
  pageScale: number,
  currentPage: number
) {
  const [inlineRect, setInlineRect] = useState<InlineRect | null>(null)
  useLayoutEffect(() => {
    const root = refs.canvasRef.current
    if (!root || !editorMode || !inlineEditing || inlineEditing.field === 'image') { setInlineRect(null); return }
    const target = editorTargets(root, inlineEditing.field)[inlineEditing.textIndex ?? 0]
    if (!target) { setInlineRect(null); return }
    const rootRect = root.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const computed = window.getComputedStyle(target)
    const scale = pageScale || 1
    const left = (targetRect.left - rootRect.left) / scale
    const width = Math.min(Math.max(targetRect.width / scale, minimumEditorWidth(inlineEditing.field) / scale), rootRect.width / scale - 8)
    const adjustedLeft = Math.min(left, rootRect.width / scale - width - 8)
    const previousVisibility = target.style.visibility
    target.style.visibility = 'hidden'
    setInlineRect({ left: Math.max(0, adjustedLeft), top: (targetRect.top - rootRect.top) / scale, width, height: Math.max(targetRect.height / scale, 32), fontFamily: computed.fontFamily, fontSize: computed.fontSize, fontWeight: computed.fontWeight, lineHeight: computed.lineHeight, color: computed.color, textAlign: computed.textAlign as 'left' | 'right' | 'center' | 'justify' | undefined })
    return () => { target.style.visibility = previousVisibility }
  }, [currentPage, editorMode, inlineEditing, inlineValue, pageScale])
  return inlineRect
}
