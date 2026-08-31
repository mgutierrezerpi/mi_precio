import type { MagazinePage } from '../../types'
import { pageContent } from '../../components/magazine/templateCatalog'
import {
  MagazineViewer,
  type JournalPage,
  type MagazineEditSelection,
} from './pencilJournal'
import AquaCover from './aquaObjectsJournal/aquaCover'
import AquaMonolith from './aquaObjectsJournal/aquaMonolith'
import AquaFittings from './aquaObjectsJournal/aquaFittings'
import AquaShower from './aquaObjectsJournal/aquaShower'
import AquaFieldNotes from './aquaObjectsJournal/aquaFieldNotes'
import AquaHistory from './aquaObjectsJournal/aquaHistory'
import AquaSources from './aquaObjectsJournal/aquaSources'
import AquaCoupons from './aquaObjectsJournal/aquaCoupons'

const LAYOUTS = [
  'aqua-cover',
  'aqua-monolith',
  'aqua-fittings',
  'aqua-shower',
  'aqua-field-notes',
  'aqua-history',
  'aqua-sources',
  'aqua-coupons',
]

const DEFAULT_TITLES = [
  'Cover',
  'The Monolith Bath',
  'Brass Fittings',
  'Shower Guide',
  'Field Notes',
  'History',
  'Materials & Sources',
  'Privilege',
]

function AquaPage({ page }: { page: MagazinePage }) {
  const content = pageContent(page.content)
  const layout = content.layout ?? LAYOUTS[page.position] ?? 'aqua-monolith'
  if (layout === 'aqua-cover') return <AquaCover content={content} />
  if (layout === 'aqua-monolith') return <AquaMonolith content={content} />
  if (layout === 'aqua-fittings') return <AquaFittings content={content} />
  if (layout === 'aqua-shower') return <AquaShower content={content} />
  if (layout === 'aqua-field-notes') return <AquaFieldNotes content={content} />
  if (layout === 'aqua-history') return <AquaHistory content={content} />
  if (layout === 'aqua-sources') return <AquaSources content={content} />
  return <AquaCoupons content={content} />
}

function defaultPage(title: string, position: number): MagazinePage {
  return {
    id: title,
    magazineId: '',
    position,
    pageType: position === 0 ? 'cover' : 'editorial',
    title,
    imageUrl: null,
    content: { layout: LAYOUTS[position] },
  }
}

function pagesFor(magazinePages: MagazinePage[] | undefined): JournalPage[] {
  const pages = magazinePages?.length
    ? magazinePages
    : DEFAULT_TITLES.map(defaultPage)
  return pages.map((page) => ({
    label: page.title ?? `Page ${page.position + 1}`,
    node: <AquaPage page={page} />,
  }))
}

export function AquaObjectsJournal({
  magazineTitle,
  magazinePages,
}: {
  magazineTitle?: string
  magazinePages?: MagazinePage[]
}) {
  return (
    <MagazineViewer
      pages={pagesFor(magazinePages)}
      title={magazineTitle ?? 'Aqua · Bathroom Objects'}
    />
  )
}

export function AquaObjectsEditorPreview({
  magazineTitle,
  magazinePages,
  pageIndex,
  onSelect,
  onPageChange,
  embedded = false,
  inlineEditing,
  inlineValue,
  onInlineChange,
  onInlineCommit,
}: {
  magazineTitle: string
  magazinePages: MagazinePage[]
  pageIndex?: number
  onSelect: (selection: MagazineEditSelection) => void
  onPageChange: (index: number) => void
  embedded?: boolean
  inlineEditing?: MagazineEditSelection | null
  inlineValue?: string
  onInlineChange?: (value: string) => void
  onInlineCommit?: () => void
}) {
  return (
    <MagazineViewer
      pages={pagesFor(magazinePages)}
      title={magazineTitle}
      pageIndex={pageIndex}
      editorMode
      embedded={embedded}
      onSelect={onSelect}
      onPageChange={onPageChange}
      inlineEditing={inlineEditing}
      inlineValue={inlineValue}
      onInlineChange={onInlineChange}
      onInlineCommit={onInlineCommit}
    />
  )
}

