import type { TranslationEntry } from './i18nDictionary'
import { DICT_LIST_VARIANTS } from './i18nDictionaryListVariants'
import { DICT_LIST_WIZARD } from './i18nDictionaryListWizard'

export const DICT_LISTS: Record<string, TranslationEntry> = {
  'pl.deleteConfirm': {
    es: '¿Eliminar la lista “{name}”? Esta acción no se puede deshacer.',
    en: 'Delete the “{name}” list? This action cannot be undone.',
    pt: 'Excluir a lista “{name}”? Esta ação não pode ser desfeita.',
  },
  'pl.tab.all': { es: 'Todas', en: 'All', pt: 'Todas' },
  'pl.tab.active': { es: 'Activas', en: 'Active', pt: 'Ativas' },
  'pl.tab.inactive': { es: 'Inactivas', en: 'Inactive', pt: 'Inativas' },
  'pl.new': { es: 'Nueva lista', en: 'New list', pt: 'Nova lista' },
  'pl.loading': {
    es: 'Cargando listas…',
    en: 'Loading lists…',
    pt: 'Carregando listas…',
  },
  'pl.column.list': { es: 'Lista', en: 'List', pt: 'Lista' },
  'pl.column.products': { es: 'Productos', en: 'Products', pt: 'Produtos' },
  'pl.column.status': { es: 'Estado', en: 'Status', pt: 'Status' },
  'pl.column.updated': { es: 'Actualizada', en: 'Updated', pt: 'Atualizada' },
  'pl.main': { es: 'Principal', en: 'Main', pt: 'Principal' },
  'pl.status.active': { es: 'Activa', en: 'Active', pt: 'Ativa' },
  'pl.status.draft': { es: 'Borrador', en: 'Draft', pt: 'Rascunho' },
  'pl.linkCopied': {
    es: 'Enlace copiado',
    en: 'Link copied',
    pt: 'Link copiado',
  },
  'pl.copyPublicLink': {
    es: 'Copiar enlace público',
    en: 'Copy public link',
    pt: 'Copiar link público',
  },
  'pl.qrCode': { es: 'Código QR', en: 'QR code', pt: 'Código QR' },
  'pl.openPublic': {
    es: 'Abrir lista pública',
    en: 'Open public list',
    pt: 'Abrir lista pública',
  },
  'pl.close': { es: 'Cerrar', en: 'Close', pt: 'Fechar' },
  'pl.options': {
    es: 'Opciones de la lista',
    en: 'List options',
    pt: 'Opções da lista',
  },
  'pl.menu.edit': { es: 'Editar lista', en: 'Edit list', pt: 'Editar lista' },
  'pl.menu.unpublish': {
    es: 'Despublicar',
    en: 'Unpublish',
    pt: 'Despublicar',
  },
  'pl.menu.publish': { es: 'Publicar', en: 'Publish', pt: 'Publicar' },
  'pl.menu.removeMain': {
    es: 'Quitar de principal',
    en: 'Remove as main',
    pt: 'Remover como principal',
  },
  'pl.menu.makeMain': {
    es: 'Marcar principal',
    en: 'Make main',
    pt: 'Definir como principal',
  },
  'pl.menu.delete': { es: 'Eliminar', en: 'Delete', pt: 'Excluir' },
  ...DICT_LIST_WIZARD,
  'pl.tab.offline': { es: 'Fuera de línea', en: 'Offline', pt: 'Offline' },
  'pl.status.offline': { es: 'Fuera de línea', en: 'Offline', pt: 'Offline' },
  'pl.offline.oneTitle': {
    es: 'Una de tus listas publicadas no se está viendo',
    en: 'One of your published lists is not visible',
    pt: 'Uma das suas listas publicadas não está visível',
  },
  'pl.offline.manyTitle': {
    es: '{count} de tus listas publicadas no se están viendo',
    en: '{count} of your published lists are not visible',
    pt: '{count} das suas listas publicadas não estão visíveis',
  },
  'pl.offline.oneDescription': {
    es: 'Tu plan permite {active} lista publicada. Quien abra su link o escanee su QR no va a ver nada. '
      + 'No se borró nada: subí de plan y vuelve sola, tal como estaba.',
    en: 'Your plan allows {active} published list. Anyone who opens its link or scans its QR code will see nothing. '
      + 'Nothing was deleted: upgrade your plan and it will come back just as it was.',
    pt: 'Seu plano permite {active} lista publicada. Quem abrir o link ou escanear o QR não verá nada. '
      + 'Nada foi apagado: faça upgrade do plano e ela voltará como estava.',
  },
  'pl.offline.manyDescription': {
    es: 'Tu plan permite {active} listas publicadas. Quien abra sus links o escanee sus QR no va a ver nada. '
      + 'No se borró nada: subí de plan y vuelven solas, tal como estaban.',
    en: 'Your plan allows {active} published lists. Anyone who opens their links or scans their QR codes will see nothing. '
      + 'Nothing was deleted: upgrade your plan and they will come back just as they were.',
    pt: 'Seu plano permite {active} listas publicadas. Quem abrir os links ou escanear os QRs não verá nada. '
      + 'Nada foi apagado: faça upgrade do plano e elas voltarão como estavam.',
  },
  'pl.offline.viewPlans': {
    es: 'Ver planes',
    en: 'View plans',
    pt: 'Ver planos',
  },
  ...DICT_LIST_VARIANTS,
}
