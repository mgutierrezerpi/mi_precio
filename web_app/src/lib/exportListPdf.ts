/** Turns a rendered public price list into a downloadable PDF.
 *
 *  The sheet is a picture of the real page rather than a redrawing of it: the
 *  nine list designs stay the single source of truth, so the export cannot
 *  drift from what a customer sees, and a template added later needs no work
 *  here. The trade is that the text lands as image, not as selectable glyphs.
 *
 *  One page, exactly as tall as the list. Nothing is paginated, so nothing can
 *  be cut in half — not a product row, not a framed card, not a section.
 */

/** Class the page wears while it is being captured. Hides the controls that
 *  only make sense on screen (see index.css). */
export const EXPORTING_CLASS = 'mp-exporting'

/** Above ~1.5 the file grows faster than it gets sharper, and a long menu at
 *  scale 3 can exhaust the canvas budget on a phone. */
const SCALE = 1.5

/** PDF coordinates top out at 14400pt (200in) per side. */
const MAX_PT = 14400

/** Breathing room left on each side of the content column. */
const SIDE_MARGIN = 40

/** How wide the list's content column actually is.
 *
 *  The designs centre their content in a `max-width` container, so capturing at
 *  the browser's width buries the menu in a sea of background — on a 1905px
 *  window a 1235px column wastes 363px a side. Measuring instead of picking a
 *  fixed number keeps this right for every template, including ones added
 *  later, since each declares its own column width.
 *
 *  Elements spanning the full width are skipped on purpose: a full-bleed hero
 *  or the page background says nothing about where the content sits. */
function contentWidthOf(node: HTMLElement): number {
  const full = node.clientWidth
  let left = Infinity
  let right = -Infinity
  for (const el of node.querySelectorAll<HTMLElement>('*')) {
    const box = el.getBoundingClientRect()
    if (!box.width || !box.height) continue
    if (box.width >= full - 1) continue
    left = Math.min(left, box.left)
    right = Math.max(right, box.right)
  }
  return Number.isFinite(left) ? Math.ceil(right - left) : full
}

export interface ExportPdfOptions {
  /** The element to capture — the public list's root. */
  node: HTMLElement
  /** Base name for the downloaded file, without extension. */
  fileName: string
}

export async function exportListPdf({ node, fileName }: ExportPdfOptions) {
  // Loaded on demand: together these are ~500KB, and they are only ever
  // needed on the export route. Vite splits them into their own chunk.
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ])

  node.classList.add(EXPORTING_CLASS)
  const previousWidth = node.style.width
  let canvas: HTMLCanvasElement
  try {
    // Narrow the sheet to the content plus a margin, so the PDF is the menu
    // rather than the menu adrift in background. Only the captured box is
    // resized — media queries still answer to the real window, so the design
    // keeps the desktop layout it was measured in instead of collapsing to
    // its mobile one.
    const target = Math.min(
      node.clientWidth,
      contentWidthOf(node) + SIDE_MARGIN * 2
    )
    node.style.width = `${target}px`
    // Read the height only now: a narrower column rewraps text and grows.
    const height = node.scrollHeight

    canvas = await html2canvas(node, {
      scale: SCALE,
      // The design's own background is the sheet's background; without this
      // html2canvas paints white behind everything.
      backgroundColor: null,
      useCORS: true,
      // Capture the whole list, not the part that happens to be scrolled into
      // view: the window is shorter than the menu.
      windowHeight: height,
      width: target,
      height,
      scrollX: 0,
      scrollY: 0,
    })
  } finally {
    node.style.width = previousWidth
    node.classList.remove(EXPORTING_CLASS)
  }

  // Back to CSS pixels, so the PDF measures what the page measured.
  const width = canvas.width / SCALE
  const height = canvas.height / SCALE
  const scaleToFit = Math.min(1, MAX_PT / Math.max(width, height))

  const pdf = new jsPDF({
    unit: 'px',
    // A page the size of the content: the only way to guarantee no break.
    format: [width * scaleToFit, height * scaleToFit],
    orientation: width > height ? 'landscape' : 'portrait',
    compress: true,
  })
  pdf.addImage(
    canvas.toDataURL('image/jpeg', 0.92),
    'JPEG',
    0,
    0,
    width * scaleToFit,
    height * scaleToFit
  )
  pdf.save(`${fileName}.pdf`)
}

/** `Menú de la casa` → `menu-de-la-casa`, so the download lands with a name
 *  the shop recognises instead of `document.pdf`. */
export function pdfFileName(...parts: (string | null | undefined)[]) {
  const slug = parts
    .filter(Boolean)
    .join('-')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return slug || 'lista'
}
