import type { TranslationEntry } from './i18nDictionary'

export const DICT_TOUR_CONTROLS: Record<string, TranslationEntry> = {
  'tour.step': {
    es: 'Paso {current} de {total}',
    en: 'Step {current} of {total}',
    pt: 'Etapa {current} de {total}',
  },
  'tour.skip': { es: 'Saltar', en: 'Skip', pt: 'Pular' },
  'tour.back': { es: 'Atrás', en: 'Back', pt: 'Voltar' },
  'tour.next': { es: 'Siguiente', en: 'Next', pt: 'Avançar' },
  'tour.start': { es: 'Empezar', en: 'Start', pt: 'Começar' },
  'tour.finish': { es: 'Listo', en: 'Done', pt: 'Pronto' },
  'tour.close': {
    es: 'Cerrar el recorrido',
    en: 'Close the tour',
    pt: 'Fechar o tour',
  },
  'tour.replay': {
    es: 'Volver a ver el recorrido',
    en: 'Replay the tour',
    pt: 'Ver o tour novamente',
  },

  /* ── Tour steps ────────────────────────────────────────────────── */
}

