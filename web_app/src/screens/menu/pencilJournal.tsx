import type { DesignProps } from './designs'
import type { MagazinePage } from '../../types'
import { fallback, type JournalPage } from './pencilJournalTheme'
import Cover from './pencilJournalCover'
import Pantry from './pencilJournalPantry'
import Pairing from './pencilJournalPairing'
import Producer from './pencilJournalProducer'
import HotShelf from './pencilJournalHotShelf'
import Recipe from './pencilJournalRecipe'
import History from './pencilJournalHistory'
import LongForm from './pencilJournalLongForm'
import OneImage from './pencilJournalOneImage'
import { MagazineViewer } from './pencilJournalViewer'
import { EditableJournalPage } from './pencilJournalEditorial'

export type { MagazineEditField, MagazineEditSelection } from './pencilJournalTheme'
export type { JournalPage } from './pencilJournalTheme'
export { MagazineViewer } from './pencilJournalViewer'
export { MagazineEditorPreview } from './pencilJournalViewer'

export function PencilJournal({
  magazineTitle,
  magazineCoverImage,
  magazinePages,
  ...props
}: DesignProps & {
  magazineTitle?: string
  magazineCoverImage?: string | null
  magazinePages?: MagazinePage[]
}) {
  const itemFor = (name: string, defaultPrice: string, description: string) =>
    props.allItems.find(
      (item) => item.name.toLowerCase() === name.toLowerCase()
    ) ?? fallback(name, defaultPrice, description)
  const pageNodes: Record<string, React.ReactNode> = {
    Cover: <Cover image={magazineCoverImage || undefined} />,
    'The Pantry Shelf': (
      <Pantry itemFor={itemFor} addToCart={props.addToCart} />
    ),
    'A Board for Four': <Pairing />,
    'People of the Pasture': <Producer />,
    'The Hot Shelf': <HotShelf itemFor={itemFor} addToCart={props.addToCart} />,
    'A Simple Recipe': <Recipe />,
    'Our History': <History />,
    'The Long Table': <LongForm />,
    'Notes from the Counter': <OneImage />,
  }
  const defaultPages: JournalPage[] = Object.entries(pageNodes).map(
    ([label, node]) => ({ label, node })
  )
  const pages: JournalPage[] = magazinePages?.length
    ? magazinePages.map((page) => ({
        label: page.title ?? `Page ${page.position + 1}`,
        node: (
          <EditableJournalPage
            page={page}
            coverImage={magazineCoverImage}
            itemFor={itemFor}
            addToCart={props.addToCart}
          />
        ),
      }))
    : defaultPages
  return (
    <MagazineViewer
      pages={pages}
      title={magazineTitle ?? 'The Cheese Factory'}
    />
  )
}
