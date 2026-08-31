import type { TranslationEntry } from './i18nDictionary'

export const DICT_TOUR_GUIDANCE: Record<string, TranslationEntry> = {
  'tour.design.title': {
    es: 'El diseño de tus listas',
    en: 'How your lists look',
    pt: 'O design das suas listas',
  },
  'tour.design.body': {
    es: [
      'Elegí una plantilla, un color de portada y un fondo. Podés dejar un diseño para todo el negocio ',
      'o darle el suyo a cada lista: la carta del mediodía no tiene por qué verse igual que la de vinos.',
    ].join(''),
    en: [
      'Pick a template, a hero color and a background. Keep one design for the whole business or give ',
      'each list its own: the lunch menu need not look like the wine list.',
    ].join(''),
    pt: [
      'Escolha um modelo, uma cor de capa e um fundo. Mantenha um design para todo o negócio ou dê o ',
      'seu a cada lista: o cardápio do almoço não precisa ser igual ao de vinhos.',
    ].join(''),
  },
  'tour.qr.title': {
    es: 'Tu código QR',
    en: 'Your QR code',
    pt: 'Seu código QR',
  },
  'tour.qr.body': {
    es: [
      'Descargalo e imprimilo para la mesa, la vidriera o el mostrador. Cuando cambiás un precio no ',
      'hace falta reimprimir nada: el QR es siempre el mismo.',
    ].join(''),
    en: 'Download it and print it for the table, the window or the counter. Changing a price never means reprinting: the QR code stays the same.',
    pt: 'Baixe e imprima para a mesa, a vitrine ou o balcão. Mudar um preço não exige reimprimir nada: o QR é sempre o mesmo.',
  },
  'tour.share.title': {
    es: 'Tu link público',
    en: 'Your public link',
    pt: 'Seu link público',
  },
  'tour.share.body': {
    es: 'Este botón copia el link de tu lista principal. Mandalo por WhatsApp o pegalo en tus redes y ya estás vendiendo.',
    en: 'This button copies the link to your main list. Send it over WhatsApp or drop it on your socials and you are selling.',
    pt: 'Este botão copia o link da sua lista principal. Mande por WhatsApp ou publique nas suas redes e pronto.',
  },
  'tour.support.title': {
    es: '¿Te trabaste?',
    en: 'Stuck?',
    pt: 'Travou?',
  },
  'tour.support.body': {
    es: 'Escribinos desde acá y te respondemos. Y desde esta misma pantalla podés volver a ver este recorrido cuando quieras.',
    en: 'Write to us from here and we will get back to you. This same screen is where you can replay this tour whenever you want.',
    pt: 'Escreva para nós por aqui e respondemos. Nesta mesma tela você pode rever este tour quando quiser.',
  },
}
