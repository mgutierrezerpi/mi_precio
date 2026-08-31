import type { RefObject } from 'react'
import type { JournalPage, MagazineEditSelection } from './pencilJournalTheme'
import { MagazineArrow } from './pencilJournalControls'
import { MagazineInlineEditor, MagazineLens } from './pencilJournalViewerParts'
import type { InlineRect } from './pencilJournalViewerTypes'

export function MagazineViewerStage({ pages, currentPage, pageWidth, pageHeight, pageScale, lensActive, lensPosition, touchStartX, stageRef, pageRef, canvasRef, inlineInputRef, inlineRect, inlineEditing, inlineValue, editorMode, onSelect, onInlineChange, onInlineCommit, goTo, updateLensPosition, setLensPosition }: {
  pages: JournalPage[]; currentPage: number; pageWidth: number; pageHeight: number; pageScale: number
  lensActive: boolean; lensPosition: { x: number; y: number } | null; touchStartX: RefObject<number | null>
  stageRef: RefObject<HTMLDivElement | null>; pageRef: RefObject<HTMLDivElement | null>; canvasRef: RefObject<HTMLDivElement | null>
  inlineInputRef: RefObject<HTMLInputElement | HTMLTextAreaElement | null>; inlineRect: InlineRect | null
  inlineEditing?: MagazineEditSelection | null; inlineValue: string; editorMode: boolean
  onSelect?: (event: React.MouseEvent<HTMLDivElement>) => void; onInlineChange?: (value: string) => void; onInlineCommit?: () => void
  goTo: (page: number) => void; updateLensPosition: (event: React.PointerEvent<HTMLDivElement>) => void; setLensPosition: (position: { x: number; y: number } | null) => void
}) {
  return <div ref={stageRef} className="relative min-h-0 flex-1 px-2 py-1 sm:px-6 sm:py-2" style={{ overflow: 'hidden' }} onTouchStart={(event) => { if (!lensActive) touchStartX.current = event.changedTouches[0]?.clientX ?? null }} onTouchEnd={(event) => { if (lensActive) return; const start = touchStartX.current; const end = event.changedTouches[0]?.clientX; touchStartX.current = null; if (start === null || end === undefined || Math.abs(end - start) < 48) return; goTo(currentPage + (end < start ? 1 : -1)) }}>
    <MagazineArrow direction="previous" disabled={currentPage === 0} onClick={() => goTo(currentPage - 1)} />
    <div className="flex h-full w-full items-start justify-center"><div className="relative w-full max-w-[700px]" style={{ width: `${pageWidth * pageScale}px`, height: `${pageHeight * pageScale}px`, touchAction: lensActive ? 'none' : 'pan-y' }} onPointerEnter={updateLensPosition} onPointerMove={updateLensPosition} onPointerDown={(event) => { if (!lensActive) return; event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); updateLensPosition(event) }} onPointerUp={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId) }} onPointerLeave={(event) => { if (event.pointerType === 'mouse') setLensPosition(null) }}>
      <div ref={pageRef} className="origin-top-left w-[700px] shadow-[0_25px_80px_rgba(0,0,0,.35)]" style={{ transform: `scale(${pageScale})` }}><div ref={canvasRef} key={currentPage} className={`relative animate-[journal-page-in_.32s_ease-out] ${editorMode ? 'magazine-editor-canvas' : ''}`} onClick={onSelect}>{pages[currentPage].node}{editorMode && inlineRect && inlineEditing && inlineEditing.field !== 'image' && onInlineChange && onInlineCommit && <MagazineInlineEditor inlineRect={inlineRect} inlineEditing={inlineEditing} inputRef={inlineInputRef} value={inlineValue} onChange={onInlineChange} onCommit={onInlineCommit} />}</div></div>
      {lensActive && lensPosition && <MagazineLens page={pages[currentPage]} pageWidth={pageWidth} pageScale={pageScale} lensPosition={lensPosition} lensSize={220} lensScale={2} />}
    </div></div>
    <MagazineArrow direction="next" disabled={currentPage === pages.length - 1} onClick={() => goTo(currentPage + 1)} />
  </div>
}
