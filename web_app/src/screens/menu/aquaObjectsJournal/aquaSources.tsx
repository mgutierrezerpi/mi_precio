import type { MagazinePageContent } from '../../../components/magazine/templateCatalog'
import {
  COLORS,
  Footer,
  Folio,
  MONO,
  Page,
  SANS,
  SERIF,
  productsFor,
} from './aquaParts'

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
          'A bathroom gains character from the provenance of its materials — their origin, '
          + 'their making and the way they wear over time.'}
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
          'The Bath: A History of Cleanliness and Pollution — G. Vigarello · The Roman Baths '
          + '— F. Yegül · Manufacturer finish archives and studio interviews, 2025.'}
      </p>
      <div className="absolute bottom-[10px] left-[46px]">
        <Footer color={COLORS.sand}>
          {content.footer ?? 'AQUA / EDIT · SOURCES · 07'}
        </Footer>
      </div>
    </Page>
  )
}

export default Sources
