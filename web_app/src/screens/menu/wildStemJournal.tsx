import type { MagazinePage } from '../../types'
import {
  DEFAULT_WILD_STEM_PRODUCTS,
  pageContent,
  type MagazinePageContent,
  type MagazineProductContent,
} from '../../components/magazine/templateCatalog'
import {
  MagazineViewer,
  type JournalPage,
  type MagazineEditSelection,
} from './pencilJournal'

const SERIF = '"Playfair Display", Georgia, serif'
const MONO = '"IBM Plex Mono", "Courier New", monospace'
const SANS = 'Inter, system-ui, sans-serif'

const COLORS = {
  cover: '#F1F0E8',
  paper: '#F7F4EE',
  studio: '#F5F3EC',
  green: '#304231',
  muted: '#65745E',
  paleGreen: '#6E855D',
  rose: '#A56B54',
  club: '#35523F',
  gold: '#D8C49A',
  plan: '#E7D7B8',
  care: '#E75B39',
  careInk: '#3A211A',
  white: '#FFFFFF',
}

const IMAGES = {
  cover: '/pencil/wild-stem/kStBV.png',
  arranging: '/pencil/wild-stem/BnzaL.png',
  club: '/pencil/wild-stem/t16Bs.png',
  flowerFood: '/pencil/wild-stem/bkO4U.png',
  vaseCleaner: '/pencil/wild-stem/QFGmC.png',
  foliageSpray: '/pencil/wild-stem/seEDM.png',
  parrotTulip: '/pencil/wild-stem/fnREW.png',
  ranunculus: '/pencil/wild-stem/glfRd.png',
  sweetPea: '/pencil/wild-stem/eqMXS.png',
  allium: '/pencil/wild-stem/rMjMd.png',
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
      style={{ background, color: COLORS.green }}
    >
      {children}
    </section>
  )
}

function Folio({
  children,
  color = COLORS.paleGreen,
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
  return content.imagePositions?.[index] || 'center'
}

function productsFor(
  content: MagazinePageContent,
  layout: string
): MagazineProductContent[] {
  const defaults = DEFAULT_WILD_STEM_PRODUCTS[layout] ?? []
  if (content.products !== undefined) return content.products
  const length = defaults.length
  return Array.from({ length }, (_, index) => ({
    ...(defaults[index] ?? { name: '', price: '', description: '' }),
    ...(content.products?.[index] ?? {}),
  }))
}

function FlowerCover({ content }: { content: MagazinePageContent }) {
  const image = content.images?.[0] ?? IMAGES.cover
  return (
    <Page background={COLORS.cover}>
      <Photo
        src={image}
        alt="A flower shop in spring"
        className="h-[580px]"
        position={imagePosition(content, 0)}
      />
      <div className="absolute left-[46px] top-10">
        <Folio color={COLORS.white} field>
          {content.eyebrow ?? 'WILD STEM STUDIO · VOLUME 01 · SPRING'}
        </Folio>
      </div>
      <h1
        data-magazine-field="headline"
        className="absolute left-[46px] top-[388px] w-[520px] text-[56px] leading-[.95] text-white"
        style={{ fontFamily: SERIF, fontWeight: 400 }}
      >
        {content.headline ?? 'A season in bloom.'}
      </h1>
      <p
        data-magazine-field="body"
        className="absolute left-[46px] top-[506px] w-[400px] text-[14px] leading-[1.35] text-white/85"
        style={{ fontFamily: SANS }}
      >
        {content.body ??
          'The stems, colours and quiet rituals of the flower shop.'}
      </p>
      <div className="absolute left-[46px] top-[640px]">
        <Folio>
          {
            'INSIDE — MARKET BUNCHES · FLOWERS FOR THE TABLE · NOTES FROM THE STUDIO'
          }
        </Folio>
      </div>
      <p
        data-magazine-field="quote"
        className="absolute left-[46px] top-[714px] w-[540px] text-[29px] italic leading-[1.1]"
        style={{ color: COLORS.green, fontFamily: SERIF }}
      >
        {content.quote ??
          '“There is always a flower for the moment you are having.”'}
      </p>
      <div className="absolute bottom-[42px] left-[46px]">
        <Footer>
          {content.footer ?? 'WILD STEM STUDIO · ORCHARD LANE · 01'}
        </Footer>
      </div>
    </Page>
  )
}

function SeasonalStems({ content }: { content: MagazinePageContent }) {
  const images = content.images ?? [
    IMAGES.parrotTulip,
    IMAGES.ranunculus,
    IMAGES.sweetPea,
    IMAGES.allium,
  ]
  const products = productsFor(content, 'seasonal-stems')
  return (
    <Page background={COLORS.paper}>
      <div className="absolute left-[46px] top-[42px]">
        <Folio field>{content.eyebrow ?? '02 · FROM THE MARKET'}</Folio>
      </div>
      <h2
        data-magazine-field="headline"
        className="absolute left-[46px] top-[70px] text-[43px] leading-none"
        style={{ color: COLORS.green, fontFamily: SERIF, fontWeight: 400 }}
      >
        {content.headline ?? 'The stems we love now.'}
      </h2>
      <p
        data-magazine-field="body"
        className="absolute left-[46px] top-[126px] w-[480px] text-[13px] leading-[1.4]"
        style={{ color: COLORS.muted, fontFamily: SANS }}
      >
        {content.body ??
          'Four seasonal characters for a generous bunch, a bedside glass, or a table that needs a little life.'}
      </p>
      <div className="absolute left-[46px] top-[214px] grid w-[608px] grid-cols-2 gap-x-[48px] gap-y-[44px]">
        {products.slice(0, 4).map((product, index) => (
          <div key={`${product.name}-${index}`} className="relative w-[280px]">
            <Photo
              src={images[index] || ''}
              alt={product.name}
              className="h-[210px]"
              position={imagePosition(content, index)}
            />
            <div className="absolute left-[18px] top-[168px] flex w-[244px] flex-col gap-px bg-[#F7F4EEE6] px-2 py-1.5">
              <p
                data-magazine-field="productName"
                data-magazine-product-index={index}
                className="text-[16px] leading-none"
                style={{ color: COLORS.green, fontFamily: SERIF }}
              >
                {product.name}
              </p>
              <p
                data-magazine-field="productPrice"
                data-magazine-product-index={index}
                className="text-[9px]"
                style={{ color: COLORS.muted, fontFamily: MONO }}
              >
                {product.price}
              </p>
            </div>
            <p
              data-magazine-field="productDescription"
              data-magazine-product-index={index}
              className="mt-[10px] text-[11px] leading-[1.35]"
              style={{ color: COLORS.muted, fontFamily: SANS }}
            >
              {product.description}
            </p>
          </div>
        ))}
      </div>
      <div className="absolute bottom-[42px] left-[46px]">
        <Footer>
          {content.footer ?? 'WILD STEM STUDIO · TODAY’S MARKET LIST · 02'}
        </Footer>
      </div>
    </Page>
  )
}

function ArrangingGuide({ content }: { content: MagazinePageContent }) {
  const defaultGuide = [
    '01  Give them a drink\nCut the stems and use cool, clean water.',
    '02  Begin with shape\nLet the tallest stems make a soft, open outline.',
    '03  Add the small things\nTuck in the scented stems near the end.',
  ].join('\n\n')
  const steps = (
    content.body ??
    defaultGuide
  ).split('\n\n')
  return (
    <Page background={COLORS.studio}>
      <div className="absolute left-[46px] top-[42px]">
        <Folio field>{content.eyebrow ?? '03 · FROM THE STUDIO'}</Folio>
      </div>
      <h2
        data-magazine-field="headline"
        className="absolute left-[46px] top-[72px] w-[530px] text-[45px] leading-none"
        style={{ color: COLORS.green, fontFamily: SERIF, fontWeight: 400 }}
      >
        {content.headline ?? 'A loose bunch, at home.'}
      </h2>
      <Photo
        src={content.images?.[0] ?? IMAGES.arranging}
        alt="Hands arranging a seasonal bouquet"
        className="absolute left-[46px] top-[164px] h-[220px] w-[608px]"
        position={imagePosition(content, 0)}
      />
      <p
        data-magazine-field="quote"
        className="absolute left-[46px] top-[414px] w-[500px] text-[21px] italic leading-[1.2]"
        style={{ color: '#52644E', fontFamily: SERIF }}
      >
        {content.quote ??
          'Nothing needs to be perfect. Start with a few stems you love, a clean vessel, and enough space to let the flowers lean.'}
      </p>
      <div
        data-magazine-field="body"
        className="absolute left-[46px] top-[520px] grid w-[608px] grid-cols-3 gap-[22px]"
      >
        {steps.slice(0, 3).map((step, index) => {
          const [title, copy = ''] = step.split('\n')
          return (
            <div key={index} className="flex w-[188px] flex-col gap-2">
              <span
                className="text-[11px] tracking-[1px]"
                style={{ color: COLORS.rose, fontFamily: MONO }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <span
                className="text-[19px] leading-none"
                style={{ color: COLORS.green, fontFamily: SERIF }}
              >
                {title.replace(/^\d+\s+/, '')}
              </span>
              <span
                className="text-[12px] leading-[1.35]"
                style={{ color: COLORS.muted, fontFamily: SANS }}
              >
                {copy}
              </span>
            </div>
          )
        })}
      </div>
      <div className="absolute bottom-[42px] left-[46px]">
        <Footer>
          {content.footer ?? 'WILD STEM STUDIO · ARRANGING NOTES · 03'}
        </Footer>
      </div>
    </Page>
  )
}

function FlowerClub({ content }: { content: MagazinePageContent }) {
  const product = productsFor(content, 'flower-club')[0] ?? {
    name: '',
    price: '',
    description: '',
  }
  return (
    <Page background={COLORS.club}>
      <Photo
        src={content.images?.[0] ?? IMAGES.club}
        alt="Seasonal flower bunches in a studio"
        className="absolute left-[46px] top-[46px] h-[330px] w-[608px]"
        position={imagePosition(content, 0)}
      />
      <div className="absolute left-[46px] top-[410px]">
        <Folio color={COLORS.gold} field>
          {content.eyebrow ?? '04 · THE WEEKLY STEM'}
        </Folio>
      </div>
      <h2
        data-magazine-field="headline"
        className="absolute left-[46px] top-[442px] w-[500px] text-[44px] leading-none text-white"
        style={{ fontFamily: SERIF, fontWeight: 400 }}
      >
        {content.headline ?? 'Flowers, right when you need them.'}
      </h2>
      <p
        data-magazine-field="body"
        className="absolute left-[46px] top-[552px] w-[430px] text-[13px] leading-[1.4] text-white/80"
        style={{ fontFamily: SANS }}
      >
        {content.body ??
          'A market-led bunch arrives every Friday: loose, seasonal and ready to make the whole week feel different.'}
      </p>
      <div className="absolute left-[46px] top-[680px] flex h-[105px] w-[608px] items-center justify-between bg-[#E7D7B8] px-[22px]">
        <div className="flex w-[400px] flex-col gap-1">
          <Folio color={COLORS.club}>{'THE WEEKLY STEM'}</Folio>
          <p
            data-magazine-field="productName"
            data-magazine-product-index={0}
            className="text-[23px] leading-none"
            style={{ color: COLORS.green, fontFamily: SERIF }}
          >
            {product.name}
          </p>
        </div>
        <p
          data-magazine-field="productPrice"
          data-magazine-product-index={0}
          className="text-[11px] uppercase tracking-[.6px]"
          style={{ color: COLORS.club, fontFamily: MONO }}
        >
          {product.price}
        </p>
      </div>
      <div className="absolute bottom-[42px] left-[46px]">
        <Footer color={COLORS.gold}>
          {content.footer ?? 'WILD STEM STUDIO · FLOWER CLUB · 04'}
        </Footer>
      </div>
    </Page>
  )
}

function CareShelf({ content }: { content: MagazinePageContent }) {
  const images = content.images ?? [
    IMAGES.flowerFood,
    IMAGES.vaseCleaner,
    IMAGES.foliageSpray,
  ]
  const products = productsFor(content, 'care-shelf')
  return (
    <Page background={COLORS.care}>
      <div className="absolute left-[46px] top-[42px]">
        <Folio color={COLORS.careInk} field>
          {content.eyebrow ?? '05 · THE CARE SHELF'}
        </Folio>
      </div>
      <h2
        data-magazine-field="headline"
        className="absolute left-[46px] top-[72px] text-[48px] leading-none text-[#FFF7EC]"
        style={{ fontFamily: SERIF, fontWeight: 400 }}
      >
        {content.headline ?? 'A little care.'}
      </h2>
      <p
        data-magazine-field="body"
        className="absolute left-[46px] top-[132px] w-[410px] text-[13px] leading-[1.4] text-[#FFF7ECD9]"
        style={{ fontFamily: SANS }}
      >
        {content.body ??
          'Three small things that help a bunch stay beautiful for longer.'}
      </p>
      <div className="absolute left-[46px] top-[244px] grid grid-cols-3 gap-[28px]">
        {products.slice(0, 3).map((product, index) => (
          <div key={`${product.name}-${index}`} className="w-[184px]">
            <Photo
              src={images[index] || ''}
              alt={product.name}
              className="h-[300px]"
              position={imagePosition(content, index)}
            />
            <p
              data-magazine-field="productName"
              data-magazine-product-index={index}
              className="mt-[18px] whitespace-pre-line text-[20px] leading-[1.05] text-[#FFF7EC]"
              style={{ fontFamily: SERIF }}
            >
              {product.name}
            </p>
            <p
              data-magazine-field="productPrice"
              data-magazine-product-index={index}
              className="text-[20px] leading-[1.05] text-[#FFF7EC]"
              style={{ fontFamily: SERIF }}
            >
              {product.price}
            </p>
          </div>
        ))}
      </div>
      <p
        data-magazine-field="quote"
        className="absolute left-[46px] top-[690px] w-[608px] text-[25px] leading-[1.15]"
        style={{ color: COLORS.careInk, fontFamily: SERIF }}
      >
        {content.quote ??
          'Fresh water, a clean vessel, and one thoughtful trim each day. Small rituals make flowers last.'}
      </p>
      <div className="absolute bottom-[42px] left-[46px]">
        <Footer color={COLORS.careInk}>
          {content.footer ?? 'WILD STEM STUDIO · CARE NOTES · 05'}
        </Footer>
      </div>
    </Page>
  )
}

function layoutForPage(page: MagazinePage, content: MagazinePageContent) {
  if (content.layout) return content.layout
  return (
    [
      'flower-cover',
      'seasonal-stems',
      'arranging-guide',
      'flower-club',
      'care-shelf',
    ][page.position] || 'seasonal-stems'
  )
}

function WildStemPage({ page }: { page: MagazinePage }) {
  const content = pageContent(page.content)
  const layout = layoutForPage(page, content)
  if (layout === 'flower-cover') return <FlowerCover content={content} />
  if (layout === 'seasonal-stems') return <SeasonalStems content={content} />
  if (layout === 'arranging-guide') return <ArrangingGuide content={content} />
  if (layout === 'flower-club') return <FlowerClub content={content} />
  return <CareShelf content={content} />
}

function pagesFor(magazinePages: MagazinePage[] | undefined): JournalPage[] {
  if (magazinePages?.length)
    return magazinePages.map((page) => ({
      label: page.title ?? `Page ${page.position + 1}`,
      node: <WildStemPage page={page} />,
    }))
  return [
    'Cover',
    'Seasonal Stems',
    'Arranging Guide',
    'Flower Club',
    'Care Shelf',
  ].map((title, position) => ({
    label: title,
    node: (
      <WildStemPage
        page={{
          id: title,
          magazineId: '',
          position,
          pageType: position === 0 ? 'cover' : 'editorial',
          title,
          imageUrl: null,
          content: { layout: layoutForPage({ position } as MagazinePage, {}) },
        }}
      />
    ),
  }))
}

export function WildStemJournal({
  magazineTitle,
  magazinePages,
}: {
  magazineTitle?: string
  magazinePages?: MagazinePage[]
}) {
  return (
    <MagazineViewer
      pages={pagesFor(magazinePages)}
      title={magazineTitle ?? 'Wild Stem Journal'}
    />
  )
}

export function WildStemEditorPreview({
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
