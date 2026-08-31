import { definePencilTemplate, pencilImages } from '../templateConfig'

export const pencilEvening = definePencilTemplate({
  background: '#F2EFE9',
  ink: '#28231F',
  muted: '#655E55',
  accent: '#A99476',
  darkPanel: '#1B1B1B',
  image: pencilImages.evening,
  imageLabel: 'SATURDAY ONLY',
  imageTitle: 'the morning table',
  promoEyebrow: 'WINTER SUPPER',
  promoTitle: 'The candlelight box',
  promoBody:
    'A warm collection of dark chocolate, spice and late-season citrus.',
  promoPrice: '$36',
  promoNote: 'pre-order 24 hours',
  footerLeft: '17 RUE DES FLEURS · OPEN DAILY 7–4',
  footerRight: 'PLEASE ASK ABOUT TODAY’S CAKES',
  layout: 'full-image',
})
