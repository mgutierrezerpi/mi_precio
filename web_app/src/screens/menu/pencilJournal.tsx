import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import type { DesignProps } from './designs'
import type { Item, MagazinePage } from '../../types'
import {
  DEFAULT_HOT_SHELF_PRODUCTS,
  DEFAULT_PANTRY_PRODUCTS,
  pageContent,
  type MagazinePageContent,
} from '../../components/magazine/templateCatalog'

const SERIF = '"Playfair Display", Georgia, serif'
const MONO = '"IBM Plex Mono", "Courier New", monospace'
const SANS = 'Inter, system-ui, sans-serif'

const COLORS = {
  paper: '#F7F2EA',
  cream: '#F3EDE2',
  pantry: '#FAF5EC',
  history: '#EEE5D7',
  ink: '#3A2A1D',
  body: '#70583F',
  rust: '#A76D3E',
  orange: '#E75B39',
  dark: '#3A2A1D',
  pale: '#D6B58B',
}

const IMAGES = {
  cover: '/pencil/cheese-factory/zLZId.png',
  board: '/pencil/cheese-factory/xnu2M.png',
  producer: '/pencil/cheese-factory/z9oXs.png',
  chilli: '/pencil/cheese-factory/BHUpJ.png',
  recipe: '/pencil/cheese-factory/bkM10.png',
  history: '/pencil/cheese-factory/fsiu6.png',
  table: '/pencil/cheese-factory/kofq2.png',
  gruyere: '/pencil/cheese-factory/WeIY4.png',
  figs: '/pencil/cheese-factory/E8p4K.png',
  jam: 'https://images.unsplash.com/photo-1785605121107-677f10a463f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  crackers:
    'https://images.unsplash.com/photo-1657299156528-2d50a9a6a444?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  sauce:
    'https://images.unsplash.com/photo-1757800499069-ace8d0d31ce8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  pepper:
    'https://images.unsplash.com/photo-1698557048177-a460bb415177?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  mustard:
    'https://images.unsplash.com/photo-1706111584143-4f41b25d1db7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
}

type MagazineItem = Pick<Item, 'id' | 'name' | 'price' | 'description'>

export type MagazineEditField =
  | 'eyebrow'
  | 'headline'
  | 'body'
  | 'quote'
  | 'footer'
  | 'productName'
  | 'productDescription'
  | 'productPrice'
  | 'image'

export type MagazineEditSelection = {
  field: MagazineEditField
  imageIndex?: number
  textIndex?: number
  productIndex?: number
}

const fallback = (
  name: string,
  price: string,
  description: string
): MagazineItem => ({
  id: name,
  name,
  price,
  description,
})

const amount = (item: MagazineItem) => {
  const value = Number.parseFloat(item.price)
  return Number.isNaN(value)
    ? `$${item.price}`
    : `$${value.toFixed(2).replace(/\.00$/, '')}`
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
      className={`mx-auto min-h-[900px] w-full max-w-[700px] overflow-hidden ${className}`}
      style={{ background, color: COLORS.ink }}
    >
      {children}
    </section>
  )
}

function PageInner({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <div className={`px-6 py-10 sm:px-[46px] ${className}`} style={style}>
      {children}
    </div>
  )
}

function Folio({
  children,
  color = COLORS.rust,
  field,
}: {
  children: React.ReactNode
  color?: string
  field?: 'eyebrow'
}) {
  return (
    <p
      data-magazine-field={field}
      className="text-[10px] uppercase tracking-[1.8px]"
      style={{ color, fontFamily: MONO }}
    >
      {children}
    </p>
  )
}

function Footer({
  children,
  color = COLORS.body,
  field,
}: {
  children: React.ReactNode
  color?: string
  field?: 'footer'
}) {
  return (
    <p
      data-magazine-field={field}
      className="text-[10px] uppercase tracking-[1.2px]"
      style={{ color, fontFamily: MONO }}
    >
      {children}
    </p>
  )
}

function Photo({
  src,
  className = '',
  alt = '',
  position = 'center',
}: {
  src: string
  className?: string
  alt?: string
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

function imagePosition(
  content: MagazinePageContent | undefined,
  index: number
) {
  return content?.imagePositions?.[index] || 'center'
}

function ProductPrice({
  item,
  addToCart,
  productIndex,
}: {
  item: MagazineItem
  addToCart: (id: string) => void
  productIndex?: number
}) {
  return (
    <button
      type="button"
      aria-label={`Add ${item.name} to cart`}
      onClick={() => addToCart(item.id)}
      data-magazine-field={
        productIndex === undefined ? undefined : 'productPrice'
      }
      data-magazine-product-index={productIndex}
      className="text-left"
      style={{ color: COLORS.ink, fontFamily: MONO, fontSize: 13 }}
    >
      {amount(item)}
    </button>
  )
}

function Cover({
  image = IMAGES.cover,
  content,
}: {
  image?: string
  content?: MagazinePageContent
}) {
  const eyebrow = content?.eyebrow ?? 'THE CHEESE FACTORY · ISSUE 01 · AUTUMN'
  const headline = content?.headline ?? 'A good table starts here.'
  const body =
    content?.body ??
    'Cheese, preserves, crackers and the small things that turn a meal into an occasion.'
  const quote =
    content?.quote ??
    '“The best food invites everyone to stay a little longer.”'
  const footer = content?.footer ?? 'FROMAGE & CO. · MARKET LANE · 01'
  return (
    <Page background={COLORS.cream} className="relative">
      <div className="relative h-[590px] w-full">
        <Photo
          src={image}
          alt="A cheese board set for an evening table"
          className="h-full"
          position={imagePosition(content, 0)}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/20" />
        <div className="absolute left-6 top-10 sm:left-[46px]">
          <Folio color={COLORS.cream} field="eyebrow">
            {eyebrow}
          </Folio>
        </div>
        <div className="absolute bottom-7 left-6 right-10 sm:left-[46px] sm:right-[100px]">
          <h1
            data-magazine-field="headline"
            className="text-[50px] leading-[.94] text-white sm:text-[62px]"
            style={{ fontFamily: SERIF, fontWeight: 400 }}
          >
            {headline}
          </h1>
          <p
            data-magazine-field="body"
            className="mt-4 max-w-[380px] text-[14px] leading-[1.35] text-white/85 sm:text-[16px]"
            style={{ fontFamily: SANS }}
          >
            {body}
          </p>
        </div>
      </div>
      <PageInner className="flex min-h-[310px] flex-col justify-between py-7 sm:py-[48px]">
        <Folio>
          INSIDE — THE PANTRY SHELF · FIERY LITTLE JARS · A BOARD FOR FOUR
        </Folio>
        <p
          data-magazine-field="quote"
          className="max-w-[550px] text-[29px] italic leading-[1.1] sm:text-[33px]"
          style={{ color: COLORS.ink, fontFamily: SERIF }}
        >
          {quote}
        </p>
        <Footer field="footer">{footer}</Footer>
      </PageInner>
    </Page>
  )
}

function Pantry({
  itemFor,
  addToCart,
  content,
}: {
  itemFor: (name: string, price: string, description: string) => MagazineItem
  addToCart: (id: string) => void
  content?: MagazinePageContent
}) {
  const images = content?.images ?? []
  const products = (content?.products ?? DEFAULT_PANTRY_PRODUCTS).map(
    (product, index) => ({
      ...(content?.products?.[index] ?? product),
      image:
        images[index] ?? [IMAGES.jam, IMAGES.crackers, IMAGES.sauce][index],
    })
  )
  const eyebrow = content?.eyebrow ?? '02 · THE PANTRY SHELF'
  const headline = content?.headline ?? 'The accomplices'
  const intro =
    content?.body?.split('\n\n')[0] ??
    'Good cheese asks for good company. Three things we always keep close at hand.'
  const footer = content?.footer ?? 'FROMAGE & CO. · PANTRY GOODS · 02'
  return (
    <Page background={COLORS.pantry}>
      <PageInner>
        <Folio field="eyebrow">{eyebrow}</Folio>
        <h2
          data-magazine-field="headline"
          className="mt-5 text-[44px] leading-none sm:text-[50px]"
          style={{ fontFamily: SERIF, fontWeight: 400 }}
        >
          {headline}
        </h2>
        <p
          data-magazine-field="body"
          className="mt-2 max-w-[480px] text-[14px] leading-[1.4] sm:text-[15px]"
          style={{ color: COLORS.body, fontFamily: SANS }}
        >
          {intro}
        </p>
        <div className="mt-16 flex flex-col gap-10 sm:mt-[68px] sm:gap-[40px]">
          {products.map(({ name, price, description, image }, index) => {
            const item = {
              ...itemFor(name, price, description),
              name,
              price,
              description,
            }
            return (
              <div
                key={name}
                className="grid grid-cols-[128px_1fr] gap-5 sm:grid-cols-[196px_1fr] sm:gap-[34px]"
              >
                <Photo
                  src={image}
                  alt={name}
                  className="h-[170px]"
                  position={imagePosition(content, index)}
                />
                <div className="flex flex-col items-start gap-2 pt-1 sm:pt-[18px]">
                  <Folio color={COLORS.rust}>THE PANTRY / 03</Folio>
                  <h3
                    data-magazine-field="productName"
                    data-magazine-product-index={index}
                    className="text-[30px] leading-none sm:text-[35px]"
                    style={{ fontFamily: SERIF, fontWeight: 400 }}
                  >
                    {name}
                  </h3>
                  <p
                    data-magazine-field="productDescription"
                    data-magazine-product-index={index}
                    className="text-[12px] leading-[1.35] sm:text-[14px]"
                    style={{ color: COLORS.body, fontFamily: SANS }}
                  >
                    {description}
                  </p>
                  <ProductPrice
                    item={item}
                    addToCart={addToCart}
                    productIndex={index}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-14 sm:mt-[66px]">
          <Footer field="footer">{footer}</Footer>
        </div>
      </PageInner>
    </Page>
  )
}

function Pairing({
  content,
  image = IMAGES.board,
}: {
  content?: MagazinePageContent
  image?: string
}) {
  const bodyParts = content?.body?.split('\n\n') ?? []
  const intro =
    bodyParts[0] ??
    (content?.body === undefined
      ? 'No rules, only a little balance: creamy, salty, bright, crisp and something with heat.'
      : '')
  const list =
    bodyParts.slice(1).join('\n\n') ||
    (content?.body === undefined
      ? '01  COASTAL BRIE + APRICOT JAM\n02  ALPINE GRUYÈRE + OLIVE OIL CRACKERS\n03  VALENÇAY + FERMENTED CHILLI SAUCE\n04  ADD FIGS, A KNIFE, A BOTTLE, FRIENDS'
      : '')
  return (
    <Page background={COLORS.dark} className="text-white">
      <PageInner>
        <Folio color="#E5BF8B" field="eyebrow">
          {content?.eyebrow ?? '03 · A BOARD FOR FOUR'}
        </Folio>
        <h2
          data-magazine-field="headline"
          className="mt-5 max-w-[480px] text-[44px] leading-[.96] sm:text-[52px]"
          style={{ fontFamily: SERIF, fontWeight: 400 }}
        >
          {content?.headline ?? 'Build a board that holds the room.'}
        </h2>
        <p
          data-magazine-field="body"
          className="mt-7 max-w-[430px] text-[14px] leading-[1.45] text-white/80 sm:text-[15px]"
          style={{ fontFamily: SANS }}
        >
          {intro}
        </p>
        <Photo
          src={image}
          alt="A cheese board with fruit, crackers and preserves"
          className="mt-14 h-[300px] sm:mt-[70px]"
          position={imagePosition(content, 0)}
        />
        <div
          data-magazine-field="body"
          className="mt-10 whitespace-pre-line text-[12px] leading-[2.1] tracking-[.2px] sm:text-[14px]"
          style={{ color: COLORS.cream, fontFamily: MONO }}
        >
          {list}
        </div>
        <div className="mt-20">
          <Footer color="#E5BF8B" field="footer">
            {content?.footer ?? 'FROMAGE &amp; CO. · A GOOD TABLE · 03'}
          </Footer>
        </div>
      </PageInner>
    </Page>
  )
}

function Producer({
  content,
  image = IMAGES.producer,
}: {
  content?: MagazinePageContent
  image?: string
}) {
  return (
    <Page background="#F4EEE3">
      <PageInner>
        <Folio field="eyebrow">
          {content?.eyebrow ?? '04 · PEOPLE OF THE PASTURE'}
        </Folio>
        <Photo
          src={image}
          alt="A cheesemaker holding a wheel in the cellar"
          className="mt-8 h-[360px]"
          position={imagePosition(content, 0)}
        />
        <h2
          data-magazine-field="headline"
          className="mt-10 max-w-[520px] text-[43px] leading-[.98] sm:text-[49px]"
          style={{ fontFamily: SERIF, fontWeight: 400 }}
        >
          {content?.headline ?? 'The person behind the wheel.'}
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-[395px_178px] sm:gap-[35px]">
          <p
            data-magazine-field="body"
            className="text-[14px] leading-[1.45] sm:text-[15px]"
            style={{ color: COLORS.body, fontFamily: SANS }}
          >
            {content?.body ??
              'Every Monday, Mara turns the milk from eight small farms into wheels that will wait quietly in the cellar for months. Her work is measured in patience, temperature and the exact sound a rind makes under her thumb.'}
          </p>
          <aside
            className="flex min-h-[160px] flex-col gap-2 bg-[#D6B58B] p-4"
            style={{ color: COLORS.ink }}
          >
            <span
              className="text-[38px] leading-none"
              style={{ fontFamily: SERIF }}
            >
              “
            </span>
            <p
              data-magazine-field="quote"
              className="text-[21px] italic leading-[1.1]"
              style={{ fontFamily: SERIF }}
            >
              {content?.quote ?? 'The cheese tells you what it needs.'}
            </p>
          </aside>
        </div>
        <div className="mt-24">
          <Footer field="footer">
            {content?.footer ?? 'FROMAGE & CO. · PORTRAIT SERIES · 04'}
          </Footer>
        </div>
      </PageInner>
    </Page>
  )
}

function HotShelf({
  itemFor,
  addToCart,
  content,
}: {
  itemFor: (name: string, price: string, description: string) => MagazineItem
  addToCart: (id: string) => void
  content?: MagazinePageContent
}) {
  const images = content?.images ?? []
  const products = (content?.products ?? DEFAULT_HOT_SHELF_PRODUCTS).map(
    (product, index) => ({
      ...(content?.products?.[index] ?? product),
      image:
        images[index] ?? [IMAGES.chilli, IMAGES.pepper, IMAGES.mustard][index],
    })
  )
  return (
    <Page background={COLORS.orange}>
      <PageInner>
        <Folio color={COLORS.dark} field="eyebrow">
          {content?.eyebrow ?? '05 · THE HOT SHELF'}
        </Folio>
        <h2
          data-magazine-field="headline"
          className="mt-5 text-[48px] leading-none sm:text-[54px]"
          style={{ color: '#FFF7EC', fontFamily: SERIF, fontWeight: 400 }}
        >
          {content?.headline ?? 'A little heat.'}
        </h2>
        <p
          data-magazine-field="body"
          className="mt-2 max-w-[410px] text-[14px] leading-[1.45] sm:text-[15px]"
          style={{ color: '#FFF7ECD9', fontFamily: SANS }}
        >
          {content?.body?.split('\n\n')[0] ??
            'Three bright jars for cheese, eggs, sandwiches and anything else that needs waking up.'}
        </p>
        <div className="mt-14 grid grid-cols-3 gap-3 sm:mt-[68px] sm:gap-[16px]">
          {products.map(({ name, price, description, image }, index) => {
            const item = {
              ...itemFor(description, price, description),
              name,
              price,
              description,
            }
            return (
              <div key={name}>
                <Photo
                  src={image}
                  alt={name}
                  className="h-[220px] sm:h-[300px]"
                  position={imagePosition(content, index)}
                />
                <p
                  data-magazine-field="productName"
                  data-magazine-product-index={index}
                  className="mt-3 text-[12px] leading-[1.1] sm:text-[14px]"
                  style={{ color: '#FFF7EC', fontFamily: SERIF }}
                >
                  {name}
                </p>
                <ProductPrice
                  item={item}
                  addToCart={addToCart}
                  productIndex={index}
                />
              </div>
            )
          })}
        </div>
        <p
          data-magazine-field="body"
          className="mt-14 max-w-[610px] text-[25px] leading-[1.15] sm:mt-[68px] sm:text-[30px]"
          style={{ color: COLORS.dark, fontFamily: SERIF }}
        >
          {content?.body?.split('\n\n').slice(1).join('\n\n') ||
            (content?.body === undefined
              ? 'Try the chilli crisp with creamy brie. The roasted pepper spread belongs under a slice of gruyère. Mustard is non-negotiable.'
              : '')}
        </p>
        <div className="mt-20">
          <Footer color={COLORS.dark} field="footer">
            {content?.footer ?? 'FROMAGE & CO. · PANTRY GOODS · 05'}
          </Footer>
        </div>
      </PageInner>
    </Page>
  )
}

function Recipe({
  content,
  image = IMAGES.recipe,
}: {
  content?: MagazinePageContent
  image?: string
}) {
  const defaultSteps = [
    ['01', 'Butter both sides of good sourdough.'],
    ['02', 'Add gruyère, brie and a spoonful of apricot jam.'],
    ['03', 'Press in a hot pan until golden, molten and unreasonably good.'],
  ]
  const steps =
    content?.body !== undefined
      ? content.body
          .split('\n\n')
          .filter(Boolean)
          .map((step, index) => {
            const match = step.match(/^(\d{2})\s+(.*)$/s)
            return [
              match?.[1] ?? String(index + 1).padStart(2, '0'),
              match?.[2] ?? step,
            ]
          })
      : defaultSteps
  return (
    <Page background="#F6F1E9">
      <PageInner>
        <Folio field="eyebrow">
          {content?.eyebrow ?? '06 · A SIMPLE RECIPE'}
        </Folio>
        <h2
          data-magazine-field="headline"
          className="mt-5 max-w-[480px] text-[42px] leading-[.98] sm:text-[50px]"
          style={{ fontFamily: SERIF, fontWeight: 400 }}
        >
          {content?.headline ?? 'Grilled cheese, with an excellent jam.'}
        </h2>
        <Photo
          src={image}
          alt="Grilled cheese sandwich with apricot jam"
          className="mt-14 h-[300px] sm:mt-[70px] sm:h-[310px]"
          position={imagePosition(content, 0)}
        />
        <div className="mt-10 grid grid-cols-3 gap-4 sm:mt-[50px] sm:gap-[22px]">
          {steps.map(([number, copy]) => (
            <div key={number} className="flex flex-col gap-3">
              <Folio>{number}</Folio>
              <p
                data-magazine-field="body"
                className="text-[12px] leading-[1.35]"
                style={{ color: COLORS.body, fontFamily: SANS }}
              >
                {copy}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-32">
          <Footer field="footer">
            {content?.footer ?? 'FROMAGE & CO. · FROM THE KITCHEN · 06'}
          </Footer>
        </div>
      </PageInner>
    </Page>
  )
}

function History({
  content,
  image = IMAGES.history,
}: {
  content?: MagazinePageContent
  image?: string
}) {
  const bodyParts = content?.body?.split('\n\n') ?? []
  const intro =
    bodyParts[0] ??
    (content?.body === undefined
      ? 'In 1987, Clara and Émile found a damp cellar beneath a grocer’s shop and a handful of wheels worth waiting for. They borrowed a table, opened the door, and began cutting cheese for anyone who walked in.'
      : '')
  const timeline = bodyParts
    .slice(1)
    .flatMap((part) => part.split('\n'))
    .map((line) => {
      const match = line.match(/^(\d{4})\s+[—-]\s+(.*)$/)
      return match ? [match[1], match[2]] : null
    })
    .filter((item): item is [string, string] => Boolean(item))
  const defaultTimeline = [
    ['1987', 'A cellar, six wheels and a hand-painted sign.'],
    ['2002', 'The pantry shelf arrives: jam, crackers and mustard.'],
    ['2024', 'A longer table, and many more reasons to gather.'],
  ]
  return (
    <Page background={COLORS.history}>
      <PageInner>
        <Folio field="eyebrow">{content?.eyebrow ?? '07 · OUR HISTORY'}</Folio>
        <h2
          data-magazine-field="headline"
          className="mt-5 max-w-[560px] text-[44px] leading-[.98] sm:text-[52px]"
          style={{ fontFamily: SERIF, fontWeight: 400 }}
        >
          {content?.headline ?? 'From a borrowed cellar to a long table.'}
        </h2>
        <div className="mt-14 grid grid-cols-1 gap-8 sm:mt-[70px] sm:grid-cols-[390px_184px] sm:gap-[34px]">
          <div>
            <Photo
              src={image}
              alt="The first cellar filled with cheese"
              className="h-[322px]"
              position={imagePosition(content, 0)}
            />
            <Folio color={COLORS.body}>
              THE FIRST CELLAR, MARKET LANE · 1987
            </Folio>
          </div>
          <div className="pt-1">
            <Folio>THE BEGINNING</Folio>
            <p
              data-magazine-field="body"
              className="mt-3 text-[13px] leading-[1.45] sm:text-[14px]"
              style={{ color: COLORS.body, fontFamily: SANS }}
            >
              {intro}
            </p>
          </div>
        </div>
        <div className="mt-20 grid grid-cols-3 gap-5 sm:mt-[82px] sm:gap-[20px]">
          {(content?.body === undefined && !timeline.length
            ? defaultTimeline
            : timeline
          ).map(([year, copy]) => (
            <div key={year}>
              <p
                className="text-[27px]"
                style={{ color: COLORS.rust, fontFamily: SERIF }}
              >
                {year}
              </p>
              <p
                data-magazine-field="body"
                className="mt-2 text-[12px] leading-[1.35]"
                style={{ color: COLORS.body, fontFamily: SANS }}
              >
                {copy}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-24">
          <Footer field="footer">
            {content?.footer ?? 'FROMAGE & CO. · THE STORY SO FAR · 07'}
          </Footer>
        </div>
      </PageInner>
    </Page>
  )
}

function LongForm({
  content,
  images = [],
}: {
  content?: MagazinePageContent
  images?: string[]
}) {
  const body =
    content?.body ??
    'There is a point in every service when the room changes. The door is still open, the wine is still being poured, but suddenly the table begins to make sense. Someone passes the bread. A knife finds the soft centre of a ripe cheese. The conversation gathers itself around the small, practical pleasure of sharing.'
  return (
    <Page background={COLORS.paper} className="min-h-[1000px]">
      <PageInner className="py-9 sm:py-[38px]">
        <Folio field="eyebrow">
          {content?.eyebrow ?? '08 · THE LONG TABLE'}
        </Folio>
        <Photo
          src={images[0] || IMAGES.table}
          alt="A table prepared before guests arrive"
          className="mt-6 h-[156px] max-w-[300px]"
          position={imagePosition(content, 0)}
        />
        <Folio color={COLORS.body}>LUNCH, BEFORE THE FIRST GUEST ARRIVES</Folio>
        <h2
          data-magazine-field="headline"
          className="mt-9 max-w-[470px] text-[44px] leading-none sm:text-[50px]"
          style={{ fontFamily: SERIF, fontWeight: 400 }}
        >
          {content?.headline ?? 'Why we still set the table.'}
        </h2>
        <p
          data-magazine-field="quote"
          className="mt-8 max-w-[410px] text-[21px] italic leading-[1.2] sm:text-[24px]"
          style={{ color: COLORS.rust, fontFamily: SERIF }}
        >
          {content?.quote ??
            'A meal is more than a collection of plates. It is an invitation to slow the evening down.'}
        </p>
        <Folio color={COLORS.body}>
          WORDS BY CLARA VOSS · PHOTOGRAPHS BY THE MARKET LANE KITCHEN
        </Folio>
        <div className="mt-7 grid grid-cols-1 gap-8 sm:grid-cols-[355px_216px] sm:gap-[37px]">
          <p
            data-magazine-field="body"
            className="whitespace-pre-line text-[14px] leading-[1.46] sm:text-[15px]"
            style={{ color: '#4E4038', fontFamily: SANS }}
          >
            {body}
          </p>
          <div className="flex flex-col gap-8">
            <div>
              <Photo
                src={images[1] || IMAGES.gruyere}
                alt="A wedge of alpine gruyère"
                className="h-[162px]"
                position={imagePosition(content, 1)}
              />
              <Footer>A WEDGE OF ALPINE GRUYÈRE, WAITING FOR THE KNIFE.</Footer>
            </div>
            <div>
              <Photo
                src={images[2] || IMAGES.figs}
                alt="The last figs of the season"
                className="h-[144px]"
                position={imagePosition(content, 2)}
              />
              <Footer>THE LAST FIGS OF THE SEASON.</Footer>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <Footer field="footer">
            {content?.footer ?? 'FROMAGE & CO. · THE LONG TABLE · 08'}
          </Footer>
        </div>
      </PageInner>
    </Page>
  )
}

function OneImage({
  content,
  image = IMAGES.table,
}: {
  content?: MagazinePageContent
  image?: string
}) {
  return (
    <Page background={COLORS.paper} className="min-h-[1000px]">
      <PageInner className="py-9 sm:py-[38px]">
        <Folio field="eyebrow">
          {content?.eyebrow ?? '09 · NOTES FROM THE COUNTER'}
        </Folio>
        <Photo
          src={image}
          alt="A quiet morning at the counter"
          className="mt-6 h-[230px]"
          position={imagePosition(content, 0)}
        />
        <Folio color={COLORS.body}>A QUIET MORNING AT THE COUNTER</Folio>
        <h2
          data-magazine-field="headline"
          className="mt-8 max-w-[470px] text-[44px] leading-none sm:text-[50px]"
          style={{ fontFamily: SERIF, fontWeight: 400 }}
        >
          {content?.headline ?? 'The small art of choosing well.'}
        </h2>
        <p
          data-magazine-field="quote"
          className="mt-8 max-w-[520px] text-[21px] italic leading-[1.2] sm:text-[24px]"
          style={{ color: COLORS.rust, fontFamily: SERIF }}
        >
          {content?.quote ??
            'A good shop is not a place that sells you everything. It is a place that helps you notice what is worth taking home.'}
        </p>
        <Folio color={COLORS.body}>
          WORDS BY CLARA VOSS · THE CHEESE FACTORY JOURNAL
        </Folio>
        <p
          data-magazine-field="body"
          className="mt-8 whitespace-pre-line text-[14px] leading-[1.46] sm:text-[15px]"
          style={{ color: '#4E4038', fontFamily: SANS }}
        >
          {content?.body ??
            'There are choices we make quickly, and then there are the ones that become part of how we live. At the counter, we see both. Some people come in for the familiar wedge they have bought every Friday for years. Others pause, ask a question, and leave with something they had never imagined bringing to their table.\n\nThe pleasure of a small food shop lies in that second moment. It is the gentle encouragement to try a cheese that needs a little room to breathe, a jam that tastes of a season you thought had passed, or a cracker so good it should never be treated as an afterthought.\n\nChoosing well is not about finding the rarest thing on the shelf. It is about finding the thing that will make dinner easier, kinder, and perhaps more memorable. A few pieces, a good loaf, something bright in a jar — and suddenly there is a table to gather around.'}
        </p>
        <div className="mt-10">
          <Footer field="footer">
            {content?.footer ?? 'FROMAGE & CO. · NOTES FROM THE COUNTER · 09'}
          </Footer>
        </div>
      </PageInner>
    </Page>
  )
}

export type JournalPage = {
  label: string
  node: React.ReactNode
}

function MagazineArrow({
  direction,
  disabled,
  onClick,
  hideOnMobile = false,
}: {
  direction: 'previous' | 'next'
  disabled: boolean
  onClick: () => void
  hideOnMobile?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={direction === 'previous' ? 'Previous page' : 'Next page'}
      disabled={disabled}
      onClick={onClick}
      className={`absolute top-1/2 z-10 h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#F3EDE2]/20 bg-[#3A2A1D]/85 text-[#F3EDE2] shadow-lg transition hover:bg-[#3A2A1D] disabled:pointer-events-none disabled:opacity-20 sm:flex sm:h-14 sm:w-14 ${hideOnMobile ? 'hidden' : 'flex'}`}
      style={{
        [direction === 'previous' ? 'left' : 'right']:
          'max(12px, calc((100% - 820px) / 2))',
      }}
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {direction === 'previous' ? (
          <path d="m14.5 5-7 7 7 7" />
        ) : (
          <path d="m9.5 5 7 7-7 7" />
        )}
      </svg>
    </button>
  )
}

function MagazineLensControl({
  active,
  onToggle,
}: {
  active: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      aria-label={active ? 'Turn off magnifier' : 'Turn on magnifier'}
      aria-pressed={active}
      onClick={onToggle}
      className={`flex h-9 items-center gap-1.5 rounded-full border px-3 shadow-lg transition ${active ? 'border-[#D6B58B] bg-[#D6B58B] text-[#3A2A1D]' : 'border-[#F3EDE2]/15 bg-[#3A2A1D]/90 text-[#F3EDE2]'}`}
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <circle cx="10.8" cy="10.8" r="6.3" />
        <path d="m15.5 15.5 5 5" strokeLinecap="round" />
      </svg>
      <span
        className="text-[9px] uppercase tracking-[1.2px]"
        style={{ fontFamily: MONO }}
      >
        {active ? 'Lens on' : 'Lens'}
      </span>
    </button>
  )
}

function PencilLayoutForPage(page: MagazinePage, content: MagazinePageContent) {
  if (content.layout) return content.layout
  if (page.position === 0 || page.pageType === 'cover') return 'cover'
  if (page.position === 1) return 'pantry'
  if (page.position === 2) return 'pairing'
  if (page.pageType === 'profile') return 'profile'
  if (page.pageType === 'catalog') return 'hot-shelf'
  if (page.pageType === 'recipe') return 'recipe'
  if (page.pageType === 'history') return 'history'
  if (page.position === 7) return 'long-form'
  if (page.pageType === 'notes') return 'one-image'
  return 'editorial'
}

function EditableJournalPage({
  page,
  coverImage,
  itemFor,
  addToCart,
}: {
  page: MagazinePage
  coverImage?: string | null
  itemFor: (name: string, price: string, description: string) => MagazineItem
  addToCart: (id: string) => void
}) {
  const content = pageContent(page.content)
  const images = content.images ?? (page.imageUrl ? [page.imageUrl] : [])
  const image = images[0] ?? coverImage ?? undefined
  const layout = PencilLayoutForPage(page, content)

  if (layout === 'cover') return <Cover image={image} content={content} />
  if (layout === 'pantry')
    return <Pantry itemFor={itemFor} addToCart={addToCart} content={content} />
  if (layout === 'pairing')
    return <Pairing image={image || IMAGES.board} content={content} />
  if (layout === 'profile')
    return <Producer image={image || IMAGES.producer} content={content} />
  if (layout === 'hot-shelf')
    return (
      <HotShelf itemFor={itemFor} addToCart={addToCart} content={content} />
    )
  if (layout === 'recipe')
    return <Recipe image={image || IMAGES.recipe} content={content} />
  if (layout === 'history')
    return <History image={image || IMAGES.history} content={content} />
  if (layout === 'long-form')
    return <LongForm images={images} content={content} />
  if (layout === 'one-image')
    return <OneImage image={image || IMAGES.table} content={content} />
  return <EditableEditorialPage page={page} content={content} images={images} />
}

function EditableEditorialPage({
  page,
  content,
  images,
}: {
  page: MagazinePage
  content: MagazinePageContent
  images: string[]
}) {
  const fallbackImages: Record<string, string> = {
    cover: IMAGES.cover,
    editorial: IMAGES.board,
    profile: IMAGES.producer,
    catalog: IMAGES.chilli,
    recipe: IMAGES.recipe,
    history: IMAGES.history,
    notes: IMAGES.table,
  }
  const image = page.imageUrl ?? fallbackImages[page.pageType]
  const displayImages =
    content.images !== undefined
      ? content.images
      : images.length
        ? images
        : image
          ? [image]
          : []
  const eyebrow =
    content.eyebrow ??
    `${String(page.position + 1).padStart(2, '0')} · ${page.pageType}`
  const headline = content.headline ?? page.title ?? 'Editorial page'
  const body = content.body ?? content.copy ?? ''
  const quote = content.quote ?? ''
  const background =
    page.pageType === 'profile'
      ? COLORS.history
      : page.pageType === 'catalog'
        ? COLORS.orange
        : COLORS.paper
  return (
    <Page background={background}>
      <PageInner>
        <Folio
          field="eyebrow"
          color={page.pageType === 'catalog' ? COLORS.dark : COLORS.rust}
        >
          {eyebrow}
        </Folio>
        {displayImages.length > 0 && (
          <div
            className={`mt-6 grid gap-3 ${displayImages.length > 1 ? 'grid-cols-2' : ''}`}
          >
            {displayImages.slice(0, 3).map((source, index) => (
              <Photo
                key={`${source}-${index}`}
                src={source}
                alt={headline}
                className="max-h-[350px]"
                position={imagePosition(content, index)}
              />
            ))}
          </div>
        )}
        <h2
          data-magazine-field="headline"
          className="mt-8 max-w-[580px] text-[44px] leading-[.98] sm:text-[54px]"
          style={{ fontFamily: SERIF, fontWeight: 400 }}
        >
          {headline}
        </h2>
        <p
          data-magazine-field="quote"
          className="mt-6 min-h-[1.2em] max-w-[560px] text-[22px] italic leading-[1.2] sm:text-[26px]"
          style={{ color: COLORS.rust, fontFamily: SERIF }}
        >
          {quote}
        </p>
        <p
          data-magazine-field="body"
          className="mt-8 min-h-[1.5em] max-w-[580px] whitespace-pre-wrap text-[16px] leading-[1.5] sm:text-[18px]"
          style={{
            color: page.pageType === 'catalog' ? COLORS.dark : COLORS.body,
            fontFamily: SANS,
          }}
        >
          {body}
        </p>
        <div className="mt-28">
          <Footer
            field="footer"
            color={page.pageType === 'catalog' ? COLORS.dark : COLORS.body}
          >
            {content.footer ??
              `FROMAGE & CO. · ${headline} · ${String(page.position + 1).padStart(2, '0')}`}
          </Footer>
        </div>
      </PageInner>
    </Page>
  )
}

export function MagazineViewer({
  pages,
  title,
  footer,
  theme,
  hideArrowsOnMobile = false,
  mobileSwipeHint = false,
  pageIndex,
  editorMode = false,
  embedded = false,
  onSelect,
  onPageChange,
  inlineEditing,
  inlineValue = '',
  onInlineChange,
  onInlineCommit,
}: {
  pages: JournalPage[]
  title: string
  footer?: React.ReactNode
  theme?: 'cafecitos'
  hideArrowsOnMobile?: boolean
  mobileSwipeHint?: boolean
  pageIndex?: number
  editorMode?: boolean
  embedded?: boolean
  onSelect?: (selection: MagazineEditSelection) => void
  onPageChange?: (index: number) => void
  inlineEditing?: MagazineEditSelection | null
  inlineValue?: string
  onInlineChange?: (value: string) => void
  onInlineCommit?: () => void
}) {
  const [currentPage, setCurrentPage] = useState(0)
  const [pageHeight, setPageHeight] = useState(900)
  const [pageWidth, setPageWidth] = useState(700)
  const [pageScale, setPageScale] = useState(1)
  const [lensActive, setLensActive] = useState(false)
  const [showSwipeOnboarding, setShowSwipeOnboarding] = useState(
    mobileSwipeHint
  )
  const [lensPosition, setLensPosition] = useState<{
    x: number
    y: number
  } | null>(null)
  const lensScale = 2
  const lensSize = 220
  const touchStartX = useRef<number | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const inlineInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const [inlineRect, setInlineRect] = useState<{
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
  } | null>(null)

  useEffect(() => {
    if (!mobileSwipeHint) return
    const timer = window.setTimeout(() => setShowSwipeOnboarding(false), 3400)
    return () => window.clearTimeout(timer)
  }, [mobileSwipeHint])

  // The embedded admin preview controls the viewer page from its header dots.
  useEffect(() => {
    if (pageIndex === undefined) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(Math.max(0, Math.min(pages.length - 1, pageIndex)))
  }, [pageIndex, pages.length])

  const editorTargets = (root: HTMLElement, field: MagazineEditField) => {
    if (field === 'image')
      return Array.from(
        root.querySelectorAll<HTMLElement>('img[data-magazine-field="image"]')
      )
    if (field === 'eyebrow' || field === 'footer')
      return Array.from(
        root.querySelectorAll<HTMLElement>(`[data-magazine-field="${field}"]`)
      )
    if (field === 'headline')
      return Array.from(
        root.querySelectorAll<HTMLElement>('[data-magazine-field="headline"]')
      )
    if (field === 'quote')
      return Array.from(
        root.querySelectorAll<HTMLElement>('[data-magazine-field="quote"]')
      )
    if (
      field === 'productName' ||
      field === 'productDescription' ||
      field === 'productPrice'
    )
      return Array.from(
        root.querySelectorAll<HTMLElement>(`[data-magazine-field="${field}"]`)
      )
    return Array.from(
      root.querySelectorAll<HTMLElement>('[data-magazine-field="body"]')
    )
  }

  const goTo = useCallback(
    (page: number) => {
      const next = Math.max(0, Math.min(pages.length - 1, page))
      setCurrentPage(next)
      onPageChange?.(next)
    },
    [onPageChange, pages.length]
  )

  const selectEditorTarget = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!editorMode || !onSelect) return
    const target = event.target as HTMLElement
    const element = target.closest<HTMLElement>('[data-magazine-field]')
    if (!element || !event.currentTarget.contains(element)) return
    const field = element.dataset.magazineField as MagazineEditField | undefined
    if (!field) return
    if (field === 'image') {
      const images = Array.from(
        event.currentTarget.querySelectorAll('img[data-magazine-field="image"]')
      )
      onSelect({
        field,
        imageIndex: Math.max(0, images.indexOf(element as HTMLImageElement)),
      })
      return
    }
    const targets = editorTargets(event.currentTarget, field)
    const productIndex = element.dataset.magazineProductIndex
    onSelect({
      field,
      textIndex: Math.max(0, targets.indexOf(element)),
      ...(productIndex === undefined
        ? {}
        : { productIndex: Number(productIndex) }),
    })
  }

  // The editor overlay must be measured after the rendered page has laid out.
  useLayoutEffect(() => {
    const root = canvasRef.current
    if (
      !root ||
      !editorMode ||
      !inlineEditing ||
      inlineEditing.field === 'image'
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInlineRect(null)
      return
    }
    const target = editorTargets(root, inlineEditing.field)[
      inlineEditing.textIndex ?? 0
    ]
    if (!target) {
      setInlineRect(null)
      return
    }
    const rootRect = root.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const computed = window.getComputedStyle(target)
    const scale = pageScale || 1
    const left = (targetRect.left - rootRect.left) / scale
    const targetWidth = targetRect.width / scale
    const minimumScreenWidth =
      inlineEditing.field === 'productPrice'
        ? 150
        : inlineEditing.field === 'productName'
          ? 220
          : inlineEditing.field === 'productDescription'
            ? 280
            : inlineEditing.field === 'eyebrow' ||
                inlineEditing.field === 'footer'
              ? 220
              : 180
    const minimumWidth = minimumScreenWidth / scale
    const pageWidth = rootRect.width / scale
    const width = Math.min(Math.max(targetWidth, minimumWidth), pageWidth - 8)
    const adjustedLeft = Math.min(left, pageWidth - width - 8)
    const previousVisibility = target.style.visibility
    target.style.visibility = 'hidden'
    setInlineRect({
      left: Math.max(0, adjustedLeft),
      top: (targetRect.top - rootRect.top) / scale,
      width,
      height: Math.max(targetRect.height / scale, 32),
      fontFamily: computed.fontFamily,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      lineHeight: computed.lineHeight,
      color: computed.color,
      textAlign: computed.textAlign as CSSProperties['textAlign'],
    })
    return () => {
      target.style.visibility = previousVisibility
    }
  }, [currentPage, editorMode, inlineEditing, inlineValue, pageScale])

  useEffect(() => {
    if (inlineRect) {
      inlineInputRef.current?.focus()
    }
  }, [inlineRect])

  useEffect(() => {
    const shiftPage = (delta: number) => {
      goTo(currentPage + delta)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      if (
        target instanceof HTMLElement &&
        target.closest(
          'button, a, input, textarea, select, [contenteditable="true"], [role="button"]'
        )
      )
        return
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault()
        shiftPage(-1)
      }
      if (
        event.key === 'ArrowRight' ||
        event.key === 'PageDown' ||
        event.key === ' '
      ) {
        event.preventDefault()
        shiftPage(1)
      }
      if (event.key === 'Home') {
        event.preventDefault()
        goTo(0)
      }
      if (event.key === 'End') {
        event.preventDefault()
        goTo(pages.length - 1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [currentPage, pages.length, goTo])

  useLayoutEffect(() => {
    const fitPage = () => {
      const stage = stageRef.current
      const page = pageRef.current
      if (!stage || !page) return
      const naturalHeight = page.offsetHeight
      const availableHeight = stage.clientHeight - 16
      const availableWidth = stage.clientWidth - 16
      setPageWidth(page.offsetWidth)
      setPageHeight(naturalHeight)
      setPageScale(
        Math.min(
          1,
          availableHeight / naturalHeight,
          availableWidth / page.offsetWidth
        )
      )
    }
    const observer = new ResizeObserver(fitPage)
    if (stageRef.current) observer.observe(stageRef.current)
    if (pageRef.current) observer.observe(pageRef.current)
    fitPage()
    return () => observer.disconnect()
  }, [currentPage])

  const updateLensPosition = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!lensActive) return
    const frame = event.currentTarget.getBoundingClientRect()
    const radius = lensSize / 2
    setLensPosition({
      x: Math.max(
        radius,
        Math.min(frame.width - radius, event.clientX - frame.left)
      ),
      y: Math.max(
        radius,
        Math.min(frame.height - radius, event.clientY - frame.top)
      ),
    })
  }

  return (
    <div
      className={`flex ${embedded ? 'h-full min-h-[640px] rounded-2xl' : 'h-[100dvh]'} flex-col overflow-hidden bg-[#241B15] text-[#F3EDE2]`}
      data-magazine-theme={theme}
    >
      {!embedded && (
        <div className="z-20 shrink-0 border-b border-[#F3EDE2]/10 bg-[#241B15] px-5 py-4 sm:px-8">
          <div className="mx-auto flex w-full max-w-[820px] items-center justify-between gap-3">
            <p
              className="max-w-[125px] truncate text-[9px] uppercase tracking-[2px] text-[#D6B58B] sm:max-w-none"
              style={{ fontFamily: MONO }}
            >
              {title}
            </p>
            <div
              className="flex max-w-[42vw] items-center justify-start gap-1.5 overflow-x-auto py-1 [scrollbar-width:none] md:max-w-none md:justify-center md:overflow-visible"
              aria-label="Magazine pages"
            >
              {pages.map((page, index) => (
                <button
                  key={page.label}
                  type="button"
                  aria-label={`Go to ${page.label}`}
                  aria-current={index === currentPage ? 'page' : undefined}
                  onClick={() => goTo(index)}
                  className={`h-1.5 rounded-full transition-all ${index === currentPage ? 'w-6 bg-[#D6B58B]' : 'w-1.5 bg-[#F3EDE2]/30 hover:bg-[#F3EDE2]/60'}`}
                />
              ))}
            </div>
            <p
              className="text-[10px] uppercase tracking-[1.5px] text-[#F3EDE2]/80"
              style={{ fontFamily: MONO }}
            >
              {String(currentPage + 1).padStart(2, '0')} /{' '}
              {String(pages.length).padStart(2, '0')}
            </p>
          </div>
        </div>
      )}

      <div
        ref={stageRef}
        className="relative min-h-0 flex-1 px-2 py-1 sm:px-6 sm:py-2"
        style={{ overflow: 'hidden' }}
        onTouchStart={(event) => {
          if (!lensActive)
            touchStartX.current = event.changedTouches[0]?.clientX ?? null
        }}
        onTouchEnd={(event) => {
          if (lensActive) return
          const start = touchStartX.current
          const end = event.changedTouches[0]?.clientX
          touchStartX.current = null
          if (start === null || end === undefined || Math.abs(end - start) < 48)
            return
          setShowSwipeOnboarding(false)
          goTo(currentPage + (end < start ? 1 : -1))
        }}
      >
        <MagazineArrow
          direction="previous"
          disabled={currentPage === 0}
          onClick={() => goTo(currentPage - 1)}
          hideOnMobile={hideArrowsOnMobile}
        />
        <div className="flex h-full w-full items-center justify-center">
          <div
            className="relative w-full max-w-[700px]"
            style={{
              width: `${pageWidth * pageScale}px`,
              height: `${pageHeight * pageScale}px`,
              touchAction: lensActive ? 'none' : 'pan-y',
            }}
            onPointerEnter={updateLensPosition}
            onPointerMove={updateLensPosition}
            onPointerDown={(event) => {
              if (!lensActive) return
              event.preventDefault()
              event.currentTarget.setPointerCapture(event.pointerId)
              updateLensPosition(event)
            }}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId))
                event.currentTarget.releasePointerCapture(event.pointerId)
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === 'mouse') setLensPosition(null)
            }}
          >
            <div
              ref={pageRef}
              className="origin-top-left shadow-[0_12px_32px_rgba(0,0,0,.16)]"
              style={{
                width: 'var(--magazine-page-width, 700px)',
                transform: `scale(${pageScale})`,
              }}
            >
              <div
                ref={canvasRef}
                key={currentPage}
                className={`relative animate-[journal-page-in_.32s_ease-out] ${editorMode ? 'magazine-editor-canvas' : ''}`}
                onClick={selectEditorTarget}
              >
                {pages[currentPage].node}
                {editorMode &&
                  inlineRect &&
                  inlineEditing &&
                  inlineEditing.field !== 'image' &&
                  onInlineChange &&
                  onInlineCommit &&
                  (inlineEditing.field === 'body' ||
                  inlineEditing.field === 'quote' ||
                  inlineEditing.field === 'productDescription' ? (
                    <textarea
                      ref={
                        inlineInputRef as React.RefObject<HTMLTextAreaElement>
                      }
                      value={inlineValue}
                      onChange={(event) => onInlineChange(event.target.value)}
                      onBlur={onInlineCommit}
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Escape' ||
                          ((event.metaKey || event.ctrlKey) &&
                            event.key === 'Enter')
                        )
                          onInlineCommit()
                      }}
                      className="absolute z-30 resize-none rounded-sm border-2 border-[#D6B58B] bg-[#F7F2EA] px-1.5 py-1 text-[#3A2A1D] outline-none"
                      style={{
                        left: inlineRect.left,
                        top: inlineRect.top,
                        width: inlineRect.width,
                        minHeight: inlineRect.height,
                        fontFamily: inlineRect.fontFamily,
                        fontSize: inlineRect.fontSize,
                        fontWeight: inlineRect.fontWeight,
                        lineHeight: inlineRect.lineHeight,
                        color: COLORS.ink,
                        textAlign: inlineRect.textAlign,
                      }}
                    />
                  ) : (
                    <input
                      ref={inlineInputRef as React.RefObject<HTMLInputElement>}
                      value={inlineValue}
                      onChange={(event) => onInlineChange(event.target.value)}
                      onBlur={onInlineCommit}
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === 'Escape')
                          onInlineCommit()
                      }}
                      className="absolute z-30 rounded-sm border-2 border-[#D6B58B] bg-[#F7F2EA] px-1.5 py-1 text-[#3A2A1D] outline-none"
                      style={{
                        left: inlineRect.left,
                        top: inlineRect.top,
                        width: inlineRect.width,
                        height: inlineRect.height,
                        fontFamily: inlineRect.fontFamily,
                        fontSize: inlineRect.fontSize,
                        fontWeight: inlineRect.fontWeight,
                        lineHeight: inlineRect.lineHeight,
                        color: COLORS.ink,
                        textAlign: inlineRect.textAlign,
                      }}
                    />
                  ))}
              </div>
            </div>
            {lensActive && lensPosition && (
              <div
                className="pointer-events-none absolute z-20 overflow-hidden rounded-full border-2 border-[#D6B58B] bg-[#3A2A1D] shadow-[0_12px_35px_rgba(0,0,0,.45)]"
                style={{
                  left: lensPosition.x - lensSize / 2,
                  top: lensPosition.y - lensSize / 2,
                  width: lensSize,
                  height: lensSize,
                }}
              >
                <div
                  className="absolute origin-top-left"
                  style={{
                    left: lensSize / 2 - lensPosition.x * lensScale,
                    top: lensSize / 2 - lensPosition.y * lensScale,
                    width: pageWidth,
                    transform: `scale(${pageScale * lensScale})`,
                  }}
                >
                  {pages[currentPage].node}
                </div>
                <span className="absolute inset-0 rounded-full border border-white/20" />
              </div>
            )}
          </div>
        </div>
        <MagazineArrow
          direction="next"
          disabled={currentPage === pages.length - 1}
          onClick={() => goTo(currentPage + 1)}
          hideOnMobile={hideArrowsOnMobile}
        />
        {!editorMode && (
          <div className="pointer-events-auto fixed bottom-3 right-3 z-30 sm:bottom-4 sm:right-4">
            <MagazineLensControl
              active={lensActive}
              onToggle={() => {
                setLensActive((value) => !value)
                setLensPosition(null)
              }}
            />
          </div>
        )}
      </div>
      {showSwipeOnboarding && (
        <button
          type="button"
          className="magazine-swipe-onboarding sm:hidden"
          onClick={() => setShowSwipeOnboarding(false)}
          aria-label="Cerrar ayuda de navegación"
        >
          <span className="magazine-swipe-onboarding__gesture" aria-hidden="true">↔</span>
          <strong>Deslizá para pasar de página</strong>
          <span>Explorá el media kit con un gesto</span>
        </button>
      )}
      {footer}
    </div>
  )
}

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

export function MagazineEditorPreview({
  magazineTitle,
  magazineCoverImage,
  magazinePages,
  onSelect,
  onPageChange,
  pageIndex,
  embedded = false,
  inlineEditing,
  inlineValue,
  onInlineChange,
  onInlineCommit,
}: {
  magazineTitle: string
  magazineCoverImage?: string | null
  magazinePages: MagazinePage[]
  onSelect: (selection: MagazineEditSelection) => void
  onPageChange: (index: number) => void
  pageIndex?: number
  embedded?: boolean
  inlineEditing?: MagazineEditSelection | null
  inlineValue?: string
  onInlineChange?: (value: string) => void
  onInlineCommit?: () => void
}) {
  const itemFor = (name: string, defaultPrice: string, description: string) =>
    fallback(name, defaultPrice, description)
  const pages: JournalPage[] = magazinePages.map((page) => ({
    label: page.title ?? `Page ${page.position + 1}`,
    node: (
      <EditableJournalPage
        page={page}
        coverImage={magazineCoverImage}
        itemFor={itemFor}
        addToCart={() => undefined}
      />
    ),
  }))
  return (
    <MagazineViewer
      pages={pages}
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
