/**
 * Strips accents and case so "Cafés", "CAFE" and "café de especialidad" all
 * reduce to the same haystack.
 */
function normalize(category: string): string {
  return category.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

/**
 * Keyword → icon, matched as a substring so a shop that writes "Cafés de
 * especialidad" or "Tortas y pasteles" still gets the right mark rather than
 * the generic crate.
 *
 * Order matters: the first keyword found in the text wins, so the specific
 * ones go above the general. Keywords are kept long enough not to collide —
 * `panaderia` rather than a bare `pan`, which would catch `pantalon`.
 */
const CATEGORY_ICONS: ReadonlyArray<readonly [string, string]> = [
  // Clothing first: these contain keywords that appear further down.
  ['pantalon', 'shirt'],
  ['remera', 'shirt'],
  ['campera', 'shirt'],
  ['ropa', 'shirt'],
  ['indumentaria', 'shirt'],
  ['vestimenta', 'shirt'],

  // Gastronomy
  ['cafe', 'coffee'],
  ['infusion', 'coffee'],
  ['desayuno', 'egg'],
  ['merienda', 'egg'],
  ['brunch', 'egg'],
  ['pasteleria', 'cake'],
  ['reposteria', 'cake'],
  ['confiteria', 'cake'],
  ['torta', 'cake'],
  ['postre', 'cake'],
  ['panaderia', 'cake'],
  ['factura', 'cake'],
  ['bizcocho', 'cake'],
  ['helado', 'ice-cream'],
  ['vino', 'wine'],
  ['bodega', 'wine'],
  ['cerveza', 'wine'],
  ['licor', 'wine'],
  ['bebida', 'glass'],
  ['jugo', 'glass'],
  ['refresco', 'glass'],
  ['tragos', 'glass'],
  ['almuerzo', 'utensils'],
  ['cena', 'utensils'],
  ['plato', 'utensils'],
  ['comida', 'utensils'],
  ['menu', 'utensils'],
  ['pizza', 'utensils'],
  ['hamburgues', 'utensils'],
  ['sandwich', 'utensils'],
  ['carne', 'utensils'],
  ['parrilla', 'utensils'],
  ['fruta', 'apple'],
  ['verdura', 'apple'],
  ['verduleria', 'apple'],

  // Other common verticals
  ['farmacia', 'pill'],
  ['medicament', 'pill'],
  ['libreria', 'book'],
  ['libro', 'book'],
  ['papeleria', 'book'],
  ['peluqueria', 'scissors'],
  ['barberia', 'scissors'],

  // The two the map started with: hardware and laundromat.
  ['ferreteria', 'wrench'],
  ['herramienta', 'cog'],
  ['electric', 'zap'],
  ['pintura', 'paintbrush'],
  ['construccion', 'layers'],
  ['lavadero', 'droplets'],
  ['limpieza', 'droplets'],
]

export function categoryIcon(category?: string | null): string {
  if (!category) return 'box'
  const haystack = normalize(category)
  if (!haystack) return 'box'
  const hit = CATEGORY_ICONS.find(([keyword]) => haystack.includes(keyword))
  return hit ? hit[1] : 'box'
}
