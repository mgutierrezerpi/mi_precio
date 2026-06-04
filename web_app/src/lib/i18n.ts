import { useAppSelector } from '../store/hooks'
import { selectTenant } from '../store/slices/authSlice'

export type Lang = 'es' | 'en' | 'pt'

export function normalizeLang(l?: string | null): Lang {
  return l === 'en' || l === 'pt' ? l : 'es'
}

/** Intl locale for date/number formatting per app language. */
export function localeOf(l?: string | null): string {
  return ({ es: 'es-AR', en: 'en-US', pt: 'pt-BR' } as const)[normalizeLang(l)]
}

type Entry = Record<Lang, string>

// Translation dictionary. Keys are dot-namespaced by surface.
const DICT: Record<string, Entry> = {
  // ── Common ──────────────────────────────────────────────────────
  'common.search': { es: 'Buscar…', en: 'Search…', pt: 'Buscar…' },
  'common.save': { es: 'Guardar cambios', en: 'Save changes', pt: 'Salvar alterações' },
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
  'nav.lists': { es: 'Listas de precios', en: 'Price lists', pt: 'Listas de preços' },
  'nav.qr': { es: 'Códigos QR', en: 'QR codes', pt: 'Códigos QR' },
  'nav.customers': { es: 'Clientes', en: 'Customers', pt: 'Clientes' },
  'nav.reports': { es: 'Reportes', en: 'Reports', pt: 'Relatórios' },
  'nav.team': { es: 'Equipo', en: 'Team', pt: 'Equipe' },
  'nav.settings': { es: 'Configuración', en: 'Settings', pt: 'Configurações' },
  'side.crm': { es: 'CRM · Comercial', en: 'CRM · Sales', pt: 'CRM · Comercial' },
  'side.main': { es: 'PRINCIPAL', en: 'MAIN', pt: 'PRINCIPAL' },
  'side.settings': { es: 'AJUSTES', en: 'SETTINGS', pt: 'AJUSTES' },
  'side.planTag': { es: 'Plan {plan}', en: '{plan} plan', pt: 'Plano {plan}' },
  'side.upgradeTitle': { es: 'Subí a {plan}', en: 'Upgrade to {plan}', pt: 'Assine o {plan}' },
  'side.upgradeDesc.pyme': { es: 'Productos ilimitados y multiusuario.', en: 'Unlimited products and multi-user.', pt: 'Produtos ilimitados e multiusuário.' },
  'side.upgradeDesc.pro': { es: 'Multimoneda, importación masiva y usuarios ilimitados.', en: 'Multi-currency, bulk import and unlimited users.', pt: 'Multimoeda, importação em massa e usuários ilimitados.' },
  'side.viewPlans': { es: 'Ver planes', en: 'View plans', pt: 'Ver planos' },

  // ── Topbar / notifications ──────────────────────────────────────
  'top.lightMode': { es: 'Modo claro', en: 'Light mode', pt: 'Modo claro' },
  'top.darkMode': { es: 'Modo oscuro', en: 'Dark mode', pt: 'Modo escuro' },
  'notif.title': { es: 'Notificaciones', en: 'Notifications', pt: 'Notificações' },
  'notif.live': { es: 'En vivo', en: 'Live', pt: 'Ao vivo' },
  'notif.empty': { es: 'No hay notificaciones todavía.', en: 'No notifications yet.', pt: 'Nenhuma notificação ainda.' },
  'notif.prefs': { es: 'Preferencias de notificaciones', en: 'Notification preferences', pt: 'Preferências de notificações' },

  // ── Settings ────────────────────────────────────────────────────
  'set.subtitle': { es: 'Administrá los datos y preferencias de tu cuenta.', en: 'Manage your account data and preferences.', pt: 'Gerencie os dados e preferências da sua conta.' },
  'set.onlyAdmins': { es: 'Solo los administradores pueden editar la configuración de la cuenta.', en: 'Only admins can edit account settings.', pt: 'Apenas administradores podem editar as configurações da conta.' },
  'set.sec.info': { es: 'Información de la empresa', en: 'Company information', pt: 'Informações da empresa' },
  'set.sec.brand': { es: 'Marca y apariencia', en: 'Brand & appearance', pt: 'Marca e aparência' },
  'set.sec.notifications': { es: 'Notificaciones', en: 'Notifications', pt: 'Notificações' },
  'set.sec.region': { es: 'Idioma y región', en: 'Language & region', pt: 'Idioma e região' },
  'set.sec.security': { es: 'Seguridad', en: 'Security', pt: 'Segurança' },
  'set.sec.billing': { es: 'Plan y facturación', en: 'Plan & billing', pt: 'Plano e faturamento' },
  'set.sec.delete': { es: 'Eliminar cuenta', en: 'Delete account', pt: 'Excluir conta' },

  'set.info.subtitle': { es: 'El nombre, el logo y la dirección pública de tu catálogo.', en: 'Your catalog name, logo and public address.', pt: 'O nome, o logo e o endereço público do seu catálogo.' },
  'set.info.logo': { es: 'Logo', en: 'Logo', pt: 'Logo' },
  'set.info.uploadLogo': { es: 'Subir logo', en: 'Upload logo', pt: 'Enviar logo' },
  'set.info.changeLogo': { es: 'Cambiar logo', en: 'Change logo', pt: 'Trocar logo' },
  'set.info.name': { es: 'Nombre del negocio', en: 'Business name', pt: 'Nome do negócio' },
  'set.info.subdomain': { es: 'Subdominio', en: 'Subdomain', pt: 'Subdomínio' },
  'set.info.taxId': { es: 'RUT / Identificación fiscal', en: 'Tax ID', pt: 'CNPJ / Identificação fiscal' },
  'set.info.publicUrl': { es: 'Dirección pública', en: 'Public address', pt: 'Endereço público' },

  'set.brand.subtitle': { es: 'Estos elementos aparecen en tu lista pública. El logo se configura en «Información de la empresa».', en: 'These appear on your public list. The logo is set in “Company information”.', pt: 'Estes aparecem na sua lista pública. O logo é configurado em “Informações da empresa”.' },
  'set.brand.color': { es: 'Color de marca', en: 'Brand color', pt: 'Cor da marca' },
  'set.brand.desc': { es: 'Descripción del negocio', en: 'Business description', pt: 'Descrição do negócio' },
  'set.brand.descPlaceholder': { es: 'Contale a tus clientes qué vendés…', en: 'Tell your customers what you sell…', pt: 'Conte aos seus clientes o que você vende…' },
  'set.brand.preview': { es: 'Vista previa', en: 'Preview', pt: 'Pré-visualização' },
  'set.brand.previewBiz': { es: 'Tu negocio', en: 'Your business', pt: 'Seu negócio' },
  'set.brand.previewCat': { es: 'Catálogo público', en: 'Public catalog', pt: 'Catálogo público' },

  'set.notif.subtitle': { es: 'Elegí qué te avisa la campana de la barra superior.', en: 'Choose what the topbar bell notifies you about.', pt: 'Escolha o que o sino da barra superior avisa.' },
  'set.notif.banner': { es: 'Las notificaciones aparecen dentro de la app (campana arriba a la derecha). El envío por email llegará más adelante.', en: 'Notifications appear inside the app (bell, top right). Email delivery is coming later.', pt: 'As notificações aparecem dentro do app (sino, canto superior direito). O envio por e-mail virá mais adiante.' },
  'set.notif.sales': { es: 'Ventas', en: 'Sales', pt: 'Vendas' },
  'set.notif.salesDesc': { es: 'Cuando se registra una compra.', en: 'When a purchase is recorded.', pt: 'Quando uma compra é registrada.' },
  'set.notif.catalog': { es: 'Catálogo', en: 'Catalog', pt: 'Catálogo' },
  'set.notif.catalogDesc': { es: 'Altas, bajas y publicaciones de productos y listas.', en: 'Product and list additions, removals and publishing.', pt: 'Inclusões, exclusões e publicações de produtos e listas.' },
  'set.notif.customers': { es: 'Clientes', en: 'Customers', pt: 'Clientes' },
  'set.notif.customersDesc': { es: 'Cuando se agrega un cliente nuevo.', en: 'When a new customer is added.', pt: 'Quando um novo cliente é adicionado.' },
  'set.notif.team': { es: 'Equipo', en: 'Team', pt: 'Equipe' },
  'set.notif.teamDesc': { es: 'Invitaciones y cambios de rol.', en: 'Invitations and role changes.', pt: 'Convites e mudanças de função.' },

  'set.region.subtitle': { es: 'Moneda, idioma y zona horaria de tu cuenta.', en: 'Your account currency, language and time zone.', pt: 'Moeda, idioma e fuso horário da sua conta.' },
  'set.region.currency': { es: 'Moneda', en: 'Currency', pt: 'Moeda' },
  'set.region.language': { es: 'Idioma', en: 'Language', pt: 'Idioma' },
  'set.region.timezone': { es: 'Zona horaria', en: 'Time zone', pt: 'Fuso horário' },

  'set.security.subtitle': { es: 'Tu acceso a la cuenta.', en: 'Your account access.', pt: 'Seu acesso à conta.' },
  'set.security.passwordless': { es: 'Tu cuenta usa acceso sin contraseña: ingresás con un código que enviamos a tu email.', en: 'Your account uses passwordless access: you log in with a code we send to your email.', pt: 'Sua conta usa acesso sem senha: você entra com um código que enviamos ao seu e-mail.' },
  'set.security.email': { es: 'Email de acceso', en: 'Login email', pt: 'E-mail de acesso' },
  'set.security.role': { es: 'Rol', en: 'Role', pt: 'Função' },
  'set.security.logout': { es: 'Cerrar sesión', en: 'Log out', pt: 'Sair' },

  'set.billing.subtitle': { es: 'Tu plan actual y facturación.', en: 'Your current plan and billing.', pt: 'Seu plano atual e faturamento.' },
  'set.billing.current': { es: 'Plan actual', en: 'Current plan', pt: 'Plano atual' },
  'set.billing.free': { es: 'Gratis', en: 'Free', pt: 'Grátis' },
  'set.billing.active': { es: 'Activo', en: 'Active', pt: 'Ativo' },
  'set.billing.f1': { es: 'Productos y listas ilimitadas', en: 'Unlimited products and lists', pt: 'Produtos e listas ilimitados' },
  'set.billing.f2': { es: 'Códigos QR y links públicos', en: 'QR codes and public links', pt: 'Códigos QR e links públicos' },
  'set.billing.f3': { es: 'Clientes y reportes', en: 'Customers and reports', pt: 'Clientes e relatórios' },
  'set.billing.f4': { es: 'Equipo con roles y permisos', en: 'Team with roles and permissions', pt: 'Equipe com funções e permissões' },
  'set.billing.soon': { es: 'Los planes pagos y la facturación llegarán pronto.', en: 'Paid plans and billing are coming soon.', pt: 'Os planos pagos e o faturamento chegarão em breve.' },
  'bill.usageTitle': { es: 'Uso de tu plan', en: 'Your plan usage', pt: 'Uso do seu plano' },
  'bill.products': { es: 'Productos', en: 'Products', pt: 'Produtos' },
  'bill.lists': { es: 'Listas', en: 'Lists', pt: 'Listas' },
  'bill.members': { es: 'Miembros', en: 'Members', pt: 'Membros' },
  'bill.unlimited': { es: 'Ilimitado', en: 'Unlimited', pt: 'Ilimitado' },
  'bill.current': { es: 'Plan actual', en: 'Current plan', pt: 'Plano atual' },
  'bill.choose': { es: 'Elegir plan', en: 'Choose plan', pt: 'Escolher plano' },
  'bill.changing': { es: 'Cambiando…', en: 'Switching…', pt: 'Alterando…' },
  'bill.recommended': { es: 'Más popular', en: 'Most popular', pt: 'Mais popular' },
  'bill.ownerOnly': { es: 'Solo el dueño de la cuenta puede cambiar el plan.', en: 'Only the account owner can change the plan.', pt: 'Apenas o dono da conta pode mudar o plano.' },
  'bill.paymentNote': { es: 'El cobro con tarjeta se activará con la pasarela de pago. Por ahora el cambio de plan es inmediato.', en: 'Card billing will be enabled with the payment gateway. For now, plan changes are instant.', pt: 'A cobrança no cartão será ativada com o gateway de pagamento. Por enquanto, a troca de plano é imediata.' },
  // Plan names, prices and feature copy now live in lib/plans (shared with the landing).

  'set.delete.subtitle': { es: 'Acción permanente e irreversible.', en: 'Permanent and irreversible action.', pt: 'Ação permanente e irreversível.' },
  'set.delete.warning': { es: 'Se eliminará tu cuenta «{name}» con todos sus productos, listas, clientes, ventas y miembros del equipo. Esta acción no se puede deshacer.', en: 'Your account “{name}” will be deleted with all its products, lists, customers, sales and team members. This cannot be undone.', pt: 'Sua conta “{name}” será excluída com todos os produtos, listas, clientes, vendas e membros da equipe. Isso não pode ser desfeito.' },
  'set.delete.confirm': { es: 'Escribí «{keyword}» para confirmar', en: 'Type “{keyword}” to confirm', pt: 'Digite “{keyword}” para confirmar' },
  'set.delete.button': { es: 'Eliminar mi cuenta', en: 'Delete my account', pt: 'Excluir minha conta' },
  'set.delete.deleting': { es: 'Eliminando…', en: 'Deleting…', pt: 'Excluindo…' },
  'set.delete.ownerOnly': { es: 'Solo el dueño de la cuenta puede eliminarla.', en: 'Only the account owner can delete it.', pt: 'Apenas o dono da conta pode excluí-la.' },

  // ── Public list ─────────────────────────────────────────────────
  'pub.edition': { es: 'EDICIÓN Nº {n}', en: 'EDITION Nº {n}', pt: 'EDIÇÃO Nº {n}' },
  'pub.public': { es: 'PÚBLICA', en: 'PUBLIC', pt: 'PÚBLICA' },
  'pub.updated': { es: 'Actualizada {date}', en: 'Updated {date}', pt: 'Atualizada {date}' },
  'pub.print': { es: 'Imprimir', en: 'Print', pt: 'Imprimir' },
  'pub.printBtn': { es: 'Imprimir ↗', en: 'Print ↗', pt: 'Imprimir ↗' },
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
  'pub.allLists': { es: 'Todas las listas', en: 'All lists', pt: 'Todas as listas' },
  'pub.all': { es: 'Todos', en: 'All', pt: 'Todos' },
  'pub.search': { es: 'Buscar', en: 'Search', pt: 'Buscar' },
  'pub.empty': { es: 'No hay productos publicados.', en: 'No published products yet.', pt: 'Nenhum produto publicado.' },
  'pub.product': { es: 'producto', en: 'product', pt: 'produto' },
  'pub.products': { es: 'productos', en: 'products', pt: 'produtos' },
  'pub.from': { es: 'DESDE', en: 'FROM', pt: 'DESDE' },
  'pub.to': { es: 'HASTA', en: 'TO', pt: 'ATÉ' },
  'pub.footer': { es: 'Precios en {currency} · Generado con MiPrecio', en: 'Prices in {currency} · Made with MiPrecio', pt: 'Preços em {currency} · Gerado com MiPrecio' },
  'pub.notFound': { es: 'Lista no encontrada', en: 'List not found', pt: 'Lista não encontrada' },
  'pub.backHome': { es: 'Volver al inicio', en: 'Back to home', pt: 'Voltar ao início' },
}

export type TFn = (key: string, vars?: Record<string, string | number>) => string

/** Build a translate function for a given language. */
export function getT(lang?: string | null): TFn {
  const L = normalizeLang(lang)
  return (key, vars) => {
    let s = DICT[key]?.[L] ?? DICT[key]?.es ?? key
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v))
    return s
  }
}

/** Admin translate hook: language comes from the current tenant. */
export function useT(): TFn {
  const tenant = useAppSelector(selectTenant)
  return getT(tenant?.language)
}
