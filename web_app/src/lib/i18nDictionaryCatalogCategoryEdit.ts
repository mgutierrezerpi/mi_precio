import type { TranslationEntry } from './i18nDictionary'

export const DICT_CATALOG_CATEGORY_EDIT: Record<string, TranslationEntry> = {
  'categories.noDescription': {
    es: 'Sin descripción',
    en: 'No description',
    pt: 'Sem descrição',
  },
  'categories.products': {
    es: '{count} producto{plural}',
    en: '{count} product{plural}',
    pt: '{count} produto{plural}',
  },
  'categories.view': { es: 'ver', en: 'view', pt: 'ver' },
  'categories.deleteConfirm': {
    es: '¿Eliminar la categoría “{name}”?{extra}',
    en: 'Delete category “{name}”?{extra}',
    pt: 'Excluir a categoria “{name}”?{extra}',
  },
  'categories.deleteExtra': {
    es: ' Sus {count} producto{plural} quedarán sin categoría.',
    en: ' Its {count} product{plural} will become uncategorized.',
    pt: ' Seus {count} produto{plural} ficarão sem categoria.',
  },
  'categories.edit': { es: 'Editar', en: 'Edit', pt: 'Editar' },
  'categories.delete': { es: 'Eliminar', en: 'Delete', pt: 'Excluir' },
  'categories.editTitle': {
    es: 'Editar categoría',
    en: 'Edit category',
    pt: 'Editar categoria',
  },
  'categories.newTitle': {
    es: 'Nueva categoría',
    en: 'New category',
    pt: 'Nova categoria',
  },
  'categories.name': { es: 'Nombre', en: 'Name', pt: 'Nome' },
  'categories.description': {
    es: 'Descripción',
    en: 'Description',
    pt: 'Descrição',
  },
  'categories.color': { es: 'Color', en: 'Color', pt: 'Cor' },
  'categories.namePlaceholder': {
    es: 'Ferretería',
    en: 'Hardware',
    pt: 'Ferragens',
  },
  'categories.descriptionPlaceholder': {
    es: 'Tornillos, bisagras y herrajes.',
    en: 'Screws, hinges, and hardware.',
    pt: 'Parafusos, dobradiças e ferragens.',
  },
  'categories.cancel': { es: 'Cancelar', en: 'Cancel', pt: 'Cancelar' },
  'categories.saving': { es: 'Guardando…', en: 'Saving…', pt: 'Salvando…' },
  'categories.save': {
    es: 'Guardar cambios',
    en: 'Save changes',
    pt: 'Salvar alterações',
  },
  'categories.create': {
    es: 'Crear categoría',
    en: 'Create category',
    pt: 'Criar categoria',
  },
}
