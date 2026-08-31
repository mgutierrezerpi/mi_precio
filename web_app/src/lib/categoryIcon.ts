const CATEGORY_ICONS: Record<string, string> = {
  ferretería: 'wrench',
  ferreteria: 'wrench',
  eléctricos: 'zap',
  electricos: 'zap',
  pinturas: 'paintbrush',
  construcción: 'layers',
  construccion: 'layers',
  herramientas: 'cog',
  lavadero: 'droplets',
  limpieza: 'droplets',
}

export function categoryIcon(category?: string | null): string {
  return (category && CATEGORY_ICONS[category.trim().toLowerCase()]) || 'box'
}
