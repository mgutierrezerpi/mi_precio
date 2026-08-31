import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import type { MagazinePage } from '../../types'
import type { JournalPage, MagazineEditField, MagazineEditSelection } from './pencilJournalTheme'
import { MagazineLensControl } from './pencilJournalControls'
import { EditableJournalPage } from './pencilJournalEditorial'
import { fallback } from './pencilJournalTheme'
import { useInlineEditorRect, usePageMeasurement, useViewerNavigation } from './pencilJournalViewerHooks'
import { MagazineViewerHeader } from './pencilJournalViewerParts'
import { MagazineViewerStage } from './pencilJournalViewerStage'
import type { MagazineViewerProps } from './pencilJournalViewerTypes'

export function MagazineViewer({ pages, title, pageIndex, editorMode = false, embedded = false, onSelect, onPageChange, inlineEditing, inlineValue = '', onInlineChange, onInlineCommit }: MagazineViewerProps) {
  const { currentPage, goTo } = useViewerNavigation(pages.length, pageIndex, onPageChange)
  const stageRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const inlineInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const { pageHeight, pageWidth, pageScale } = usePageMeasurement(currentPage, { stageRef, pageRef, canvasRef })
  const inlineRect = useInlineEditorRect({ stageRef, pageRef, canvasRef }, editorMode, inlineEditing, inlineValue, pageScale, currentPage)
  const [lensActive, setLensActive] = useState(false)
  const [lensPosition, setLensPosition] = useState<{ x: number; y: number } | null>(null)
  const touchStartX = useRef<number | null>(null)
  useEffect(() => { if (inlineRect) inlineInputRef.current?.focus() }, [inlineRect])
  const selectEditorTarget = (event: MouseEvent<HTMLDivElement>) => {
    if (!editorMode || !onSelect) return
    const element = (event.target as HTMLElement).closest<HTMLElement>('[data-magazine-field]')
    if (!element || !event.currentTarget.contains(element)) return
    const field = element.dataset.magazineField as MagazineEditField | undefined
    if (!field) return
    if (field === 'image') {
      const images = Array.from(event.currentTarget.querySelectorAll('img[data-magazine-field="image"]'))
      onSelect({ field, imageIndex: Math.max(0, images.indexOf(element as HTMLImageElement)) }); return
    }
    const targets = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(`[data-magazine-field="${field}"]`))
    const productIndex = element.dataset.magazineProductIndex
    onSelect({ field, textIndex: Math.max(0, targets.indexOf(element)), ...(productIndex === undefined ? {} : { productIndex: Number(productIndex) }) })
  }
  const updateLensPosition = (event: PointerEvent<HTMLDivElement>) => {
    if (!lensActive) return
    const frame = event.currentTarget.getBoundingClientRect(); const radius = 110
    setLensPosition({ x: Math.max(radius, Math.min(frame.width - radius, event.clientX - frame.left)), y: Math.max(radius, Math.min(frame.height - radius, event.clientY - frame.top)) })
  }
  return <div className={`flex ${embedded ? 'h-full min-h-[640px] rounded-2xl' : 'h-[100dvh]'} flex-col overflow-hidden bg-[#241B15] text-[#F3EDE2]`}>
    {!embedded && <MagazineViewerHeader pages={pages} title={title} currentPage={currentPage} goTo={goTo} />}
    <MagazineViewerStage pages={pages} currentPage={currentPage} pageWidth={pageWidth} pageHeight={pageHeight} pageScale={pageScale} lensActive={lensActive} lensPosition={lensPosition} touchStartX={touchStartX} stageRef={stageRef} pageRef={pageRef} canvasRef={canvasRef} inlineInputRef={inlineInputRef} inlineRect={inlineRect} inlineEditing={inlineEditing} inlineValue={inlineValue} editorMode={editorMode} onSelect={selectEditorTarget} onInlineChange={onInlineChange} onInlineCommit={onInlineCommit} goTo={goTo} updateLensPosition={updateLensPosition} setLensPosition={setLensPosition} />
    {!editorMode && <div className="pointer-events-auto fixed bottom-3 right-3 z-30 sm:bottom-4 sm:right-4"><MagazineLensControl active={lensActive} onToggle={() => { setLensActive((value) => !value); setLensPosition(null) }} /></div>}
  </div>
}

export function MagazineEditorPreview({ magazineTitle, magazineCoverImage, magazinePages, onSelect, onPageChange, pageIndex, embedded = false, inlineEditing, inlineValue, onInlineChange, onInlineCommit }: {
  magazineTitle: string; magazineCoverImage?: string | null; magazinePages: MagazinePage[]; onSelect: (selection: MagazineEditSelection) => void; onPageChange: (index: number) => void; pageIndex?: number; embedded?: boolean; inlineEditing?: MagazineEditSelection | null; inlineValue?: string; onInlineChange?: (value: string) => void; onInlineCommit?: () => void
}) {
  const itemFor = (name: string, defaultPrice: string, description: string) => fallback(name, defaultPrice, description)
  const pages: JournalPage[] = magazinePages.map((page) => ({ label: page.title ?? `Page ${page.position + 1}`, node: <EditableJournalPage page={page} coverImage={magazineCoverImage} itemFor={itemFor} addToCart={() => undefined} /> }))
  return <MagazineViewer pages={pages} title={magazineTitle} pageIndex={pageIndex} editorMode embedded={embedded} onSelect={onSelect} onPageChange={onPageChange} inlineEditing={inlineEditing} inlineValue={inlineValue} onInlineChange={onInlineChange} onInlineCommit={onInlineCommit} />
}
