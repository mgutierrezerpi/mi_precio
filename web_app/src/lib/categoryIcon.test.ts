import { describe, expect, it } from 'vitest'
import { categoryIcon } from './categoryIcon'

describe('categoryIcon', () => {
  it('ignores accents and case', () => {
    expect(categoryIcon('Cafés')).toBe('coffee')
    expect(categoryIcon('CAFE')).toBe('coffee')
    expect(categoryIcon('  café  ')).toBe('coffee')
  })

  it('matches a keyword inside a longer category name', () => {
    expect(categoryIcon('Cafés de especialidad')).toBe('coffee')
    expect(categoryIcon('Tortas y postres')).toBe('cake')
  })

  it('covers the categories a menu actually uses', () => {
    expect(categoryIcon('Pastelería')).toBe('cake')
    expect(categoryIcon('Desayunos')).toBe('egg')
    expect(categoryIcon('Bebidas')).toBe('glass')
    expect(categoryIcon('Vinos')).toBe('wine')
    expect(categoryIcon('Helados')).toBe('ice-cream')
    expect(categoryIcon('Almuerzos')).toBe('utensils')
  })

  it('keeps the hardware and laundromat mappings it started with', () => {
    expect(categoryIcon('Ferretería')).toBe('wrench')
    expect(categoryIcon('Eléctricos')).toBe('zap')
    expect(categoryIcon('Pinturas')).toBe('paintbrush')
    expect(categoryIcon('Construcción')).toBe('layers')
    expect(categoryIcon('Herramientas')).toBe('cog')
    expect(categoryIcon('Lavadero')).toBe('droplets')
    expect(categoryIcon('Limpieza')).toBe('droplets')
  })

  it('does not let a short keyword swallow a longer word', () => {
    // `pan` would have caught this one, which is why the keyword is `panaderia`
    expect(categoryIcon('Pantalones')).toBe('shirt')
    // `factura` is listed above `cena`, so the pastry wins over the meal
    expect(categoryIcon('Docena de facturas')).toBe('cake')
  })

  it('falls back to the generic mark when nothing matches', () => {
    expect(categoryIcon('Repuestos náuticos')).toBe('box')
    expect(categoryIcon('')).toBe('box')
    expect(categoryIcon(null)).toBe('box')
    expect(categoryIcon(undefined)).toBe('box')
  })
})
