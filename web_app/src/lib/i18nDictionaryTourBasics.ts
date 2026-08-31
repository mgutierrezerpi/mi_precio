import type { TranslationEntry } from './i18nDictionary'

export const DICT_TOUR_BASICS: Record<string, TranslationEntry> = {
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
    es:
      'Acá vive tu carta. Creá una lista, elegí qué productos entran y publicala: ' +
        'eso es lo que van a ver tus clientes.',
    en:
      'This is where your menu lives. Create a list, pick which products go in it and ' +
        'publish: that is what your customers see.',
    pt:
      'É aqui que vive o seu cardápio. Crie uma lista, escolha os produtos e publique: ' +
        'é isso que seus clientes veem.',
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
    es: 'En Configuración → Marca y apariencia cargás tu logo, tu color y los datos del negocio. '
      + 'Todo eso es lo que ven tus clientes en tu lista pública, no la marca de MiPrecio.',
    en: 'Under Settings → Brand and appearance you set your logo, your color and your business details. '
      + 'That is what your customers see on your public list — not MiPrecio branding.',
    pt: 'Em Configurações → Marca e aparência você define seu logo, sua cor e os dados do negócio. '
      + 'É isso que seus clientes veem na sua lista pública, não a marca do MiPrecio.',
  },
}
