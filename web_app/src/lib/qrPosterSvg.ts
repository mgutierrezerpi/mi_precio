import { qrToSvg } from './qrRender'

/** A4 at 150dpi. The poster is authored at these units; the PNG export
 *  rasterises the same vector at 2× for a 300dpi sheet. */
export const POSTER_W = 1240
export const POSTER_H = 1754

/** MiPrecio's own colours. The poster is deliberately ours, not the shop's:
 *  it hangs at a counter where strangers see it every day, so it doubles as
 *  advertising for the product — the same reason a Mercado Pago sticker is
 *  Mercado Pago yellow and not the shop's. */
const BRAND_FROM = '#7C3AED'
const BRAND_TO = '#C026D3'
/** The code's own violet: dark enough that a scanner never hesitates on white,
 *  and exported so the CRM's preview can show the code the poster will carry
 *  rather than a different one. */
export const POSTER_QR_COLOR = '#3B0F73'

/** The white MiPrecio mark, for the violet ground. */
export const BRAND_LOGO_PATH = '/miprecio-logo-white-pencil.webp'

export interface QrPosterOptions {
  /** What the code opens. */
  value: string
  /** What the customer is being asked to do. */
  headline: string
  /** Line at the foot of the sheet: the advertising payload. */
  footer: string
  /** The MiPrecio mark, already a data URL. */
  logoDataUrl?: string | null
  /** Width ÷ height of that mark, so it is not squashed into a fixed box. */
  logoAspect?: number
}

/** The mark's slot. Driven by width — it is a wordmark, so its width is what
 *  reads as "big enough" — and clamped so an unexpectedly wide or tall file
 *  cannot run off the sheet or crowd the code. */
function markBox(aspect: number | undefined) {
  const ratio = aspect && aspect > 0 ? aspect : 3
  const w = 560
  const h = Math.min(w / ratio, 220)
  return { w: Math.round(Math.min(w, h * ratio)), h: Math.round(h) }
}

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** Builds the printable QR poster as a standalone SVG.
 *
 *  Vector rather than a captured screenshot, and the single source for both
 *  downloads: the SVG is saved as-is, and the PNG is this same markup
 *  rasterised. A print shop can scale it to any size without it going soft.
 *
 *  The code always sits on a white card. Scanners need the contrast, and it
 *  keeps the violet doing the branding instead of fighting the code. */
export function buildQrPosterSvg({
  value,
  headline,
  footer,
  logoDataUrl,
  logoAspect,
}: QrPosterOptions): string {
  const font = "Inter, 'Segoe UI', system-ui, Arial, sans-serif"
  const soft = 'rgba(255,255,255,0.78)'

  // Vertical rhythm, top to bottom. The sheet is measured rather than eyeballed
  // so the air above the mark matches the air under the footer — an unbalanced
  // poster reads as a mistake even to someone who cannot say why.
  const TOP = 140
  const mark = markBox(logoAspect)
  const cardY = TOP + mark.h + 130
  const cardSize = 880
  const cardX = (POSTER_W - cardSize) / 2
  const qrPad = 56
  const qrSize = cardSize - qrPad * 2

  // Baselines sit ~0.78 of the font size below the text's top edge.
  const headlineSize = 64
  const headlineY = cardY + cardSize + 120 + headlineSize * 0.78
  const footerSize = 28
  const footerY = headlineY + headlineSize * 0.22 + 46 + footerSize * 0.78

  // The QR nests as its own <svg>, so its modules stay crisp vector paths.
  const qr = qrToSvg(value, { fg: POSTER_QR_COLOR, bg: '#FFFFFF' }).replace(
    '<svg ',
    `<svg x="${cardX + qrPad}" y="${cardY + qrPad}" width="${qrSize}" height="${qrSize}" `
  )

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${POSTER_W}" height="${POSTER_H}" viewBox="0 0 ${POSTER_W} ${POSTER_H}">
  <defs>
    <linearGradient id="mp" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BRAND_FROM}"/>
      <stop offset="1" stop-color="${BRAND_TO}"/>
    </linearGradient>
  </defs>
  <rect width="${POSTER_W}" height="${POSTER_H}" fill="url(#mp)"/>
  ${
    logoDataUrl
      ? `<image href="${logoDataUrl}" xlink:href="${logoDataUrl}" x="${(POSTER_W - mark.w) / 2}" y="${TOP}" width="${mark.w}" height="${mark.h}" preserveAspectRatio="xMidYMid meet"/>`
      : `<text x="${POSTER_W / 2}" y="${TOP + mark.h * 0.78}" font-family="${font}" font-size="${Math.round(mark.h)}" font-weight="800" fill="#FFFFFF" text-anchor="middle">MiPrecio</text>`
  }
  <rect x="${cardX}" y="${cardY}" width="${cardSize}" height="${cardSize}" rx="48" fill="#FFFFFF"/>
  ${qr}
  <text x="${POSTER_W / 2}" y="${Math.round(headlineY)}" font-family="${font}" font-size="${headlineSize}" font-weight="800" fill="#FFFFFF" text-anchor="middle">${esc(headline)}</text>
  <text x="${POSTER_W / 2}" y="${Math.round(footerY)}" font-family="${font}" font-size="${footerSize}" font-weight="700" fill="${soft}" text-anchor="middle" letter-spacing="1">${esc(footer)}</text>
</svg>`
}
