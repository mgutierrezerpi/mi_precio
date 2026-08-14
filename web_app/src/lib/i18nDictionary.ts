import type { Lang } from './i18n'
import { DICT_EXTRA } from './i18nDictionaryExtra'
import { DICT_TOUR } from './i18nDictionaryTour'
import { DICT_SOCIALS } from './i18nDictionarySocials'
import { DICT_LEADS } from './i18nDictionaryLeads'

export type TranslationEntry = Record<Lang, string>

const DICT_BASE: Record<string, TranslationEntry> = {
  // ── Common ──────────────────────────────────────────────────────
  'common.search': { es: 'Buscar…', en: 'Search…', pt: 'Buscar…' },
  'common.save': {
    es: 'Guardar cambios',
    en: 'Save changes',
    pt: 'Salvar alterações',
  },
  'gate.logout': { es: 'Salir', en: 'Log out', pt: 'Sair' },

  'set.delete.subtitle': {
    es: 'Acción permanente e irreversible.',
    en: 'Permanent and irreversible action.',
    pt: 'Ação permanente e irreversível.',
  },
  'set.delete.warning': {
    es: 'Se eliminará tu cuenta «{name}» con todos sus productos, listas, clientes, ventas y miembros del equipo. Esta acción no se puede deshacer.',
    en: 'Your account “{name}” will be deleted with all its products, lists, customers, sales and team members. This cannot be undone.',
    pt: 'Sua conta “{name}” será excluída com todos os produtos, listas, clientes, vendas e membros da equipe. Isso não pode ser desfeito.',
  },
  'set.delete.confirm': {
    es: 'Escribí «{keyword}» para confirmar',
    en: 'Type “{keyword}” to confirm',
    pt: 'Digite “{keyword}” para confirmar',
  },
  'set.delete.button': {
    es: 'Eliminar mi cuenta',
    en: 'Delete my account',
    pt: 'Excluir minha conta',
  },
  'set.delete.deleting': {
    es: 'Eliminando…',
    en: 'Deleting…',
    pt: 'Excluindo…',
  },
  'set.delete.ownerOnly': {
    es: 'Solo el dueño de la cuenta puede eliminarla.',
    en: 'Only the account owner can delete it.',
    pt: 'Apenas o dono da conta pode excluí-la.',
  },

  // ── Public list ─────────────────────────────────────────────────
  'pub.edition': {
    es: 'EDICIÓN Nº {n}',
    en: 'EDITION Nº {n}',
    pt: 'EDIÇÃO Nº {n}',
  },
  'pub.public': { es: 'PÚBLICA', en: 'PUBLIC', pt: 'PÚBLICA' },
  'pub.updated': {
    es: 'Actualizada {date}',
    en: 'Updated {date}',
    pt: 'Atualizada {date}',
  },
  'pub.share': { es: 'Compartir', en: 'Share', pt: 'Compartilhar' },
  'pub.copied': { es: 'Copiado ✓', en: 'Copied ✓', pt: 'Copiado ✓' },
  'pub.titleA': { es: 'Lista de', en: 'Price', pt: 'Lista de' },
  'pub.titleB': { es: 'precios.', en: 'list.', pt: 'preços.' },
  'pub.intro': {
    es: '{listPrefix}Catálogo público de {name}. Escaneá el QR o compartí el link para ver siempre la última versión, con precios actualizados al instante.',
    en: '{listPrefix}Public catalog of {name}. Scan the QR or share the link to always see the latest version, with prices updated instantly.',
    pt: '{listPrefix}Catálogo público de {name}. Escaneie o QR ou compartilhe o link para ver sempre a última versão, com preços atualizados na hora.',
  },
  'pub.issuedBy': { es: 'EMITIDO POR', en: 'ISSUED BY', pt: 'EMITIDO POR' },
  'pub.taxId': { es: 'RUT', en: 'TAX ID', pt: 'CNPJ' },
  'pub.catalog': { es: 'CATÁLOGO', en: 'CATALOG', pt: 'CATÁLOGO' },
  'pub.updatedLabel': { es: 'ACTUALIZADO', en: 'UPDATED', pt: 'ATUALIZADO' },
  'pub.currency': { es: 'MONEDA', en: 'CURRENCY', pt: 'MOEDA' },
  'pub.allLists': {
    es: 'Todas las listas',
    en: 'All lists',
    pt: 'Todas as listas',
  },
  'pub.all': { es: 'Todos', en: 'All', pt: 'Todos' },
  'pub.search': { es: 'Buscar…', en: 'Search…', pt: 'Buscar…' },
  'pub.empty': {
    es: 'No hay productos publicados.',
    en: 'No published products yet.',
    pt: 'Nenhum produto publicado.',
  },
  'pub.product': { es: 'producto', en: 'product', pt: 'produto' },
  'pub.products': { es: 'productos', en: 'products', pt: 'produtos' },
  'pub.from': { es: 'DESDE', en: 'FROM', pt: 'DESDE' },
  'pub.to': { es: 'HASTA', en: 'TO', pt: 'ATÉ' },
  'pub.footer': {
    es: 'Precios en {currency} · Generado con MiPrecio',
    en: 'Prices in {currency} · Made with MiPrecio',
    pt: 'Preços em {currency} · Gerado com MiPrecio',
  },
  'pub.notFound': {
    es: 'Lista no encontrada',
    en: 'List not found',
    pt: 'Lista não encontrada',
  },
  'pub.backHome': {
    es: 'Volver al inicio',
    en: 'Back to home',
    pt: 'Voltar ao início',
  },
  // Public list view modes (compact = read-only price list, full = storefront with cart)
  'pub.viewFull': { es: 'Completa', en: 'Full', pt: 'Completa' },
  'pub.viewCompact': { es: 'Compacta', en: 'Compact', pt: 'Compacta' },
  'pub.add': { es: 'Agregar', en: 'Add', pt: 'Adicionar' },
  'pub.cartTitle': { es: 'TU PEDIDO', en: 'YOUR ORDER', pt: 'SEU PEDIDO' },
  'pub.cartSummary': {
    es: '{n} {unit} · {total}',
    en: '{n} {unit} · {total}',
    pt: '{n} {unit} · {total}',
  },
  'pub.cartWhatsApp': {
    es: 'Pedir por WhatsApp',
    en: 'Order via WhatsApp',
    pt: 'Pedir por WhatsApp',
  },
  'pub.cartClear': { es: 'Vaciar', en: 'Clear', pt: 'Limpar' },
  'pub.cartHeading': {
    es: 'Hola! Quisiera pedir:',
    en: "Hi! I'd like to order:",
    pt: 'Olá! Gostaria de pedir:',
  },
  // Storefront (full) view
  'store.myCart': { es: 'Mi carrito', en: 'My cart', pt: 'Meu carrinho' },
  'store.badge': {
    es: 'CATÁLOGO ACTUALIZADO',
    en: 'UPDATED CATALOG',
    pt: 'CATÁLOGO ATUALIZADO',
  },
  'store.heroTitle': {
    es: 'El catálogo de {name}, siempre al día.',
    en: "{name}'s catalog, always up to date.",
    pt: 'O catálogo de {name}, sempre atualizado.',
  },
  'store.heroSub': {
    es: 'Comprá mayorista o minorista. Precios y stock siempre actualizados.',
    en: 'Buy wholesale or retail. Prices and stock always up to date.',
    pt: 'Compre atacado ou varejo. Preços e estoque sempre atualizados.',
  },
  'store.statProducts': { es: 'Productos', en: 'Products', pt: 'Produtos' },
  'store.statShipping': {
    es: 'Pedidos por WhatsApp',
    en: 'WhatsApp orders',
    pt: 'Pedidos por WhatsApp',
  },
  'store.statUpdated': { es: 'Actualizado', en: 'Updated', pt: 'Atualizado' },
  'store.featured': { es: 'Destacado', en: 'Featured', pt: 'Destaque' },
  'store.searchPh': {
    es: 'Buscar productos, marcas o códigos…',
    en: 'Search products, brands or codes…',
    pt: 'Buscar produtos, marcas ou códigos…',
  },
  'store.allProducts': {
    es: 'Todos los productos',
    en: 'All products',
    pt: 'Todos os produtos',
  },
  'store.filters': { es: 'Filtros', en: 'Filters', pt: 'Filtros' },
  'store.clear': { es: 'Limpiar', en: 'Clear', pt: 'Limpar' },
  'store.categories': { es: 'CATEGORÍAS', en: 'CATEGORIES', pt: 'CATEGORIAS' },
  'store.showing': {
    es: 'Mostrando {n} de {total} productos',
    en: 'Showing {n} of {total} products',
    pt: 'Mostrando {n} de {total} produtos',
  },
  'store.other': { es: 'Otros', en: 'Other', pt: 'Outros' },
  'store.waTitle': {
    es: 'Pedí por WhatsApp',
    en: 'Order via WhatsApp',
    pt: 'Peça por WhatsApp',
  },
  'store.waSub': {
    es: 'Te respondemos en menos de 1 hora.',
    en: 'We reply in under an hour.',
    pt: 'Respondemos em menos de 1 hora.',
  },
  'store.waBtn': {
    es: 'Enviar mensaje',
    en: 'Send message',
    pt: 'Enviar mensagem',
  },
  // Cart page
  'store.keepShopping': {
    es: 'Seguir comprando',
    en: 'Keep shopping',
    pt: 'Continuar comprando',
  },
  'store.catalog': { es: 'Catálogo', en: 'Catalog', pt: 'Catálogo' },
  'store.yourCart': { es: 'Tu carrito', en: 'Your cart', pt: 'Seu carrinho' },
  'store.cartReview': {
    es: 'Revisá tu pedido antes de enviarlo por WhatsApp.',
    en: 'Review your order before sending it via WhatsApp.',
    pt: 'Revise seu pedido antes de enviá-lo pelo WhatsApp.',
  },
  'store.cartClear': {
    es: 'Vaciar carrito',
    en: 'Empty cart',
    pt: 'Esvaziar carrinho',
  },
  'store.cartProducts': {
    es: 'Productos en tu carrito',
    en: 'Products in your cart',
    pt: 'Produtos no seu carrinho',
  },
  'store.each': { es: 'c/u', en: 'each', pt: 'cada' },
  'store.cartRemove': { es: 'Quitar', en: 'Remove', pt: 'Remover' },
  'store.cartSubtotalN': {
    es: 'Subtotal ({n} productos):',
    en: 'Subtotal ({n} items):',
    pt: 'Subtotal ({n} produtos):',
  },
  'store.cartYourData': {
    es: 'Tus datos',
    en: 'Your details',
    pt: 'Seus dados',
  },
  'store.cartYourDataSub': {
    es: 'El comerciante te contactará por WhatsApp para coordinar la entrega y el pago.',
    en: 'The seller will contact you on WhatsApp to arrange delivery and payment.',
    pt: 'O vendedor entrará em contato pelo WhatsApp para combinar a entrega e o pagamento.',
  },
  'store.cartName': {
    es: 'Nombre completo',
    en: 'Full name',
    pt: 'Nome completo',
  },
  'store.cartNamePh': { es: 'Tu nombre', en: 'Your name', pt: 'Seu nome' },
  'store.cartPhone': {
    es: 'Teléfono / WhatsApp',
    en: 'Phone / WhatsApp',
    pt: 'Telefone / WhatsApp',
  },
  'store.cartPhonePh': {
    es: '+598 99 123 456',
    en: '+1 555 123 456',
    pt: '+55 11 91234 5678',
  },
  'store.cartEmail': {
    es: 'Email (opcional)',
    en: 'Email (optional)',
    pt: 'Email (opcional)',
  },
  'store.cartEmailPh': {
    es: 'tu@email.com',
    en: 'you@email.com',
    pt: 'voce@email.com',
  },
  'store.cartDelivery': {
    es: 'Tipo de entrega',
    en: 'Delivery type',
    pt: 'Tipo de entrega',
  },
  'store.cartPickup': {
    es: 'Retiro en el local',
    en: 'Pickup in store',
    pt: 'Retirada na loja',
  },
  'store.cartShipping': {
    es: 'Envío a domicilio',
    en: 'Home delivery',
    pt: 'Entrega em domicílio',
  },
  'store.cartAddress': { es: 'Dirección', en: 'Address', pt: 'Endereço' },
  'store.cartAddressPh': {
    es: 'Calle, número, apto, ciudad',
    en: 'Street, number, apt, city',
    pt: 'Rua, número, apto, cidade',
  },
  'store.cartNotes': {
    es: 'Notas para el comerciante (opcional)',
    en: 'Notes for the seller (optional)',
    pt: 'Notas para o vendedor (opcional)',
  },
  'store.cartNotesPh': {
    es: 'Por ejemplo: necesito factura, prefiero entrega en la tarde, etc.',
    en: 'E.g.: I need an invoice, I prefer afternoon delivery, etc.',
    pt: 'Ex.: preciso de nota fiscal, prefiro entrega à tarde, etc.',
  },
  'store.cartSummary': {
    es: 'Resumen del pedido',
    en: 'Order summary',
    pt: 'Resumo do pedido',
  },
  'store.cartPricesIn': {
    es: 'Todos los precios en {currency}.',
    en: 'All prices in {currency}.',
    pt: 'Todos os preços em {currency}.',
  },
  'store.cartSubtotal': { es: 'Subtotal', en: 'Subtotal', pt: 'Subtotal' },
  'store.cartTotal': { es: 'Total', en: 'Total', pt: 'Total' },
  'store.cartSend': {
    es: 'Enviar pedido por WhatsApp',
    en: 'Send order via WhatsApp',
    pt: 'Enviar pedido pelo WhatsApp',
  },
  'store.cartTrust': {
    es: 'Tu información no se comparte. El envío es directo a WhatsApp.',
    en: 'Your info is not shared. It goes straight to WhatsApp.',
    pt: 'Suas informações não são compartilhadas. Vai direto para o WhatsApp.',
  },
  'store.cartEmptyTitle': {
    es: 'Tu carrito está vacío',
    en: 'Your cart is empty',
    pt: 'Seu carrinho está vazio',
  },
  'store.cartEmptySub': {
    es: 'Agregá productos del catálogo para armar tu pedido.',
    en: 'Add products from the catalog to build your order.',
    pt: 'Adicione produtos do catálogo para montar seu pedido.',
  },
  'common.saving': { es: 'Guardando…', en: 'Saving…', pt: 'Salvando…' },
  'common.saved': { es: 'Guardado ✓', en: 'Saved ✓', pt: 'Salvo ✓' },
  'common.remove': { es: 'Quitar', en: 'Remove', pt: 'Remover' },
  'role.owner': { es: 'Dueño', en: 'Owner', pt: 'Dono' },
  'role.admin': { es: 'Admin', en: 'Admin', pt: 'Admin' },
  'role.editor': { es: 'Editor', en: 'Editor', pt: 'Editor' },
  'role.viewer': { es: 'Lector', en: 'Viewer', pt: 'Leitor' },

  // ── Sidebar ─────────────────────────────────────────────────────
  'nav.home': { es: 'Inicio', en: 'Home', pt: 'Início' },
  'nav.products': { es: 'Productos', en: 'Products', pt: 'Produtos' },
  'nav.lists': {
    es: 'Listas de precios',
    en: 'Price lists',
    pt: 'Listas de preços',
  },
  'nav.qr': { es: 'Códigos QR', en: 'QR codes', pt: 'Códigos QR' },
  'nav.customers': { es: 'Clientes', en: 'Customers', pt: 'Clientes' },
  'nav.reports': { es: 'Reportes', en: 'Reports', pt: 'Relatórios' },
  'nav.team': { es: 'Equipo', en: 'Team', pt: 'Equipe' },
  'nav.settings': { es: 'Configuración', en: 'Settings', pt: 'Configurações' },
  'nav.support': { es: 'Soporte', en: 'Support', pt: 'Suporte' },
  'side.crm': {
    es: 'CRM · Comercial',
    en: 'CRM · Sales',
    pt: 'CRM · Comercial',
  },
  'side.main': { es: 'PRINCIPAL', en: 'MAIN', pt: 'PRINCIPAL' },
  'side.settings': { es: 'AJUSTES', en: 'SETTINGS', pt: 'AJUSTES' },
  'side.planTag': { es: 'Plan {plan}', en: '{plan} plan', pt: 'Plano {plan}' },
  'side.upgradeTitle': {
    es: 'Subí a {plan}',
    en: 'Upgrade to {plan}',
    pt: 'Assine o {plan}',
  },
  'side.upgradeDesc.micro': {
    es: 'Lista simple, QR y primeros productos.',
    en: 'Simple list, QR and first products.',
    pt: 'Lista simples, QR e primeiros produtos.',
  },
  'side.upgradeDesc.plus': {
    es: 'Más productos, listas y multiusuario.',
    en: 'More products, lists and multi-user.',
    pt: 'Mais produtos, listas e multiusuário.',
  },
  'side.upgradeDesc.pro': {
    es: 'Multimoneda, importación masiva y usuarios ilimitados.',
    en: 'Multi-currency, bulk import and unlimited users.',
    pt: 'Multimoeda, importação em massa e usuários ilimitados.',
  },
  'side.viewPlans': { es: 'Ver planes', en: 'View plans', pt: 'Ver planos' },

  // ── Topbar / notifications ──────────────────────────────────────
  'top.lightMode': { es: 'Modo claro', en: 'Light mode', pt: 'Modo claro' },
  'top.darkMode': { es: 'Modo oscuro', en: 'Dark mode', pt: 'Modo escuro' },
  'top.compactView': {
    es: 'Vista compacta',
    en: 'Compact view',
    pt: 'Visão compacta',
  },
  'top.fullView': {
    es: 'Vista completa',
    en: 'Full view',
    pt: 'Visão completa',
  },

  'notif.title': {
    es: 'Notificaciones',
    en: 'Notifications',
    pt: 'Notificações',
  },
  'notif.live': { es: 'En vivo', en: 'Live', pt: 'Ao vivo' },
  'notif.empty': {
    es: 'No hay notificaciones todavía.',
    en: 'No notifications yet.',
    pt: 'Nenhuma notificação ainda.',
  },
  'notif.prefs': {
    es: 'Preferencias de notificaciones',
    en: 'Notification preferences',
    pt: 'Preferências de notificações',
  },

  // ── Activity feed (rebuilt client-side from action + meta; falls back to the
  //    stored Spanish summary for pre-i18n rows or unknown actions) ──────────
  'activity.product.created': {
    es: 'Agregó el producto «{name}»',
    en: 'Added product “{name}”',
    pt: 'Adicionou o produto «{name}»',
  },
  'activity.product.deleted': {
    es: 'Eliminó el producto «{name}»',
    en: 'Deleted product “{name}”',
    pt: 'Excluiu o produto «{name}»',
  },
  'activity.list.created': {
    es: 'Creó la lista «{name}»',
    en: 'Created list “{name}”',
    pt: 'Criou a lista «{name}»',
  },
  'activity.list.published': {
    es: 'Publicó la lista «{name}»',
    en: 'Published list “{name}”',
    pt: 'Publicou a lista «{name}»',
  },
  'activity.customer.created': {
    es: 'Agregó el cliente «{name}»',
    en: 'Added customer “{name}”',
    pt: 'Adicionou o cliente «{name}»',
  },
  'activity.order.created': {
    es: 'Registró una compra de «{customer}» por {currency} {total}',
    en: 'Recorded a purchase from “{customer}” for {currency} {total}',
    pt: 'Registrou uma compra de «{customer}» por {currency} {total}',
  },
  'activity.member.invited': {
    es: 'Invitó a «{email}» como {role}',
    en: 'Invited “{email}” as {role}',
    pt: 'Convidou «{email}» como {role}',
  },
  'activity.member.role_changed': {
    es: 'Cambió el rol de «{email}» a {role}',
    en: 'Changed “{email}” role to {role}',
    pt: 'Alterou a função de «{email}» para {role}',
  },
  'activity.member.removed': {
    es: 'Quitó a «{email}» del equipo',
    en: 'Removed “{email}” from the team',
    pt: 'Removeu «{email}» da equipe',
  },
  'activity.plan.changed': {
    es: 'Cambió el plan a {plan}',
    en: 'Changed plan to {plan}',
    pt: 'Alterou o plano para {plan}',
  },
  'activity.billing.manual_sync': {
    es: 'Sincronizó el plan {plan} ({status})',
    en: 'Synced plan {plan} ({status})',
    pt: 'Sincronizou o plano {plan} ({status})',
  },
  // `event` + `plan` are localized from meta (billingEvent.*/plan). Rows without
  // meta.event fall back to the stored summary (see activityText).
  'activity.billing.webhook': {
    es: '{event} · plan {plan}',
    en: '{event} · {plan} plan',
    pt: '{event} · plano {plan}',
  },
  // Lemon Squeezy event labels.
  'billingEvent.subscription_created': {
    es: 'Suscripción iniciada',
    en: 'Subscription started',
    pt: 'Assinatura iniciada',
  },
  'billingEvent.subscription_updated': {
    es: 'Suscripción actualizada',
    en: 'Subscription updated',
    pt: 'Assinatura atualizada',
  },
  'billingEvent.subscription_cancelled': {
    es: 'Suscripción cancelada',
    en: 'Subscription cancelled',
    pt: 'Assinatura cancelada',
  },
  'billingEvent.subscription_resumed': {
    es: 'Suscripción reanudada',
    en: 'Subscription resumed',
    pt: 'Assinatura retomada',
  },
  'billingEvent.subscription_expired': {
    es: 'Suscripción vencida',
    en: 'Subscription expired',
    pt: 'Assinatura expirada',
  },
  'billingEvent.subscription_paused': {
    es: 'Suscripción pausada',
    en: 'Subscription paused',
    pt: 'Assinatura pausada',
  },
  'billingEvent.subscription_unpaused': {
    es: 'Suscripción reactivada',
    en: 'Subscription unpaused',
    pt: 'Assinatura reativada',
  },
  'billingEvent.subscription_payment_success': {
    es: 'Pago confirmado',
    en: 'Payment confirmed',
    pt: 'Pagamento confirmado',
  },
  'billingEvent.subscription_payment_failed': {
    es: 'Pago rechazado',
    en: 'Payment failed',
    pt: 'Pagamento recusado',
  },
  'billingEvent.subscription_payment_recovered': {
    es: 'Pago recuperado',
    en: 'Payment recovered',
    pt: 'Pagamento recuperado',
  },
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
  'set.brand.desc': {
    es: 'Descripción del negocio',
    en: 'Business description',
    pt: 'Descrição do negócio',
  },
  'set.brand.descPlaceholder': {
    es: 'Contale a tus clientes qué vendés…',
    en: 'Tell your customers what you sell…',
    pt: 'Conte aos seus clientes o que você vende…',
  },
  'set.brand.preview': {
    es: 'Vista previa',
    en: 'Preview',
    pt: 'Pré-visualização',
  },
  'set.brand.previewBiz': {
    es: 'Tu negocio',
    en: 'Your business',
    pt: 'Seu negócio',
  },
  'set.brand.previewCat': {
    es: 'Catálogo público',
    en: 'Public catalog',
    pt: 'Catálogo público',
  },

  'set.design.title': {
    es: 'Diseño de la lista',
    en: 'List design',
    pt: 'Design da lista',
  },
  'set.design.subtitle': {
    es: 'Es el diseño por defecto: lo usan las listas que no eligieron uno propio.',
    en: 'This is the default design: used by every list that hasn’t picked its own.',
    pt: 'É o design padrão: usado por toda lista que não escolheu o seu.',
  },
  'set.design.store.name': { es: 'Tienda', en: 'Store', pt: 'Loja' },
  'set.design.store.desc': {
    es: 'Catálogo tipo e-commerce con fotos, filtros y carrito.',
    en: 'E-commerce catalog with photos, filters and cart.',
    pt: 'Catálogo tipo e-commerce com fotos, filtros e carrinho.',
  },
  'set.design.classic.name': {
    es: 'Lista clásica',
    en: 'Classic list',
    pt: 'Lista clássica',
  },
  'set.design.classic.desc': {
    es: 'Lista de precios prolija por categorías.',
    en: 'Tidy price list grouped by category.',
    pt: 'Lista de preços organizada por categoria.',
  },
  'set.design.nordic.name': {
    es: 'Menú nórdico',
    en: 'Nordic menu',
    pt: 'Menu nórdico',
  },
  'set.design.nordic.desc': {
    es: 'Papel claro, tipografía serif, estilo carta.',
    en: 'Light paper, serif type, menu style.',
    pt: 'Papel claro, tipografia serifada, estilo cardápio.',
  },
  'set.design.fine.name': {
    es: 'Fine dining',
    en: 'Fine dining',
    pt: 'Fine dining',
  },
  'set.design.fine.desc': {
    es: 'Elegante y oscuro, con detalles dorados.',
    en: 'Elegant and dark, with gold accents.',
    pt: 'Elegante e escuro, com detalhes dourados.',
  },
  'set.design.modern.name': {
    es: 'Marca moderna',
    en: 'Modern brand',
    pt: 'Marca moderna',
  },
  'set.design.modern.desc': {
    es: 'Blanco, tipografía grande y franja de color.',
    en: 'White, bold type and a color band.',
    pt: 'Branco, tipografia grande e faixa de cor.',
  },
  'set.design.photo.name': {
    es: 'Lookbook con fotos',
    en: 'Photo lookbook',
    pt: 'Lookbook com fotos',
  },
  'set.design.photo.desc': {
    es: 'Oscuro y visual, con fotos de tus productos.',
    en: 'Dark and visual, with your product photos.',
    pt: 'Escuro e visual, com fotos dos seus produtos.',
  },
  'set.design.cards.name': {
    es: 'Tarjetas de precios',
    en: 'Price cards',
    pt: 'Cartões de preços',
  },
  'set.design.cards.desc': {
    es: 'Cuadrícula de tarjetas, ideal para servicios.',
    en: 'Grid of cards, great for services.',
    pt: 'Grade de cartões, ideal para serviços.',
  },
  'set.design.catalog.name': {
    es: 'Catálogo con imágenes',
    en: 'Image catalog',
    pt: 'Catálogo com imagens',
  },
  'set.design.catalog.desc': {
    es: 'Header oscuro y grilla de productos con fotos.',
    en: 'Dark header and product grid with photos.',
    pt: 'Cabeçalho escuro e grade de produtos com fotos.',
  },
  'set.design.tech.name': { es: 'Tech', en: 'Tech', pt: 'Tech' },
  'set.design.tech.desc': {
    es: 'Oscuro y moderno, con grilla y precios monoespaciados.',
    en: 'Dark and modern, with a grid and monospaced prices.',
    pt: 'Escuro e moderno, com grade e preços monoespaçados.',
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
    es: 'Las notificaciones aparecen dentro de la app (campana arriba a la derecha) y, si las activás abajo, también en tu escritorio o celular.',
    en: 'Notifications appear inside the app (bell, top right) and, if you enable them below, on your desktop or phone too.',
    pt: 'As notificações aparecem dentro do app (sino, canto superior direito) e, se ativá-las abaixo, também no seu desktop ou celular.',
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
  'set.notif.denied': {
    es: 'Las notificaciones están bloqueadas. Activalas en los permisos del navegador.',
    en: 'Notifications are blocked. Enable them in your browser permissions.',
    pt: 'As notificações estão bloqueadas. Ative-as nas permissões do navegador.',
  },
  'set.notif.unsupported': {
    es: 'Este navegador no admite notificaciones push.',
    en: 'This browser does not support push notifications.',
    pt: 'Este navegador não suporta notificações push.',
  },

  'set.region.subtitle': {
    es: 'Moneda, idioma y zona horaria de tu cuenta.',
    en: 'Your account currency, language and time zone.',
    pt: 'Moeda, idioma e fuso horário da sua conta.',
  },
  'set.region.currency': { es: 'Moneda', en: 'Currency', pt: 'Moeda' },
  'set.region.language': { es: 'Idioma', en: 'Language', pt: 'Idioma' },
  'set.region.timezone': {
    es: 'Zona horaria',
    en: 'Time zone',
    pt: 'Fuso horário',
  },
  'set.region.delivery': {
    es: 'Ofrecés envío a domicilio',
    en: 'You offer home delivery',
    pt: 'Você oferece entrega em domicílio',
  },
  'set.marketplace.title': {
    es: 'Mostrar mi negocio en el marketplace',
    en: 'Show my business in the marketplace',
    pt: 'Mostrar meu negócio no marketplace',
  },
  'set.marketplace.subtitle': {
    es: 'Las personas podrán descubrir tu negocio. Si compartís tu ubicación, aparecerá ordenado por distancia.',
    en: 'People can discover your business. If you share your location, it will be ordered by distance.',
    pt: 'As pessoas poderão descobrir seu negócio. Se você compartilhar sua localização, ele aparecerá ordenado por distância.',
  },
  'set.marketplace.enable': { es: 'Activar', en: 'Enable', pt: 'Ativar' },
  'set.marketplace.disable': { es: 'Desactivar', en: 'Disable', pt: 'Desativar' },
  'set.marketplace.listed': { es: 'Tu negocio está visible en el marketplace.', en: 'Your business is visible in the marketplace.', pt: 'Seu negócio está visível no marketplace.' },
  'set.marketplace.hidden': { es: 'Tu negocio no está visible.', en: 'Your business is not visible.', pt: 'Seu negócio não está visível.' },
  'set.marketplace.noLocation': { es: 'Este navegador no puede compartir tu ubicación.', en: 'This browser cannot share your location.', pt: 'Este navegador não pode compartilhar sua localização.' },
  'set.marketplace.locationDenied': { es: 'Necesitamos permiso de ubicación para mostrar tu negocio cerca de las personas.', en: 'Location permission is required to show your business nearby.', pt: 'A permissão de localização é necessária para mostrar seu negócio nas proximidades.' },
}
export const DICT = {
  ...DICT_BASE,
  ...DICT_EXTRA,
  ...DICT_TOUR,
  ...DICT_SOCIALS,
  ...DICT_LEADS,
}
