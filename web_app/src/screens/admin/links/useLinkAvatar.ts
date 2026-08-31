import { useState } from 'react'
import api from '../../../services/api'
import type { Tenant } from '../../../types'
import { colorsFromLogo } from './linksConstants'
import type { UpdateTree } from './linksTypes'

export function useLinkAvatar(
  tenant: Tenant | null,
  update: UpdateTree,
  setError: (message: string) => void
) {
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const uploadAvatar = async (file?: File) => {
    if (!file || !tenant) return
    try {
      setIsUploadingAvatar(true)
      const response = await api.uploadLinkTreeAvatar(tenant.id, file)
      if (!response.data) throw new Error(response.error)
      update('avatarUrl', response.data.url)
      const colors = await colorsFromLogo(response.data.url)
      update('accentColor', colors.accent)
      update('backgroundColor', colors.background)
    } catch {
      setError('No pudimos subir esa imagen. Probá con otro archivo.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }
  const selectCompanyLogo = async (logo: string) => {
    try {
      setIsUploadingAvatar(true)
      let storedLogo = logo
      if (logo.startsWith('data:') && tenant) {
        const file = await (await fetch(logo)).blob()
        const response = await api.uploadLinkTreeAvatar(tenant.id, file)
        if (!response.data) throw new Error(response.error)
        storedLogo = response.data.url
      }
      update('avatarUrl', storedLogo)
      const colors = await colorsFromLogo(storedLogo)
      update('accentColor', colors.accent)
      update('backgroundColor', colors.background)
    } catch {
      setError('No pudimos usar ese logo. Probá subir una imagen nueva.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }
  return { isUploadingAvatar, uploadAvatar, selectCompanyLogo }
}
