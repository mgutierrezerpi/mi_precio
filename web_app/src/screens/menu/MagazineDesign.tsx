import { MagazineTemplate } from '../../components/magazine/MagazineTemplate'
import type { Magazine } from '../../types'
import { AquaObjectsJournal } from './aquaObjectsJournal'
import type { DesignProps } from './designs'
import { PencilJournal } from './pencilJournal'
import { WildStemJournal } from './wildStemJournal'

interface MagazineDesignProps {
  designProps: DesignProps
  magazine: Magazine
}

/** Chooses the public rendering component for a persisted magazine design. */
export function MagazineDesign({ designProps, magazine }: MagazineDesignProps) {
  if (magazine.design === 'editorial' || magazine.design === 'catalog') {
    return <MagazineTemplate magazine={magazine} variant={magazine.design} />
  }
  if (magazine.design === 'wild-stem') {
    return (
      <WildStemJournal
        magazineTitle={magazine.name}
        magazinePages={magazine.pages}
      />
    )
  }
  if (magazine.design === 'aqua-objects') {
    return (
      <AquaObjectsJournal
        magazineTitle={magazine.name}
        magazinePages={magazine.pages}
      />
    )
  }
  if (magazine.design !== 'pencil-journal') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#241B15] px-6 text-center text-[#F3EDE2]">
        This magazine design is not available yet.
      </div>
    )
  }
  return (
    <PencilJournal
      {...designProps}
      magazineTitle={magazine.name}
      magazineCoverImage={magazine.coverImageUrl}
      magazinePages={magazine.pages}
    />
  )
}
