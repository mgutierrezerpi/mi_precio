import type { TranslationEntry } from './i18nTypes'

export const DICT_BASE_08: Record<string, TranslationEntry> = {
  'billingEvent.subscription_plan_changed': {
    es: 'Plan actualizado',
    en: 'Plan changed',
    pt: 'Plano atualizado',
  },
  // Lemon Squeezy subscription statuses.
  'billingStatus.on_trial': { es: 'en prueba', en: 'on trial', pt: 'em teste' },
  'billingStatus.active': { es: 'activa', en: 'active', pt: 'ativa' },
  'billingStatus.paid': { es: 'al día', en: 'paid', pt: 'em dia' },
  'billingStatus.past_due': {
    es: 'pago pendiente',
    en: 'past due',
    pt: 'pagamento pendente',
  },
  'billingStatus.unpaid': { es: 'impaga', en: 'unpaid', pt: 'não paga' },
  'billingStatus.cancelled': {
    es: 'cancelada',
    en: 'cancelled',
    pt: 'cancelada',
  },
  'billingStatus.expired': { es: 'vencida', en: 'expired', pt: 'expirada' },
  'billingStatus.paused': { es: 'pausada', en: 'paused', pt: 'pausada' },

  // ── Relative time (activity feed) ───────────────────────────────────────
  'time.now': { es: 'Recién', en: 'Just now', pt: 'Agora' },
  'time.minAgo': { es: 'hace {n} min', en: '{n} min ago', pt: 'há {n} min' },
  'time.hAgo': { es: 'hace {n} h', en: '{n} h ago', pt: 'há {n} h' },
  'time.yesterday': { es: 'ayer', en: 'yesterday', pt: 'ontem' },
  'time.daysAgo': {
    es: 'hace {n} días',
    en: '{n} days ago',
    pt: 'há {n} dias',
  },

  // ── Settings ────────────────────────────────────────────────────
  'set.subtitle': {
    es: 'Administrá los datos y preferencias de tu cuenta.',
    en: 'Manage your account data and preferences.',
    pt: 'Gerencie os dados e preferências da sua conta.',
  },
  'set.onlyAdmins': {
    es: 'Solo los administradores pueden editar la configuración de la cuenta.',
    en: 'Only admins can edit account settings.',
    pt: 'Apenas administradores podem editar as configurações da conta.',
  },
  'set.sec.info': {
    es: 'Información de la empresa',
    en: 'Company information',
    pt: 'Informações da empresa',
  },
  'set.sec.brand': {
    es: 'Marca y apariencia',
    en: 'Brand & appearance',
    pt: 'Marca e aparência',
  },
  'set.sec.notifications': {
    es: 'Notificaciones',
    en: 'Notifications',
    pt: 'Notificações',
  },
  'set.sec.region': {
    es: 'Idioma y región',
    en: 'Language & region',
    pt: 'Idioma e região',
  },
  'set.sec.security': { es: 'Seguridad', en: 'Security', pt: 'Segurança' },
  'set.sec.billing': {
    es: 'Plan y facturación',
    en: 'Plan & billing',
    pt: 'Plano e faturamento',
  },
  'set.sec.delete': {
    es: 'Eliminar cuenta',
    en: 'Delete account',
    pt: 'Excluir conta',
  },

  'set.info.subtitle': {
    es: 'El nombre, el logo y la dirección pública de tu catálogo.',
    en: 'Your catalog name, logo and public address.',
    pt: 'O nome, o logo e o endereço público do seu catálogo.',
  },
  'set.info.logo': { es: 'Logo', en: 'Logo', pt: 'Logo' },
  'set.info.uploadLogo': {
    es: 'Subir logo',
    en: 'Upload logo',
    pt: 'Enviar logo',
  },
  'set.info.changeLogo': {
    es: 'Cambiar logo',
    en: 'Change logo',
    pt: 'Trocar logo',
  },
  'set.info.name': {
    es: 'Nombre del negocio',
    en: 'Business name',
    pt: 'Nome do negócio',
  },
  'set.info.subdomain': { es: 'Subdominio', en: 'Subdomain', pt: 'Subdomínio' },
  'set.info.taxId': {
    es: 'RUT / Identificación fiscal',
    en: 'Tax ID',
    pt: 'CNPJ / Identificação fiscal',
  },
  'set.info.publicUrl': {
    es: 'Dirección pública',
    en: 'Public address',
    pt: 'Endereço público',
  },

  'set.brand.subtitle': {
    es: 'Estos elementos aparecen en tu lista pública. El logo se configura en «Información de la empresa».',
    en: 'These appear on your public list. The logo is set in “Company information”.',
    pt: 'Estes aparecem na sua lista pública. O logo é configurado em “Informações da empresa”.',
  },
  'set.brand.color': {
    es: 'Color de marca',
    en: 'Brand color',
    pt: 'Cor da marca',
  },
  'set.brand.colorSub': {
    es: 'Se usa en acentos, botones y el carrito.',
    en: 'Used for accents, buttons and the cart.',
    pt: 'Usada em destaques, botões e no carrinho.',
  },
  'set.hero.title': {
    es: 'Color del hero',
    en: 'Hero color',
    pt: 'Cor do hero',
  },
  'set.hero.subtitle': {
    es: 'Color del encabezado destacado. Si lo dejás vacío usa el color de marca.',
    en: 'Color of the featured header. Leave empty to use the brand color.',
    pt: 'Cor do cabeçalho em destaque. Deixe vazio para usar a cor da marca.',
  },
  'set.hero.useBrand': {
    es: 'Usar color de marca',
    en: 'Use brand color',
    pt: 'Usar cor da marca',
  },
}

