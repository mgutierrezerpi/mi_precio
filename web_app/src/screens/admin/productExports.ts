import type { Product } from '../../types'
import type { useCatalogT } from '../../lib/i18nDictionaryCatalog'

type Translator = ReturnType<typeof useCatalogT>

const exportColumns = (t: Translator) => [
  t('products.exportName'),
  'SKU',
  t('products.exportCategory'),
  t('products.price'),
  t('products.exportAvailable'),
]

const escapeHtml = (s: string) =>
  s.replace(/[&<>\"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] || c)

const exportCells = (p: Product, currency: string, t: Translator) => [
  p.name,
  p.sku || '',
  p.category || '',
  `${currency} ${parseFloat(p.price) || 0}`,
  p.available ? t('products.yes') : t('products.no'),
]

export function downloadExcel(products: Product[], currency: string, t: Translator) {
  if (!products.length) return
  const head = `<tr>${exportColumns(t).map((c) => `<th>${c}</th>`).join('')}</tr>`
  const rows = products.map((p) => `<tr>${exportCells(p, currency, t).map((v) => `<td>${escapeHtml(String(v))}</td>`).join('')}</tr>`).join('')
  const html = `<html><head><meta charset="utf-8"></head><body><table border="1">${head}${rows}</table></body></html>`
  const blob = new Blob(['﻿' + html], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `productos-${new Date().toISOString().slice(0, 10)}.xls`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function printPdf(products: Product[], title: string, currency: string, t: Translator, locale: string) {
  if (!products.length) return
  const head = `<tr>${exportColumns(t).map((c) => `<th>${c}</th>`).join('')}</tr>`
  const rows = products.map((p) => `<tr>${exportCells(p, currency, t).map((v, i) => `<td class="${i === 3 ? 'num' : ''}">${escapeHtml(String(v))}</td>`).join('')}</tr>`).join('')
  const w = window.open('', '_blank', 'width=900,height=700')
  if (!w) { alert(t('products.popupBlocked')); return }
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)} — ${t('products.catalog')}</title><style>*{font-family:Inter,Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:32px;color:#0F172A}h1{font-size:22px;margin:0 0 4px}.meta{color:#64748B;font-size:12px;margin-bottom:18px}table{width:100%;border-collapse:collapse;font-size:12px}th{text-align:left;background:#F1F5F9;padding:8px 10px;border-bottom:2px solid #E2E8F0;text-transform:uppercase;font-size:10px;letter-spacing:.04em;color:#475569}td{padding:8px 10px;border-bottom:1px solid #E2E8F0}td.num{text-align:right;font-variant-numeric:tabular-nums}@media print{body{margin:12mm}}</style></head><body><h1>${escapeHtml(title)}</h1><div class="meta">${t('products.catalogMeta', { count: products.length, plural: products.length === 1 ? '' : 's', date: new Date().toLocaleDateString(locale) })}</div><table>${head}${rows}</table><script>window.onload=function(){setTimeout(function(){window.print()},200)}</script></body></html>`)
  w.document.close()
}
