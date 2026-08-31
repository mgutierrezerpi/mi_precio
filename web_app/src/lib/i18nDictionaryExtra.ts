import type { TranslationEntry } from './i18nDictionary'

export const DICT_EXTRA: Record<string, TranslationEntry> = {
  'set.region.deliverySub': {
    es: 'Si está desactivado, el carrito solo muestra retiro en el local.',
    en: 'When off, the cart only offers in-store pickup.',
    pt: 'Quando desativado, o carrinho só oferece retirada na loja.',
  },

  'set.security.subtitle': {
    es: 'Tu acceso a la cuenta.',
    en: 'Your account access.',
    pt: 'Seu acesso à conta.',
  },
  'set.security.passwordless': {
    es: 'Tu cuenta usa acceso sin contraseña: ingresás con un código que enviamos a tu email.',
    en: 'Your account uses passwordless access: you log in with a code we send to your email.',
    pt: 'Sua conta usa acesso sem senha: você entra com um código que enviamos ao seu e-mail.',
  },
  'set.security.email': {
    es: 'Email de acceso',
    en: 'Login email',
    pt: 'E-mail de acesso',
  },
  'set.security.role': { es: 'Rol', en: 'Role', pt: 'Função' },
  'set.security.logout': { es: 'Cerrar sesión', en: 'Log out', pt: 'Sair' },

  'set.billing.subtitle': {
    es: 'Tu plan actual y facturación.',
    en: 'Your current plan and billing.',
    pt: 'Seu plano atual e faturamento.',
  },
  'set.billing.current': {
    es: 'Plan actual',
    en: 'Current plan',
    pt: 'Plano atual',
  },
  'set.billing.free': { es: 'Gratis', en: 'Free', pt: 'Grátis' },
  'set.billing.active': { es: 'Activo', en: 'Active', pt: 'Ativo' },
  'set.billing.f1': {
    es: 'Productos y listas ilimitadas',
    en: 'Unlimited products and lists',
    pt: 'Produtos e listas ilimitados',
  },
  'set.billing.f2': {
    es: 'Códigos QR y links públicos',
    en: 'QR codes and public links',
    pt: 'Códigos QR e links públicos',
  },
  'set.billing.f3': {
    es: 'Clientes y reportes',
    en: 'Customers and reports',
    pt: 'Clientes e relatórios',
  },
  'set.billing.f4': {
    es: 'Equipo con roles y permisos',
    en: 'Team with roles and permissions',
    pt: 'Equipe com funções e permissões',
  },
  'set.billing.soon': {
    es: 'Los planes pagos y la facturación llegarán pronto.',
    en: 'Paid plans and billing are coming soon.',
    pt: 'Os planos pagos e o faturamento chegarão em breve.',
  },
  'bill.usageTitle': {
    es: 'Uso de tu plan',
    en: 'Your plan usage',
    pt: 'Uso do seu plano',
  },
  'bill.products': { es: 'Productos', en: 'Products', pt: 'Produtos' },
  'bill.lists': { es: 'Listas', en: 'Lists', pt: 'Listas' },
  'bill.members': { es: 'Miembros', en: 'Members', pt: 'Membros' },
  'bill.unlimited': { es: 'Ilimitado', en: 'Unlimited', pt: 'Ilimitado' },
  'bill.current': { es: 'Plan actual', en: 'Current plan', pt: 'Plano atual' },
  'bill.choose': { es: 'Elegir plan', en: 'Choose plan', pt: 'Escolher plano' },
  'bill.changing': {
    es: 'Abriendo checkout…',
    en: 'Opening checkout…',
    pt: 'Abrindo checkout…',
  },
  'bill.recommended': {
    es: 'Más popular',
    en: 'Most popular',
    pt: 'Mais popular',
  },
  'bill.ownerOnly': {
    es: 'Solo el dueño de la cuenta puede cambiar el plan.',
    en: 'Only the account owner can change the plan.',
    pt: 'Apenas o dono da conta pode mudar o plano.',
  },
  'bill.paymentNote': {
    es: 'Los pagos se procesan con Lemon Squeezy. Tu plan se activa automáticamente cuando el pago queda confirmado.',
    en: 'Payments are processed with Lemon Squeezy. Your plan activates automatically once payment is confirmed.',
    pt: 'Os pagamentos são processados com Lemon Squeezy. Seu plano é ativado automaticamente quando o pagamento é confirmado.',
  },
  'bill.managePortal': {
    es: 'Gestionar en Lemon Squeezy',
    en: 'Manage in Lemon Squeezy',
    pt: 'Gerenciar no Lemon Squeezy',
  },
  'bill.pending': {
    es: 'Seleccionaste {plan}. Estamos esperando la confirmación de Lemon Squeezy.',
    en: 'You selected {plan}. Waiting for Lemon Squeezy confirmation.',
    pt: 'Você selecionou {plan}. Aguardando a confirmação do Lemon Squeezy.',
  },
  'bill.pendingShort': { es: 'Pendiente', en: 'Pending', pt: 'Pendente' },
  // Plan names, prices and feature copy now live in lib/plans (shared with the landing).

  // ── Plan gate (blocking screen shown to new signups) ────────────
  'gate.title': {
    es: 'Elegí tu plan para empezar',
    en: 'Choose your plan to get started',
    pt: 'Escolha seu plano para começar',
  },
  'gate.subtitle': {
    es: 'Creamos la cuenta «{name}». Activá un plan y entrás al panel.',
    en: 'We created the “{name}” account. Activate a plan and you’re in.',
    pt: 'Criamos a conta “{name}”. Ative um plano e entre no painel.',
  },
  'gate.trialNote': {
    es: 'Arrancás con la prueba gratis. Cancelás cuando quieras.',
    en: 'You start with the free trial. Cancel anytime.',
    pt: 'Você começa com o teste grátis. Cancele quando quiser.',
  },
  'gate.choose': {
    es: 'Empezar prueba',
    en: 'Start trial',
    pt: 'Começar teste',
  },
  'gate.opening': { es: 'Abriendo…', en: 'Opening…', pt: 'Abrindo…' },
  'gate.confirming': {
    es: 'Estamos confirmando tu pago. Puede tardar unos segundos…',
    en: 'We’re confirming your payment. This can take a few seconds…',
    pt: 'Estamos confirmando seu pagamento. Pode levar alguns segundos…',
  },
  'gate.recheck': {
    es: 'Ya pagué, verificar',
    en: 'I paid, check again',
    pt: 'Já paguei, verificar',
  },
  'gate.rechecking': {
    es: 'Verificando…',
    en: 'Checking…',
    pt: 'Verificando…',
  },
  'gate.recheckEmpty': {
    es: 'Todavía no nos llegó la confirmación del pago. Si acabás de pagar, esperá unos segundos y volvé a probar.',
    en: 'We haven’t received the payment confirmation yet. If you just paid, wait a few seconds and try again.',
    pt: 'Ainda não recebemos a confirmação do pagamento. Se você acabou de pagar, aguarde alguns segundos e tente de novo.',
  },
  'gate.ownerOnly': {
    es: 'Solo el dueño de la cuenta puede activar el plan. Pedile que lo haga para poder entrar.',
    en: 'Only the account owner can activate the plan. Ask them to do it so you can get in.',
    pt: 'Apenas o dono da conta pode ativar o plano. Peça a ele para que você possa entrar.',
  },
  'gate.expired': {
    es: 'Tu suscripción terminó. Elegí un plan para volver a entrar.',
    en: 'Your subscription ended. Choose a plan to get back in.',
    pt: 'Sua assinatura terminou. Escolha um plano para voltar a entrar.',
  },

  // ── Shared admin navigation ─────────────────────────────────────
  'top.openMenu': { es: 'Abrir menú', en: 'Open menu', pt: 'Abrir menu' },
  'side.expandSidebar': {
    es: 'Expandir barra lateral',
    en: 'Expand sidebar',
    pt: 'Expandir barra lateral',
  },
  'side.collapseSidebar': {
    es: 'Contraer barra lateral',
    en: 'Collapse sidebar',
    pt: 'Recolher barra lateral',
  },
  'side.copyPublicLink': {
    es: 'Copiar enlace público',
    en: 'Copy public link',
    pt: 'Copiar link público',
  },
  'side.linkCopied': {
    es: 'Enlace copiado',
    en: 'Link copied',
    pt: 'Link copiado',
  },
  'side.createMainList': {
    es: 'Crear lista principal',
    en: 'Create main list',
    pt: 'Criar lista principal',
  },
  'side.main': { es: 'PRINCIPAL', en: 'MAIN', pt: 'PRINCIPAL' },
  'side.settings': { es: 'AJUSTES', en: 'SETTINGS', pt: 'AJUSTES' },

  // ── Price lists ─────────────────────────────────────────────────
  'lists.subtitle': {
    es: 'Compartí precios distintos por cliente o canal.',
    en: 'Share different prices by customer or channel.',
    pt: 'Compartilhe preços diferentes por cliente ou canal.',
  },
  'lists.search': {
    es: 'Buscar listas…',
    en: 'Search lists…',
    pt: 'Buscar listas…',
  },
  'lists.noResults': {
    es: 'Sin resultados',
    en: 'No results',
    pt: 'Sem resultados',
  },
  'lists.emptyTitle': {
    es: 'Todavía no tenés listas',
    en: 'You do not have any lists yet',
    pt: 'Você ainda não tem listas',
  },
  'lists.emptyDescription': {
    es: 'Creá una lista principal para compartir tu catálogo.',
    en: 'Create a main list to share your catalog.',
    pt: 'Crie uma lista principal para compartilhar seu catálogo.',
  },
}
