import type { TranslationEntry } from './i18nDictionary'

/** Copy of the public pages that used to be written straight in Spanish. */
export const DICT_PUBLIC: Record<string, TranslationEntry> = {
  /* ── The order message the shop receives ───────────────────────── */
  'pub.order.name': { es: 'Nombre', en: 'Name', pt: 'Nome' },
  'pub.order.phone': { es: 'Tel', en: 'Phone', pt: 'Tel' },
  'pub.order.email': { es: 'Email', en: 'Email', pt: 'E-mail' },
  'pub.order.delivery': { es: 'Entrega', en: 'Delivery', pt: 'Entrega' },
  'pub.order.address': { es: 'Dirección', en: 'Address', pt: 'Endereço' },
  'pub.order.notes': { es: 'Notas', en: 'Notes', pt: 'Observações' },
  'pub.order.lead': { es: 'Pedido', en: 'Order', pt: 'Pedido' },

  /* ── Checkout through Instagram ────────────────────────────────── */
  'pub.instagramCheckout': {
    es: 'Copiar pedido y abrir Instagram',
    en: 'Copy order and open Instagram',
    pt: 'Copiar pedido e abrir o Instagram',
  },
  'pub.instagramCheckoutShort': {
    es: 'Copiar pedido · Instagram',
    en: 'Copy order · Instagram',
    pt: 'Copiar pedido · Instagram',
  },

  /* ── The prompt of a private list ──────────────────────────────── */
  'pub.access.eyebrow': {
    es: 'Lista privada',
    en: 'Private list',
    pt: 'Lista privada',
  },
  'pub.access.title': {
    es: 'Ingresá tu código',
    en: 'Enter your code',
    pt: 'Digite seu código',
  },
  'pub.access.hint': {
    es: 'Esta lista está disponible solo para personas invitadas.',
    en: 'This list is only available to invited people.',
    pt: 'Esta lista está disponível apenas para pessoas convidadas.',
  },
  'pub.access.placeholder': {
    es: 'Código de acceso',
    en: 'Access code',
    pt: 'Código de acesso',
  },
  'pub.access.invalid': {
    es: 'El código no es válido. Intentá de nuevo.',
    en: 'That code is not valid. Please try again.',
    pt: 'O código não é válido. Tente novamente.',
  },
  'pub.access.checking': {
    es: 'Verificando…',
    en: 'Checking…',
    pt: 'Verificando…',
  },
  'pub.access.submit': { es: 'Ver lista', en: 'View list', pt: 'Ver lista' },

  /* ── Template pages and photo viewer ───────────────────────────── */
  'pub.secondPage': {
    es: 'Segunda página',
    en: 'Second page',
    pt: 'Segunda página',
  },
  'pub.gallery': { es: 'Galería', en: 'Gallery', pt: 'Galeria' },
  'pub.productsTab': { es: 'Productos', en: 'Products', pt: 'Produtos' },
  'pub.listPages': {
    es: 'Páginas de la lista',
    en: 'List pages',
    pt: 'Páginas da lista',
  },
  'pub.works': { es: 'Trabajos', en: 'Our work', pt: 'Trabalhos' },
  'pub.carousel': { es: 'carrusel', en: 'carousel', pt: 'carrossel' },
  'pub.productPhotos': {
    es: 'Fotos de productos',
    en: 'Product photos',
    pt: 'Fotos de produtos',
  },
  'pub.logoOf': {
    es: 'Logo de {name}',
    en: '{name} logo',
    pt: 'Logo de {name}',
  },
  'pub.viewItem': { es: 'Ver {name}', en: 'View {name}', pt: 'Ver {name}' },
  'pub.viewPhotoOf': {
    es: 'Ver foto de {name}',
    en: 'View photo of {name}',
    pt: 'Ver foto de {name}',
  },
  'pub.photoOf': {
    es: 'Foto de {name}',
    en: 'Photo of {name}',
    pt: 'Foto de {name}',
  },
  'pub.closePhoto': {
    es: 'Cerrar foto',
    en: 'Close photo',
    pt: 'Fechar foto',
  },
  'pub.previousPhoto': {
    es: 'Foto anterior',
    en: 'Previous photo',
    pt: 'Foto anterior',
  },
  'pub.nextPhoto': {
    es: 'Foto siguiente',
    en: 'Next photo',
    pt: 'Próxima foto',
  },
}
