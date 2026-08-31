import type { MagazineEditField } from './pencilJournalTheme'

export function editorTargets(root: HTMLElement, field: MagazineEditField) {
  if (field === 'image')
    return Array.from(root.querySelectorAll<HTMLElement>('img[data-magazine-field="image"]'))
  if (field === 'eyebrow' || field === 'footer')
    return Array.from(root.querySelectorAll<HTMLElement>(`[data-magazine-field="${field}"]`))
  if (field === 'headline')
    return Array.from(root.querySelectorAll<HTMLElement>('[data-magazine-field="headline"]'))
  if (field === 'quote')
    return Array.from(root.querySelectorAll<HTMLElement>('[data-magazine-field="quote"]'))
  if (field === 'productName' || field === 'productDescription' || field === 'productPrice')
    return Array.from(root.querySelectorAll<HTMLElement>(`[data-magazine-field="${field}"]`))
  return Array.from(root.querySelectorAll<HTMLElement>('[data-magazine-field="body"]'))
}

export function minimumEditorWidth(field: MagazineEditField) {
  if (field === 'productPrice') return 150
  if (field === 'productName') return 220
  if (field === 'productDescription') return 280
  if (field === 'eyebrow' || field === 'footer') return 220
  return 180
}
