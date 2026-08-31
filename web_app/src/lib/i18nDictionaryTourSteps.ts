import type { TranslationEntry } from './i18nDictionary'

/** First-login checklist copy, kept separate from the tour walkthrough. */
export const DICT_TOUR_STEPS: Record<string, TranslationEntry> = {
  'steps.title': {
    es: 'Primeros pasos',
    en: 'First steps',
    pt: 'Primeiros passos',
  },
  'steps.progress': {
    es: '{done} de {total}',
    en: '{done} of {total}',
    pt: '{done} de {total}',
  },
  'steps.subtitle': {
    es: 'Cinco cosas y tu negocio queda publicado.',
    en: 'Five things and your business is live.',
    pt: 'Cinco coisas e seu negócio fica no ar.',
  },
  'steps.complete': {
    es: '¡Listo! Ya tenés tu negocio publicado y listo para compartir.',
    en: 'All set! Your business is live and ready to share.',
    pt: 'Tudo pronto! Seu negócio está no ar e pronto para compartilhar.',
  },
  'steps.hide': { es: 'Ocultar', en: 'Hide', pt: 'Ocultar' },

  'steps.products.todo': {
    es: 'Agregá tus productos',
    en: 'Add your products',
    pt: 'Adicione seus produtos',
  },
  'steps.products.done': {
    es: 'Agregaste tus productos',
    en: 'You added your products',
    pt: 'Você adicionou seus produtos',
  },
  'steps.design.todo': {
    es: 'Configurá cómo se ve tu lista',
    en: 'Set up how your list looks',
    pt: 'Configure como sua lista aparece',
  },
  'steps.design.done': {
    es: 'Configuraste cómo se ve tu lista',
    en: 'You set up how your list looks',
    pt: 'Você configurou como sua lista aparece',
  },
  'steps.list.todo': {
    es: 'Configurá tu lista',
    en: 'Set up your list',
    pt: 'Configure sua lista',
  },
  'steps.list.done': {
    es: 'Configuraste tu lista',
    en: 'You set up your list',
    pt: 'Você configurou sua lista',
  },
  'steps.publish.todo': {
    es: 'Publicá tu lista',
    en: 'Publish your list',
    pt: 'Publique sua lista',
  },
  'steps.publish.done': {
    es: 'Publicaste tu lista',
    en: 'You published your list',
    pt: 'Você publicou sua lista',
  },
  'steps.share.todo': {
    es: 'Compartí tu QR o tu link',
    en: 'Share your QR or your link',
    pt: 'Compartilhe seu QR ou seu link',
  },
  'steps.share.done': {
    es: 'Compartiste tu QR',
    en: 'You shared your QR',
    pt: 'Você compartilhou seu QR',
  },
}
