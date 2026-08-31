import type { MagazinePageContent } from '../../../components/magazine/templateCatalog'
import {
  COLORS,
  Footer,
  Folio,
  IMAGES,
  Page,
  Photo,
  SANS,
  SERIF,
  imagePosition,
} from './aquaParts'

function History({ content }: { content: MagazinePageContent }) {
  const parts = content.body?.split('\n\n') ?? []
  const standfirst =
    parts[0] ??
    'From Roman thermae to the Japanese ofuro, the history of bathing has always '
    + 'been a story about how a culture understands time, body and care.'
  const left =
    parts[1] ??
    'The earliest bathing rooms were collective spaces. In Rome, heat was a sequence: '
    + 'tepidarium, caldarium, frigidarium. Architecture guided the body through '
    + 'temperature, conversation and pause.'
  const right =
    parts[2] ??
    'Centuries later, the domestic bathroom became a laboratory for privacy. Porcelain, '
    + 'plumbing and the small luxury of hot water moved the ritual behind a closed door '
    + '— but never made it less important.'
  return (
    <Page background={COLORS.history}>
      <div className="absolute left-[46px] top-[40px]">
        <Folio field>
          {content.eyebrow ?? '06 · A BRIEF HISTORY OF THE BATH'}
        </Folio>
      </div>
      <h2
        data-magazine-field="headline"
        className="absolute left-[46px] top-[78px] w-[580px] text-[48px] leading-[.96]"
        style={{ fontFamily: SERIF, fontWeight: 400 }}
      >
        {content.headline ??
          'Before it was private, the bath was a civic pleasure.'}
      </h2>
      <p
        data-magazine-field="body"
        className="absolute left-[48px] top-[220px] w-[525px] text-[14px] leading-[1.5] text-[#5D5A52]"
        style={{ fontFamily: SANS }}
      >
        {standfirst}
      </p>
      <Photo
        src={content.images?.[0] ?? IMAGES.history}
        alt="Historic bathing architecture"
        className="absolute left-[46px] top-[338px] h-[190px] w-[608px]"
        position={imagePosition(content, 0)}
      />
      <div className="absolute left-[46px] top-[568px] grid w-[608px] grid-cols-2 gap-[26px]">
        <div className="flex flex-col gap-[10px]">
          <p
            data-magazine-field="body"
            className="text-[12px] leading-[1.5] text-[#34342F]"
            style={{ fontFamily: SANS }}
          >
            {left}
          </p>
          <p
            data-magazine-field="quote"
            className="text-[21px] italic leading-[1.1] text-[#6B523A]"
            style={{ fontFamily: SERIF }}
          >
            {content.quote ?? '“To bathe was to participate in public life.”'}
          </p>
        </div>
        <div className="flex flex-col gap-[10px]">
          <p
            data-magazine-field="body"
            className="text-[12px] leading-[1.5] text-[#34342F]"
            style={{ fontFamily: SANS }}
          >
            {right}
          </p>
          <Folio color="#776B5D">WORDS · STUDIO AQUA</Folio>
        </div>
      </div>
      <div className="absolute bottom-[42px] left-[46px]">
        <Footer color="#776B5D">
          {content.footer ?? 'AQUA / EDIT · HISTORY · 06'}
        </Footer>
      </div>
    </Page>
  )
}

export default History
