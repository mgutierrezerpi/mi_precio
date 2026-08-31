import type { MagazinePage } from '../../types'
import {
  DEFAULT_AQUA_PRODUCTS,
  pageContent,
  type MagazinePageContent,
  type MagazineProductContent,
} from '../../components/magazine/templateCatalog'
import {
  MagazineViewer,
  type JournalPage,
  type MagazineEditSelection,
} from './pencilJournal'

const SERIF = '"DM Serif Display", Georgia, serif'
const MONO = '"IBM Plex Mono", "Courier New", monospace'
const SANS = 'Inter, system-ui, sans-serif'

const COLORS = {
  ink: '#1B1D1B',
  paper: '#F1EEE7',
  dark: '#252725',
  darkInk: '#F5F1E8',
  muted: '#746E62',
  darkMuted: '#D8D6CF',
  sand: '#D6C8AD',
  shower: '#D9D4C7',
  history: '#E8E1D3',
  sources: '#222522',
  coupons: '#D6C8AD',
}

const IMAGES = {
  cover: '/pencil/aqua-objects/x4XJN.png',
  monolith: '/pencil/aqua-objects/idcKU.png',
  fittings: '/pencil/aqua-objects/ac0MG.png',
  history: '/pencil/aqua-objects/N6NA6m.png',
  paleRoom: '/pencil/aqua-objects/pale-room.jpg',
  brassRoom: '/pencil/aqua-objects/brass-room.jpg',
  steamRoom: '/pencil/aqua-objects/steam-room.jpg',
}

function Page({
  background,
  children,
  className = '',
}: {
  background: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={`relative mx-auto min-h-[900px] w-full max-w-[700px] overflow-hidden ${className}`}
      style={{ background, color: COLORS.ink }}
    >
      {children}
    </section>
  )
}

function Folio({
  children,
  color = COLORS.muted,
  field = false,
}: {
  children: React.ReactNode
  color?: string
  field?: boolean
}) {
  return (
    <p
      {...(field ? { 'data-magazine-field': 'eyebrow' } : {})}
      className="text-[10px] uppercase tracking-[1.1px]"
      style={{ color, fontFamily: MONO }}
    >
      {children}
    </p>
  )
}

function Footer({
  children,
  color = COLORS.muted,
}: {
  children: React.ReactNode
  color?: string
}) {
  return (
    <p
      data-magazine-field="footer"
      className="text-[9px] uppercase tracking-[.8px]"
      style={{ color, fontFamily: MONO }}
    >
      {children}
    </p>
  )
}

function Photo({
  src,
  alt,
  className = '',
  position = 'center',
}: {
  src: string
  alt: string
  className?: string
  position?: string
}) {
  return (
    <img
      data-magazine-field="image"
      src={src}
      alt={alt}
      className={`block w-full object-cover ${className}`}
      style={{ objectPosition: position }}
    />
  )
}

function imagePosition(content: MagazinePageContent, index: number) {
  return content.imagePositions?.[index] ?? 'center'
}

function productsFor(
  content: MagazinePageContent,
  layout: string
): MagazineProductContent[] {
  if (content.products !== undefined) return content.products
  return DEFAULT_AQUA_PRODUCTS[layout] ?? []
}

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

function Monolith({ content }: { content: MagazinePageContent }) {
  const products = productsFor(content, 'aqua-monolith')
  return (
    <Page background={COLORS.paper}>
      <div className="absolute left-[46px] top-[40px]">
        <Folio field>{content.eyebrow ?? '02 · THE MONOLITH BATH'}</Folio>
      </div>
      <h2
        data-magazine-field="headline"
        className="absolute left-[46px] top-[78px] w-[570px] text-[48px] leading-[.96]"
        style={{ fontFamily: SERIF, fontWeight: 400 }}
      >
        {content.headline ?? 'A bath as an object, not an afterthought.'}
      </h2>
      <p
        data-magazine-field="body"
        className="absolute left-[48px] top-[224px] w-[480px] text-[14px] leading-[1.42] text-[#5F625C]"
        style={{ fontFamily: SANS }}
      >
        {content.body ??
          'One continuous form in mineral composite — quiet, substantial and made to hold the room.'}
      </p>
      <Photo
        src={content.images?.[0] ?? IMAGES.monolith}
        alt="An ivory freestanding bath beside a window"
        className="absolute left-[46px] top-[330px] h-[330px] w-[608px]"
        position={imagePosition(content, 0)}
      />
      <div className="absolute left-[46px] top-[705px] flex h-[76px] w-[608px] border-y border-[#B8B3A8]">
        {products.slice(0, 3).map((product, index) => (
          <div
            key={`${product.name}-${index}`}
            className="flex flex-1 flex-col justify-center gap-[7px]"
          >
            <p
              data-magazine-field="productName"
              data-magazine-product-index={index}
              className="text-[9px] uppercase tracking-[.8px] text-[#746E62]"
              style={{ fontFamily: MONO }}
            >
              {product.name}
            </p>
            <p
              data-magazine-field="productPrice"
              data-magazine-product-index={index}
              className="text-[10px] font-semibold tracking-[.4px]"
              style={{ fontFamily: SANS }}
            >
              {product.price}
            </p>
          </div>
        ))}
      </div>
      <div className="absolute bottom-[42px] left-[46px]">
        <Footer>{content.footer ?? 'AQUA / EDIT · OBJECT STUDY · 02'}</Footer>
      </div>
    </Page>
  )
}

function Fittings({ content }: { content: MagazinePageContent }) {
  const products = productsFor(content, 'aqua-fittings')
  return (
    <Page background={COLORS.dark} className="text-white">
      <div className="absolute left-[46px] top-[40px]">
        <Folio color={COLORS.sand} field>
          {content.eyebrow ?? '03 · CHROME, RECONSIDERED'}
        </Folio>
      </div>
      <h2
        data-magazine-field="headline"
        className="absolute left-[46px] top-[84px] w-[560px] text-[50px] leading-[.96] text-[#F5F1E8]"
        style={{ fontFamily: SERIF, fontWeight: 400 }}
      >
        {content.headline ?? 'The line where water meets metal.'}
      </h2>
      <p
        data-magazine-field="body"
        className="absolute left-[48px] top-[232px] w-[470px] text-[14px] leading-[1.42] text-[#D8D6CF]"
        style={{ fontFamily: SANS }}
      >
        {content.body ??
          'Fittings should feel inevitable: precise in the hand, almost invisible in the composition.'}
      </p>
      <Photo
        src={content.images?.[0] ?? IMAGES.fittings}
        alt="A wall-mounted brass tap against dark green stone"
        className="absolute left-[46px] top-[355px] h-[255px] w-[608px]"
        position={imagePosition(content, 0)}
      />
      <div className="absolute left-[48px] top-[656px] flex w-[560px] flex-col gap-4">
        {products.slice(0, 3).map((product, index) => (
          <div
            key={`${product.name}-${index}`}
            className="grid grid-cols-[44px_1fr_1fr] items-center gap-0"
          >
            <span
              className="text-[10px] text-[#D5C8A9]"
              style={{ fontFamily: MONO }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <p
              data-magazine-field="productName"
              data-magazine-product-index={index}
              className="text-[22px] leading-none text-[#F5F1E8]"
              style={{ fontFamily: SERIF }}
            >
              {product.name}
            </p>
            <p
              data-magazine-field="productPrice"
              data-magazine-product-index={index}
              className="text-[9px] tracking-[.5px] text-[#D8D6CF]"
              style={{ fontFamily: MONO }}
            >
              {product.price}
            </p>
          </div>
        ))}
      </div>
      <div className="absolute bottom-[42px] left-[46px]">
        <Footer color={COLORS.sand}>
          {content.footer ?? 'AQUA / EDIT · FITTINGS · 03'}
        </Footer>
      </div>
    </Page>
  )
}

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

function FieldNotes({ content }: { content: MagazinePageContent }) {
  const products = productsFor(content, 'aqua-field-notes')
  const images = content.images ?? [
    IMAGES.paleRoom,
    IMAGES.brassRoom,
    IMAGES.steamRoom,
  ]
  return (
    <Page background={COLORS.paper}>
      <div className="absolute left-[46px] top-[40px]">
        <Folio field>{content.eyebrow ?? '05 · FIELD NOTES'}</Folio>
      </div>
      <h2
        data-magazine-field="headline"
        className="absolute left-[46px] top-[70px] text-[43px] leading-none"
        style={{ fontFamily: SERIF, fontWeight: 400 }}
      >
        {' '}
        {content.headline ?? 'Three rooms worth lingering in'}
      </h2>
      <p
        data-magazine-field="body"
        className="absolute left-[46px] top-[128px] w-[520px] text-[13px] leading-[1.4] text-[#5F625C]"
        style={{ fontFamily: SANS }}
      >
        {content.body ??
          'Small studies in light, material and the everyday gestures that turn a bathroom into a private sanctuary.'}
      </p>
      <div className="absolute left-[46px] top-[215px] flex w-[608px] flex-col gap-[25px]">
        {products.slice(0, 3).map((product, index) => (
          <div
            key={`${product.name}-${index}`}
            className="flex h-[165px] gap-7"
          >
            <Photo
              src={images[index] ?? ''}
              alt={product.name}
              className="h-[165px] w-[190px] shrink-0"
              position={imagePosition(content, index)}
            />
            <div className="flex flex-col gap-[7px] pt-[6px]">
              <Folio color="#8B7660">{product.price}</Folio>
              <p
                data-magazine-field="productName"
                data-magazine-product-index={index}
                className="text-[25px] leading-[1.04]"
                style={{ fontFamily: SERIF }}
              >
                {product.name}
              </p>
              <p
                data-magazine-field="productDescription"
                data-magazine-product-index={index}
                className="text-[11px] leading-[1.35] text-[#5F625C]"
                style={{ fontFamily: SANS }}
              >
                {product.description}
              </p>
              <Folio>READ ARTICLE →</Folio>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-[58px] left-[46px] h-px w-[608px] bg-[#B8B3A8]" />
      <p
        className="absolute bottom-[31px] left-[46px] text-[21px] italic"
        style={{ fontFamily: SERIF }}
      >
        {content.quote ?? 'Good design gives the day somewhere to land.'}
      </p>
      <div className="absolute bottom-[10px] left-[46px]">
        <Footer>{content.footer ?? 'AQUA / EDIT · FIELD NOTES · 05'}</Footer>
      </div>
    </Page>
  )
}

function History({ content }: { content: MagazinePageContent }) {
  const parts = content.body?.split('\n\n') ?? []
  const standfirst =
    parts[0] ??
    'From Roman thermae to the Japanese ofuro, the history of bathing has always been a story about how a culture understands time, body and care.'
  const left =
    parts[1] ??
    'The earliest bathing rooms were collective spaces. In Rome, heat was a sequence: tepidarium, caldarium, frigidarium. Architecture guided the body through temperature, conversation and pause.'
  const right =
    parts[2] ??
    'Centuries later, the domestic bathroom became a laboratory for privacy. Porcelain, plumbing and the small luxury of hot water moved the ritual behind a closed door — but never made it less important.'
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

function Sources({ content }: { content: MagazinePageContent }) {
  const products = productsFor(content, 'aqua-sources')
  return (
    <Page background={COLORS.sources} className="text-white">
      <div className="absolute left-[46px] top-[40px]">
        <Folio color={COLORS.sand} field>
          {content.eyebrow ?? '07 · MATERIALS & SOURCES'}
        </Folio>
      </div>
      <h2
        data-magazine-field="headline"
        className="absolute left-[46px] top-[78px] w-[560px] text-[49px] leading-[.96] text-[#F5F1E8]"
        style={{ fontFamily: SERIF, fontWeight: 400 }}
      >
        {content.headline ?? 'Where the good things come from.'}
      </h2>
      <p
        data-magazine-field="body"
        className="absolute left-[48px] top-[220px] w-[495px] text-[14px] leading-[1.42] text-[#D8D6CF]"
        style={{ fontFamily: SANS }}
      >
        {content.body ??
          'A bathroom gains character from the provenance of its materials — their origin, their making and the way they wear over time.'}
      </p>
      <div className="absolute left-[46px] top-[350px] flex w-[608px] flex-col">
        {products.slice(0, 3).map((product, index) => (
          <div
            key={`${product.name}-${index}`}
            className="grid min-h-[120px] grid-cols-[48px_222px_1fr] gap-0 border-b border-[#4B504B] pt-1"
          >
            <span
              className="text-[10px] text-[#D5C8A9]"
              style={{ fontFamily: MONO }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <p
                data-magazine-field="productName"
                data-magazine-product-index={index}
                className="text-[27px] leading-none text-[#F5F1E8]"
                style={{ fontFamily: SERIF }}
              >
                {product.name}
              </p>
              <p
                data-magazine-field="productPrice"
                data-magazine-product-index={index}
                className="mt-2 text-[9px] uppercase tracking-[.8px] text-[#D5C8A9]"
                style={{ fontFamily: MONO }}
              >
                {product.price}
              </p>
            </div>
            <p
              data-magazine-field="productDescription"
              data-magazine-product-index={index}
              className="text-[11px] leading-[1.35] text-[#D8D6CF]"
              style={{ fontFamily: SANS }}
            >
              {product.description}
            </p>
          </div>
        ))}
      </div>
      <div className="absolute left-[46px] top-[790px]">
        <Folio color={COLORS.sand}>EDITORIAL SOURCES</Folio>
      </div>
      <p
        data-magazine-field="body"
        className="absolute left-[46px] top-[817px] w-[585px] text-[10px] leading-[1.4] text-[#D8D6CF]"
        style={{ fontFamily: SANS }}
      >
        {content.quote ??
          'The Bath: A History of Cleanliness and Pollution — G. Vigarello · The Roman Baths — F. Yegül · Manufacturer finish archives and studio interviews, 2025.'}
      </p>
      <div className="absolute bottom-[10px] left-[46px]">
        <Footer color={COLORS.sand}>
          {content.footer ?? 'AQUA / EDIT · SOURCES · 07'}
        </Footer>
      </div>
    </Page>
  )
}

function Coupons({ content }: { content: MagazinePageContent }) {
  const products = productsFor(content, 'aqua-coupons')
  const labels = ['THE FIRST FIXTURE', 'THE BATHING ROOM', 'THE COMPLETE ROOM']
  return (
    <Page background={COLORS.coupons}>
      <div className="absolute left-[46px] top-[40px]">
        <Folio color="#5E5244" field>
          {content.eyebrow ?? '08 · PRIVILEGE INSERT'}
        </Folio>
      </div>
      <h2
        data-magazine-field="headline"
        className="absolute left-[46px] top-[78px] w-[560px] text-[47px] leading-[.96]"
        style={{ fontFamily: SERIF, fontWeight: 400 }}
      >
        {content.headline ?? 'A few reasons to begin the room.'}
      </h2>
      <p
        data-magazine-field="body"
        className="absolute left-[48px] top-[212px] w-[490px] text-[13px] leading-[1.4] text-[#5E5244]"
        style={{ fontFamily: SANS }}
      >
        {content.body ??
          'Keep this page close. Three invitations for a more considered bathroom, valid through the end of the season.'}
      </p>
      <div className="absolute left-[46px] top-[325px] flex w-[608px] flex-col gap-4">
        {products.slice(0, 3).map((product, index) => (
          <div
            key={`${product.name}-${index}`}
            className="relative h-[145px] border border-[#5E5244] bg-[#F4EFE5] px-[22px] pt-[18px]"
          >
            <div className="flex gap-9">
              <Folio color="#8B7660">
                {String(index + 1).padStart(2, '0')}
              </Folio>
              <Folio color="#5E5244">{labels[index]}</Folio>
            </div>
            <p
              data-magazine-field="productName"
              data-magazine-product-index={index}
              className="mt-4 max-w-[420px] text-[25px] leading-[1.04]"
              style={{ fontFamily: SERIF }}
            >
              {product.name}
            </p>
            <p
              data-magazine-field="productDescription"
              data-magazine-product-index={index}
              className="absolute bottom-[17px] left-[22px] text-[10px] text-[#5E5244]"
              style={{ fontFamily: SANS }}
            >
              {product.description}
            </p>
            <div className="absolute right-[11px] top-[40px] flex h-[64px] w-[122px] flex-col items-center justify-center gap-0 bg-[#24231F]">
              <Folio color="#D6C8AD">PRESENT CODE</Folio>
              <p
                data-magazine-field="productPrice"
                data-magazine-product-index={index}
                className="text-[10px] tracking-[.4px] text-[#F4EFE5]"
                style={{ fontFamily: MONO }}
              >
                {product.price}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p
        data-magazine-field="quote"
        className="absolute left-[46px] top-[825px] w-[600px] text-[9px] leading-[1.35] text-[#5E5244]"
        style={{ fontFamily: SANS }}
      >
        {content.quote ??
          'One code per order. Not redeemable for cash. Full terms and exclusions at aquaedit.co/privilege.'}
      </p>
      <div className="absolute bottom-[10px] left-[46px]">
        <Footer color="#5E5244">
          {content.footer ?? 'AQUA / EDIT · PRIVILEGE · 08'}
        </Footer>
      </div>
    </Page>
  )
}

function AquaPage({ page }: { page: MagazinePage }) {
  const content = pageContent(page.content)
  const layout =
    content.layout ??
    [
      'aqua-cover',
      'aqua-monolith',
      'aqua-fittings',
      'aqua-shower',
      'aqua-field-notes',
      'aqua-history',
      'aqua-sources',
      'aqua-coupons',
    ][page.position] ??
    'aqua-monolith'
  if (layout === 'aqua-cover') return <Cover content={content} />
  if (layout === 'aqua-monolith') return <Monolith content={content} />
  if (layout === 'aqua-fittings') return <Fittings content={content} />
  if (layout === 'aqua-shower') return <ShowerGuide content={content} />
  if (layout === 'aqua-field-notes') return <FieldNotes content={content} />
  if (layout === 'aqua-history') return <History content={content} />
  if (layout === 'aqua-sources') return <Sources content={content} />
  return <Coupons content={content} />
}

function pagesFor(magazinePages: MagazinePage[] | undefined): JournalPage[] {
  if (magazinePages?.length)
    return magazinePages.map((page) => ({
      label: page.title ?? `Page ${page.position + 1}`,
      node: <AquaPage page={page} />,
    }))
  return [
    'Cover',
    'The Monolith Bath',
    'Brass Fittings',
    'Shower Guide',
    'Field Notes',
    'History',
    'Materials & Sources',
    'Privilege',
  ].map((title, position) => ({
    label: title,
    node: (
      <AquaPage
        page={{
          id: title,
          magazineId: '',
          position,
          pageType: position === 0 ? 'cover' : 'editorial',
          title,
          imageUrl: null,
          content: {
            layout: [
              'aqua-cover',
              'aqua-monolith',
              'aqua-fittings',
              'aqua-shower',
              'aqua-field-notes',
              'aqua-history',
              'aqua-sources',
              'aqua-coupons',
            ][position],
          },
        }}
      />
    ),
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
