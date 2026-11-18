import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Tenant } from '../../../types'
import { useSocialLinks } from './SocialLinksFields'

const tenant = (fields: Partial<Tenant> = {}) =>
  ({ id: 'tenant-1', name: 'Shop', ...fields }) as Tenant

function setup(shop: Tenant, canManage = true) {
  const save = vi.fn()
  const view = renderHook(() => useSocialLinks(shop, canManage, save))
  return { ...view, save }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useSocialLinks', () => {
  it('saves only the network the owner changed', () => {
    const { result, save } = setup(
      tenant({ socialFacebook: 'https://facebook.com/shop' })
    )

    act(() => result.current.change('socialInstagram', '@shop'))
    act(() => vi.advanceTimersByTime(600))

    expect(save).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenCalledWith({ socialInstagram: '@shop' })
  })

  it('clears a network the owner emptied', () => {
    const { result, save } = setup(
      tenant({ socialTiktok: 'https://tiktok.com/@shop' })
    )

    act(() => result.current.change('socialTiktok', '   '))
    act(() => vi.advanceTimersByTime(600))

    expect(save).toHaveBeenCalledWith({ socialTiktok: null })
  })

  it('holds back a value the API would reject and says why', () => {
    const { result, save } = setup(tenant())

    act(() => result.current.change('socialWhatsapp', '123'))
    act(() => vi.advanceTimersByTime(2000))

    expect(save).not.toHaveBeenCalled()
    expect(result.current.errors.socialWhatsapp).toBe('social.error.phone')
  })

  it('shows the number orders go to, written as a phone', () => {
    const { result } = setup(
      tenant({ whatsappUrl: 'https://wa.me/59899111222' })
    )

    expect(result.current.values.socialWhatsapp).toBe('+59899111222')
  })

  it('does not save a number the owner never touched', () => {
    const { result, save } = setup(
      tenant({ whatsappUrl: 'https://wa.me/59899111222' })
    )

    act(() => result.current.change('socialFacebook', 'facebook.com/shop'))
    act(() => vi.advanceTimersByTime(600))

    expect(save).toHaveBeenCalledWith({ socialFacebook: 'facebook.com/shop' })
  })

  it('saves nothing for someone who cannot manage the shop', () => {
    const { result, save } = setup(tenant(), false)

    act(() => result.current.change('socialInstagram', '@shop'))
    act(() => vi.advanceTimersByTime(2000))

    expect(save).not.toHaveBeenCalled()
  })
})
