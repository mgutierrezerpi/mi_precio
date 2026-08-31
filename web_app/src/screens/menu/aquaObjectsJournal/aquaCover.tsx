import type { MagazinePageContent } from '../../../components/magazine/templateCatalog'
import {
  COLORS,
  Footer,
  Folio,
  IMAGES,
  MONO,
  Page,
  Photo,
  SANS,
  SERIF,
  imagePosition,
} from './aquaParts'

function Cover({ content }: { content: MagazinePageContent }) {
  return (
    <Page background={COLORS.dark}>
      <Photo
        src={content.images?.[0] ?? IMAGES.cover}
        alt="A dark bathroom with a freestanding bath and brass tap"
        className="h-[900px]"
        position={imagePosition(content, 0)}
      />
      <div className="pointer-events-none absolute inset-0 bg-[#10121166]" />
      <div className="absolute left-[48px] top-[42px]">
        <Folio color="#F4EFE5" field>
          {content.eyebrow ?? 'OBJECTS FOR WATER · ISSUE Nº 01 · 2025'}
        </Folio>
      </div>
      <p
        className="absolute left-[48px] top-[94px] text-[82px] tracking-[1.5px] text-[#F4EFE5]"
        style={{ fontFamily: SERIF }}
      >
        AQUA
      </p>
      <p
        className="absolute left-[328px] top-[122px] text-[12px] tracking-[1px] text-[#D6C9B5]"
        style={{ fontFamily: MONO }}
      >
        / EDIT
      </p>
      <div className="absolute left-[48px] top-[212px] h-px w-[604px] bg-[#D6C9B599]" />
      <h1
        data-magazine-field="headline"
        className="absolute left-[48px] top-[592px] w-[560px] text-[55px] leading-[.95] text-white"
        style={{ fontFamily: SERIF, fontWeight: 400 }}
      >
        {content.headline ?? 'The new ritual of the room.'}
      </h1>
      <p
        data-magazine-field="body"
        className="absolute left-[50px] top-[720px] w-[420px] text-[14px] leading-[1.42] text-[#F4EFE5]"
        style={{ fontFamily: SANS }}
      >
        {content.body ??
          'A considered guide to taps, basins, baths and the materials that make a private space feel extraordinary.'}
      </p>
      <div className="absolute left-[50px] top-[828px]">
        <Folio color="#D6C9B5">
          INSIDE — THE MONOLITH BATH / CHROME REVISITED / A QUIETER SHOWER
        </Folio>
      </div>
      <div className="absolute bottom-[42px] left-[50px]">
        <Footer color="#F4EFE5">
          {content.footer ?? 'AQUA / EDIT · OBJECTS FOR WATER · 01'}
        </Footer>
      </div>
    </Page>
  )
}

export default Cover

