import { describe, expect, it } from 'vitest'
import { apiErrorMessage } from './apiErrors'

describe('apiErrorMessage', () => {
  it('says the English API messages in Spanish (M6)', () => {
    expect(apiErrorMessage(400, 'Invalid or expired code')).toBe(
      'El código no es válido o ya venció. Pedí uno nuevo.'
    )
    expect(apiErrorMessage(400, 'Subdomain already in use')).toBe(
      'Esa dirección ya la usa otro negocio. Probá con otra.'
    )
    expect(apiErrorMessage(404, 'Not found')).toBe(
      'No encontramos lo que buscabas. Puede que se haya borrado.'
    )
    expect(apiErrorMessage(404, 'Magazine not found')).toMatch(/No encontramos/)
  })

  it('turns a 422 field list into a sentence instead of «Error 422»', () => {
    // Our validators already speak Spanish; only the pydantic prefix goes.
    expect(
      apiErrorMessage(422, [
        {
          type: 'value_error',
          loc: ['body', 'public_slug'],
          msg: 'Value error, Usá letras, números y guiones para tu link público',
        },
      ])
    ).toBe('Usá letras, números y guiones para tu link público')
    // Pydantic's own English messages become a Spanish hint on the field.
    expect(
      apiErrorMessage(422, [
        {
          type: 'string_too_short',
          loc: ['body', 'subdomain'],
          msg: 'String should have at least 3 characters',
        },
      ])
    ).toBe('Revisá la dirección: no es válido.')
    expect(
      apiErrorMessage(422, [{ type: 'missing', loc: ['body', 'email'] }])
    ).toBe('Falta el email.')
  })

  it('keeps messages that are already Spanish and reads the plan gate', () => {
    expect(apiErrorMessage(403, 'No tenés permisos para esta acción')).toBe(
      'No tenés permisos para esta acción'
    )
    expect(
      apiErrorMessage(402, {
        code: 'plan_required',
        message: 'Elegí un plan para empezar a usar Mi Precio.',
      })
    ).toBe('Elegí un plan para empezar a usar Mi Precio.')
  })

  it('never shows a bare status code', () => {
    expect(apiErrorMessage(500, undefined)).toMatch(/de nuestro lado/)
    expect(apiErrorMessage(409, {})).not.toMatch(/\d{3}/)
  })
})
