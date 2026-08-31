import type { TranslationEntry } from './i18nDictionary'

/** Copy for the first-login guided tour and the "first steps" checklist.
 *  Checklist rows carry two labels: an imperative while pending, past tense
 *  once done — a ticked row should read as something you achieved, not as an
 *  order you already followed. */
export const DICT_TOUR: Record<string, TranslationEntry> = {
  /* ── Tour chrome ───────────────────────────────────────────────── */
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
  'tour.close': { es: 'Cerrar el recorrido', en: 'Close the tour', pt: 'Fechar o tour' },
  'tour.replay': {
    es: 'Volver a ver el recorrido',
    en: 'Replay the tour',
    pt: 'Ver o tour novamente',
  },

  /* ── Tour steps ────────────────────────────────────────────────── */
  'tour.welcome.title': {
    es: '¡Bienvenido a MiPrecio, {name}!',
    en: 'Welcome to MiPrecio, {name}!',
    pt: 'Bem-vindo ao MiPrecio, {name}!',
  },
  'tour.welcome.body': {
    es: 'Un minuto para mostrarte dónde está cada cosa. Podés saltarlo y volver a verlo cuando quieras.',
    en: 'One minute to show you where everything is. You can skip it and replay it whenever you want.',
    pt: 'Um minuto para mostrar onde está cada coisa. Você pode pular e ver de novo quando quiser.',
  },
  'tour.lists.title': {
    es: 'Tus listas de precios',
    en: 'Your price lists',
    pt: 'Suas listas de preços',
  },
  'tour.lists.body': {
    es: 'Acá vive tu carta. Creá una lista, elegí qué productos entran y publicala: eso es lo que van a ver tus clientes.',
    en: 'This is where your menu lives. Create a list, pick which products go in it and publish: that is what your customers see.',
    pt: 'É aqui que vive o seu cardápio. Crie uma lista, escolha os produtos e publique: é isso que seus clientes veem.',
  },
  'tour.products.title': {
    es: 'Tu catálogo',
    en: 'Your catalog',
    pt: 'Seu catálogo',
  },
  'tour.products.body': {
    es: 'Cargá cada producto una sola vez, con su precio y su foto. Después lo usás en todas las listas que quieras.',
    en: 'Add each product once, with its price and photo. From there you can reuse it in as many lists as you like.',
    pt: 'Cadastre cada produto uma única vez, com preço e foto. Depois é só reutilizá-lo em quantas listas quiser.',
  },
  'tour.brand.title': {
    es: 'La marca de tu negocio',
    en: 'Your business brand',
    pt: 'A marca do seu negócio',
  },
  'tour.brand.body': {
    es: 'En Configuración → Marca y apariencia cargás tu logo, tu color y los datos del negocio. Todo eso es lo que ven tus clientes en tu lista pública, no la marca de MiPrecio.',
    en: 'Under Settings → Brand and appearance you set your logo, your color and your business details. That is what your customers see on your public list — not MiPrecio branding.',
    pt: 'Em Configurações → Marca e aparência você define seu logo, sua cor e os dados do negócio. É isso que seus clientes veem na sua lista pública, não a marca do MiPrecio.',
  },
  'tour.design.title': {
    es: 'El diseño de tus listas',
    en: 'How your lists look',
    pt: 'O design das suas listas',
  },
  'tour.design.body': {
    es: 'Elegí una plantilla, un color de portada y un fondo. Podés dejar un diseño para todo el negocio o darle el suyo a cada lista: la carta del mediodía no tiene por qué verse igual que la de vinos.',
    en: 'Pick a template, a hero color and a background. Keep one design for the whole business or give each list its own: the lunch menu need not look like the wine list.',
    pt: 'Escolha um modelo, uma cor de capa e um fundo. Mantenha um design para todo o negócio ou dê o seu a cada lista: o cardápio do almoço não precisa ser igual ao de vinhos.',
  },
  'tour.qr.title': {
    es: 'Tu código QR',
    en: 'Your QR code',
    pt: 'Seu código QR',
  },
  'tour.qr.body': {
    es: 'Descargalo e imprimilo para la mesa, la vidriera o el mostrador. Cuando cambiás un precio no hace falta reimprimir nada: el QR es siempre el mismo.',
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

  /* ── First-steps checklist ─────────────────────────────────────── */
  'steps.title': { es: 'Primeros pasos', en: 'First steps', pt: 'Primeiros passos' },
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
