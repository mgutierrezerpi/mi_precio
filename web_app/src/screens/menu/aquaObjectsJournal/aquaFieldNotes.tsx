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
  productsFor,
} from './aquaParts'

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

export default FieldNotes

