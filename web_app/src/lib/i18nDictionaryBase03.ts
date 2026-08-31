import type { TranslationEntry } from './i18nTypes'

export const DICT_BASE_03: Record<string, TranslationEntry> = {
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
  'nav.links': { es: 'Links', en: 'Links', pt: 'Links' },
  'nav.magazines': { es: 'Revistas', en: 'Magazines', pt: 'Revistas' },
  'nav.qr': { es: 'Códigos QR', en: 'QR codes', pt: 'Códigos QR' },
  'nav.customers': { es: 'Clientes', en: 'Customers', pt: 'Clientes' },
  'nav.reports': { es: 'Reportes', en: 'Reports', pt: 'Relatórios' },
  'nav.team': { es: 'Equipo', en: 'Team', pt: 'Equipe' },
  'nav.settings': { es: 'Configuración', en: 'Settings', pt: 'Configurações' },
  'nav.support': { es: 'Soporte', en: 'Support', pt: 'Suporte' },
  'nav.developer': { es: 'Developer', en: 'Developer', pt: 'Developer' },
  'magazines.eyebrow': {
    es: 'PUBLICACIONES',
    en: 'PUBLICATIONS',
    pt: 'PUBLICAÇÕES',
  },
  'magazines.subtitle': {
    es: 'Creá y publicá revistas independientes de tus listas de precios.',
    en: 'Create and publish magazines independently from your price lists.',
    pt: 'Crie e publique revistas separadas das suas listas de preços.',
  },
  'magazines.description': {
    es: 'Las revistas tienen sus propias páginas, enlaces y experiencia de lectura.',
    en: 'Magazines have their own pages, links, and reading experience.',
    pt: 'As revistas têm suas próprias páginas, links e experiência de leitura.',
  },
  'magazines.search': {
    es: 'Buscar revistas…',
    en: 'Search magazines…',
    pt: 'Buscar revistas…',
  },
  'magazines.new': {
    es: 'Nueva revista',
    en: 'New magazine',
    pt: 'Nova revista',
  },
  'magazines.newTitle': {
    es: 'Nueva revista',
    en: 'New magazine',
    pt: 'Nova revista',
  },
  'magazines.editTitle': {
    es: 'Editar revista',
    en: 'Edit magazine',
    pt: 'Editar revista',
  },
  'magazines.editOnPage': {
    es: 'Editar sobre la página',
    en: 'Edit on the page',
    pt: 'Editar na página',
  },
  'magazines.editOnPageHint': {
    es: 'Hacé clic en una imagen o texto de la página para editarlo directamente.',
    en: 'Click an image or piece of text on the page to edit it directly.',
    pt: 'Clique em uma imagem ou texto da página para editar diretamente.',
  },
  'magazines.editorDescription': {
    es: 'Ajustá la portada, el texto y las imágenes de cada página desde un solo lugar.',
    en: 'Adjust the cover, copy, and images for every page in one place.',
    pt: 'Ajuste a capa, os textos e as imagens de cada página em um só lugar.',
  },
  'magazines.editorSteps': {
    es: 'Pasos de edición',
    en: 'Editing steps',
    pt: 'Etapas de edição',
  },
  'magazines.autosaveManual': {
    es: 'Los cambios se guardan al avanzar',
    en: 'Changes save as you move through the editor',
    pt: 'As alterações são salvas ao avançar',
  },
  'magazines.autosaveSaving': {
    es: 'Guardando cambios…',
    en: 'Saving changes…',
    pt: 'Salvando alterações…',
  },
  'magazines.autosaveUnsaved': {
    es: 'Cambios pendientes',
    en: 'Unsaved changes',
    pt: 'Alterações pendentes',
  },
  'magazines.autosaveSaved': {
    es: 'Cambios guardados',
    en: 'Changes saved',
    pt: 'Alterações salvas',
  },
}

