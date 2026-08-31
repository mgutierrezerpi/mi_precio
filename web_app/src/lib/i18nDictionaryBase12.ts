import type { TranslationEntry } from './i18nTypes'

export const DICT_BASE_12: Record<string, TranslationEntry> = {
  'set.design.pencil-journal.desc': {
    es: 'Revista editorial completa de nueve páginas con portada, recetas, historia y artículos.',
    en: 'Nine-page editorial magazine with cover, recipes, history and long-form stories.',
    pt: 'Revista editorial completa de nove páginas com capa, receitas, história e artigos.',
  },
  // ── Per-list appearance (overrides of the tenant defaults) ──────
  'list.appearance.title': {
    es: 'Apariencia de esta lista',
    en: 'This list’s appearance',
    pt: 'Aparência desta lista',
  },
  'list.appearance.subtitle': {
    es: 'Personalizá cómo se ve esta lista. Lo que no cambies usa lo del comercio.',
    en: 'Customize how this list looks. Anything you leave alone uses the business defaults.',
    pt: 'Personalize como esta lista aparece. O que você não mudar usa o padrão do negócio.',
  },
  'list.appearance.designSub': {
    es: 'Sólo para esta lista. Las demás no cambian.',
    en: 'For this list only. The others are unaffected.',
    pt: 'Só para esta lista. As outras não mudam.',
  },
  'list.appearance.inherit': {
    es: 'El del comercio',
    en: 'Business default',
    pt: 'O padrão do negócio',
  },
  'list.appearance.inheritDesc': {
    es: 'Usa el diseño configurado en Marca y apariencia.',
    en: 'Uses the design set in Brand & appearance.',
    pt: 'Usa o design definido em Marca e aparência.',
  },
  'list.appearance.useTenant': {
    es: 'Usar el del comercio',
    en: 'Use business default',
    pt: 'Usar o padrão do negócio',
  },
  'list.appearance.bgInherited': {
    es: 'Heredado del comercio.',
    en: 'Inherited from the business.',
    pt: 'Herdado do negócio.',
  },
  'list.appearance.applyTo': {
    es: 'Personalizar',
    en: 'Customize',
    pt: 'Personalizar',
  },
  'list.appearance.tenantDefault': {
    es: 'Todas las listas (por defecto)',
    en: 'All lists (default)',
    pt: 'Todas as listas (padrão)',
  },
  'list.appearance.custom': {
    es: 'Personalizada',
    en: 'Custom',
    pt: 'Personalizada',
  },
  'set.bg.title': {
    es: 'Imagen de fondo',
    en: 'Background image',
    pt: 'Imagem de fundo',
  },
  'set.bg.subtitle': {
    es: 'Se muestra detrás de tu lista pública, en cualquier diseño.',
    en: 'Shown behind your public list, in any design.',
    pt: 'Aparece atrás da sua lista pública, em qualquer design.',
  },
  'set.bg.upload': {
    es: 'Subir imagen',
    en: 'Upload image',
    pt: 'Enviar imagem',
  },
  'set.bg.change': {
    es: 'Cambiar imagen',
    en: 'Change image',
    pt: 'Trocar imagem',
  },
  'set.bg.overlay': {
    es: 'Filtro con color de marca',
    en: 'Brand color filter',
    pt: 'Filtro com cor da marca',
  },
  'set.bg.overlayDesc': {
    es: 'Aplica una capa con tu color de marca sobre la imagen.',
    en: 'Lays your brand color over the image.',
    pt: 'Aplica uma camada com a cor da marca sobre a imagem.',
  },

  'set.notif.subtitle': {
    es: 'Elegí qué te avisa la campana de la barra superior.',
    en: 'Choose what the topbar bell notifies you about.',
    pt: 'Escolha o que o sino da barra superior avisa.',
  },
  'set.notif.banner': {
    es:
      'Las notificaciones aparecen dentro de la app (campana arriba a la derecha) y, ' +
        'si las activás abajo, también en tu escritorio o celular.',
    en:
      'Notifications appear inside the app (bell, top right) and, if you enable them ' +
        'below, on your desktop or phone too.',
    pt:
      'As notificações aparecem dentro do app (sino, canto superior direito) e, se ' +
        'ativá-las abaixo, também no seu desktop ou celular.',
  },
  'set.notif.sales': { es: 'Ventas', en: 'Sales', pt: 'Vendas' },
  'set.notif.salesDesc': {
    es: 'Cuando se registra una compra.',
    en: 'When a purchase is recorded.',
    pt: 'Quando uma compra é registrada.',
  },
  'set.notif.catalog': { es: 'Catálogo', en: 'Catalog', pt: 'Catálogo' },
  'set.notif.catalogDesc': {
    es: 'Altas, bajas y publicaciones de productos y listas.',
    en: 'Product and list additions, removals and publishing.',
    pt: 'Inclusões, exclusões e publicações de produtos e listas.',
  },
  'set.notif.customers': { es: 'Clientes', en: 'Customers', pt: 'Clientes' },
  'set.notif.customersDesc': {
    es: 'Cuando se agrega un cliente nuevo.',
    en: 'When a new customer is added.',
    pt: 'Quando um novo cliente é adicionado.',
  },
  'set.notif.team': { es: 'Equipo', en: 'Team', pt: 'Equipe' },
  'set.notif.teamDesc': {
    es: 'Invitaciones y cambios de rol.',
    en: 'Invitations and role changes.',
    pt: 'Convites e mudanças de função.',
  },
  'set.notif.deviceTitle': {
    es: 'Notificaciones en este dispositivo',
    en: 'Notifications on this device',
    pt: 'Notificações neste dispositivo',
  },
  'set.notif.deviceDesc': {
    es: 'Recibí avisos en el escritorio y, si instalaste la app en el celular, también en tu teléfono.',
    en: 'Get desktop alerts and, if you installed the app on your phone, push notifications there too.',
    pt: 'Receba avisos no desktop e, se instalou o app no celular, também no seu telefone.',
  },
  'set.notif.enable': { es: 'Activar', en: 'Enable', pt: 'Ativar' },
  'set.notif.enabling': { es: 'Activando…', en: 'Enabling…', pt: 'Ativando…' },
  'set.notif.disable': { es: 'Desactivar', en: 'Disable', pt: 'Desativar' },
  'set.notif.active': {
    es: 'Activadas en este dispositivo ✓',
    en: 'On for this device ✓',
    pt: 'Ativadas neste dispositivo ✓',
  },
}
