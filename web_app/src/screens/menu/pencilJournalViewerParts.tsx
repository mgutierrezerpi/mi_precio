import type { ChangeEvent, KeyboardEvent, RefObject } from 'react'
import type { JournalPage, MagazineEditSelection } from './pencilJournalTheme'
import { COLORS, MONO } from './pencilJournalTheme'
import type { InlineRect } from './pencilJournalViewerTypes'

export function MagazineViewerHeader({ pages, title, currentPage, goTo }: {
  pages: JournalPage[]; title: string; currentPage: number; goTo: (page: number) => void
}) {
  return <div className="z-20 shrink-0 border-b border-[#F3EDE2]/10 bg-[#241B15] px-5 py-4 sm:px-8">
    <div className="mx-auto flex w-full max-w-[820px] items-center justify-between gap-3">
      <p className="max-w-[125px] truncate text-[9px] uppercase tracking-[2px] text-[#D6B58B] sm:max-w-none" style={{ fontFamily: MONO }}>{title}</p>
      <div className="flex max-w-[42vw] items-center justify-start gap-1.5 overflow-x-auto py-1 [scrollbar-width:none] md:max-w-none md:justify-center md:overflow-visible" aria-label="Magazine pages">
        {pages.map((page, index) => <button key={page.label} type="button" aria-label={`Go to ${page.label}`} aria-current={index === currentPage ? 'page' : undefined} onClick={() => goTo(index)} className={`h-1.5 rounded-full transition-all ${index === currentPage ? 'w-6 bg-[#D6B58B]' : 'w-1.5 bg-[#F3EDE2]/30 hover:bg-[#F3EDE2]/60'}`} />)}
      </div>
      <p className="text-[10px] uppercase tracking-[1.5px] text-[#F3EDE2]/80" style={{ fontFamily: MONO }}>{String(currentPage + 1).padStart(2, '0')} / {String(pages.length).padStart(2, '0')}</p>
    </div>
  </div>
}

export function MagazineInlineEditor({ inlineRect, inlineEditing, inputRef, value, onChange, onCommit }: {
  inlineRect: InlineRect; inlineEditing: MagazineEditSelection; inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement | null>
  value: string; onChange: (value: string) => void; onCommit: () => void
}) {
  const multiline = inlineEditing.field === 'body' || inlineEditing.field === 'quote' || inlineEditing.field === 'productDescription'
  const style = { left: inlineRect.left, top: inlineRect.top, width: inlineRect.width, ...(multiline ? { minHeight: inlineRect.height } : { height: inlineRect.height }), fontFamily: inlineRect.fontFamily, fontSize: inlineRect.fontSize, fontWeight: inlineRect.fontWeight, lineHeight: inlineRect.lineHeight, color: COLORS.ink, textAlign: inlineRect.textAlign as 'left' | 'right' | 'center' | 'justify' | undefined }
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if ((multiline && (event.key === 'Escape' || ((event.metaKey || event.ctrlKey) && event.key === 'Enter'))) || (!multiline && (event.key === 'Enter' || event.key === 'Escape'))) onCommit()
  }
  const props = { ref: inputRef as RefObject<HTMLInputElement> & RefObject<HTMLTextAreaElement>, value, onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value), onBlur: onCommit, onClick: (event: React.MouseEvent) => event.stopPropagation(), onKeyDown, className: 'absolute z-30 rounded-sm border-2 border-[#D6B58B] bg-[#F7F2EA] px-1.5 py-1 text-[#3A2A1D] outline-none', style }
  return multiline ? <textarea {...props} className={`${props.className} resize-none`} /> : <input {...props} />
}

export function MagazineLens({ page, pageWidth, pageScale, lensPosition, lensSize, lensScale }: {
  page: JournalPage; pageWidth: number; pageScale: number; lensPosition: { x: number; y: number }; lensSize: number; lensScale: number
}) {
  return <div className="pointer-events-none absolute z-20 overflow-hidden rounded-full border-2 border-[#D6B58B] bg-[#3A2A1D] shadow-[0_12px_35px_rgba(0,0,0,.45)]" style={{ left: lensPosition.x - lensSize / 2, top: lensPosition.y - lensSize / 2, width: lensSize, height: lensSize }}>
    <div className="absolute origin-top-left" style={{ left: lensSize / 2 - lensPosition.x * lensScale, top: lensSize / 2 - lensPosition.y * lensScale, width: pageWidth, transform: `scale(${pageScale * lensScale})` }}>{page.node}</div>
    <span className="absolute inset-0 rounded-full border border-white/20" />
  </div>
}
