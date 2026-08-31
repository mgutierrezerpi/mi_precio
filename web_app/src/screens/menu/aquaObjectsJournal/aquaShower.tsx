import type { MagazinePageContent } from '../../../components/magazine/templateCatalog'
import {
  COLORS,
  Footer,
  Folio,
  MONO,
  Page,
  SANS,
  SERIF,
} from './aquaParts'

function ShowerGuide({ content }: { content: MagazinePageContent }) {
  const defaultSteps = [
    'THE HEAD\nA wide rain head, 250 mm minimum, placed well above the tallest person in the house.',
    'THE CONTROL\nThermostatic control at the entrance — no reaching into cold water.',
    'THE DRAIN\nA linear drain that lets the floor read as one continuous plane.',
  ]
  const bodyParts = content.body?.split('\n\n') ?? []
  const intro =
    content.body === undefined
      ? 'Good showering is choreography: the fall, the temperature, the small moment when the room disappears.'
      : (bodyParts[0] ?? '')
  const steps = content.body === undefined ? defaultSteps : bodyParts.slice(1)
  return (
    <Page background={COLORS.shower}>
      <div className="absolute left-[46px] top-[40px]">
        <Folio field>{content.eyebrow ?? '04 · A QUIETER SHOWER'}</Folio>
      </div>
      <h2
        data-magazine-field="headline"
        className="absolute left-[46px] top-[78px] w-[560px] text-[49px] leading-[.96]"
        style={{ fontFamily: SERIF, fontWeight: 400 }}
      >
        {content.headline ?? 'Designing for the sound of rain.'}
      </h2>
      <p
        data-magazine-field="body"
        className="absolute left-[48px] top-[226px] w-[470px] text-[14px] leading-[1.42] text-[#4F544E]"
        style={{ fontFamily: SANS }}
      >
        {intro}
      </p>
      <div
        data-magazine-field="body"
        className="absolute left-[46px] top-[360px] flex w-[608px] flex-col"
      >
        {steps.slice(0, 3).map((step, index) => {
          const [title, copy = ''] = step.split('\n')
          return (
            <div
              key={index}
              className="flex min-h-[110px] items-center gap-[22px] border-b border-[#AAA89F]"
            >
              <span
                className="text-[10px] text-[#746E62]"
                style={{ fontFamily: MONO }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flex flex-1 flex-col gap-[5px]">
                <span
                  className="text-[24px] leading-none"
                  style={{ fontFamily: SERIF }}
                >
                  {title}
                </span>
                <span
                  className="text-[11px] leading-[1.35] text-[#4F544E]"
                  style={{ fontFamily: SANS }}
                >
                  {copy}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      <p
        data-magazine-field="quote"
        className="absolute left-[46px] top-[748px] w-[540px] text-[25px] italic leading-[1.12]"
        style={{ fontFamily: SERIF }}
      >
        {' '}
        {content.quote ?? '“The best rooms have a way of lowering your voice.”'}
      </p>
      <div className="absolute bottom-[42px] left-[46px]">
        <Footer>{content.footer ?? 'AQUA / EDIT · GUIDE · 04'}</Footer>
      </div>
    </Page>
  )
}

export default ShowerGuide

