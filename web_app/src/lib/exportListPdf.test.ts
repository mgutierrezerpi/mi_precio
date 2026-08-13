import { describe, expect, it } from 'vitest'
import { pdfFileName } from './exportListPdf'

describe('pdfFileName', () => {
  it('joins the shop and the list, so downloads are told apart', () => {
    expect(pdfFileName('Café Aurora', 'Menú')).toBe('cafe-aurora-menu')
  })

  it('strips accents rather than leaving them to the browser to mangle', () => {
    expect(pdfFileName('Pastelería Ñandú')).toBe('pasteleria-nandu')
  })

  it('drops the parts that are missing', () => {
    expect(pdfFileName('Café Aurora', null)).toBe('cafe-aurora')
    expect(pdfFileName(undefined, 'Menú')).toBe('menu')
  })

  it('collapses punctuation instead of emitting it into a file name', () => {
    expect(pdfFileName('Bar "El Che" — 2x1!')).toBe('bar-el-che-2x1')
  })

  it('falls back to something openable when nothing survives', () => {
    expect(pdfFileName('', '   ')).toBe('lista')
    expect(pdfFileName('!!!')).toBe('lista')
  })
})
