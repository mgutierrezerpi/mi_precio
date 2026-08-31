import type { CSSProperties, RefObject } from 'react'
import type { JournalPage, MagazineEditSelection } from './pencilJournalTheme'

export type MagazineViewerProps = {
  pages: JournalPage[]
  title: string
  pageIndex?: number
  editorMode?: boolean
  embedded?: boolean
  onSelect?: (selection: MagazineEditSelection) => void
  onPageChange?: (index: number) => void
  inlineEditing?: MagazineEditSelection | null
  inlineValue?: string
  onInlineChange?: (value: string) => void
  onInlineCommit?: () => void
}

export type InlineRect = {
  left: number
  top: number
  width: number
  height: number
  fontFamily: string
  fontSize: string
  fontWeight: string
  lineHeight: string
  color: string
  textAlign: CSSProperties['textAlign']
}

export type ViewerRefs = {
  stageRef: RefObject<HTMLDivElement | null>
  pageRef: RefObject<HTMLDivElement | null>
  canvasRef: RefObject<HTMLDivElement | null>
}
