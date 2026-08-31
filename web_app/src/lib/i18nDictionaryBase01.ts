import type { TranslationEntry } from './i18nTypes'

export const DICT_BASE_01: Record<string, TranslationEntry> = {
  'common.search': { es: 'Buscar…', en: 'Search…', pt: 'Buscar…' },
  'common.save': {
    es: 'Guardar cambios',
    en: 'Save changes',
    pt: 'Salvar alterações',
  },
  'common.retry': { es: 'Reintentar', en: 'Retry', pt: 'Tentar novamente' },
  'common.error': {
    es: 'Ocurrió un error',
    en: 'Something went wrong',
    pt: 'Ocorreu um erro',
  },
  'common.done': { es: 'Listo', en: 'Done', pt: 'Concluído' },
  'common.cancel': { es: 'Cancelar', en: 'Cancel', pt: 'Cancelar' },
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
    es: '{listPrefix}Catálogo público de {name}. Escaneá el QR o compartí el link para ver siempre la última versión, '
      + 'con precios actualizados al instante.',
    en: '{listPrefix}Public catalog of {name}. Scan the QR or share the link to always see the latest version, '
      + 'with prices updated instantly.',
    pt: '{listPrefix}Catálogo público de {name}. Escaneie o QR ou compartilhe o link para ver sempre a última versão, '
      + 'com preços atualizados na hora.',
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
}
