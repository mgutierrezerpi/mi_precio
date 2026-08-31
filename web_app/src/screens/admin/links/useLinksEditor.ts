import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAppSelector } from '../../../store/hooks'
import { selectCanEdit, selectTenant } from '../../../store/slices/authSlice'
import api from '../../../services/api'
import type { LinkTree, LinkTreeLink } from '../../../types'
import { colorsFromLogo } from './linksConstants'
import { useLinkAvatar } from './useLinkAvatar'

export function useLinksEditor() {
  const tenant = useAppSelector(selectTenant)
  const canEdit = useAppSelector(selectCanEdit)
  const [tree, setTree] = useState<LinkTree | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(
    () => window.innerWidth >= 640
  )
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [savedSnapshot, setSavedSnapshot] = useState('')

  useEffect(() => {
    if (!tenant?.id) return
    void api.getLinkTree(tenant.id).then(async (response) => {
      setIsLoading(false)
      if (!response.data) {
        setError(response.error || 'No pudimos cargar tu Linktree')
        return
      }
      setSavedSnapshot(JSON.stringify(response.data))
      const logo = response.data.avatarUrl || tenant.logoUrl
      const hasDefaultPalette =
        response.data.accentColor === '#D6EE4A' &&
        response.data.backgroundColor === '#F5F4ED'
      if (logo && hasDefaultPalette) {
        try {
          const colors = await colorsFromLogo(logo)
          setTree({
            ...response.data,
            accentColor: colors.accent,
            backgroundColor: colors.background,
          })
          return
        } catch {
          /* Keep the default palette if a hosted logo disallows pixel reading. */
        }
      }
      setTree(response.data)
    })
  }, [tenant?.id, tenant?.logoUrl])

  const publicUrl = useMemo(
    () => (tree ? `${window.location.origin}/l/${tree.publicSlug}` : ''),
    [tree]
  )
  const update = <K extends keyof LinkTree>(key: K, value: LinkTree[K]) =>
    setTree((current) => (current ? { ...current, [key]: value } : current))
  const avatar = useLinkAvatar(tenant, update, setError)
  const isDirty = !!tree && savedSnapshot !== JSON.stringify(tree)
  const copyPublicUrl = async () => {
    if (!publicUrl) return
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      setError(
        'No pudimos copiar el link. Copialo desde la barra del navegador.'
      )
    }
  }
  const updateLink = (index: number, link: LinkTreeLink) =>
    setTree((current) =>
      current
        ? {
            ...current,
            links: current.links.map((item, itemIndex) =>
              itemIndex === index ? link : item
            ),
          }
        : current
    )
  const removeLink = (index: number) =>
    setTree((current) =>
      current
        ? {
            ...current,
            links: current.links.filter((_, itemIndex) => itemIndex !== index),
          }
        : current
    )
  const moveLink = (index: number, direction: -1 | 1) =>
    setTree((current) => {
      if (!current) return current
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= current.links.length) return current
      const links = [...current.links]
      const [item] = links.splice(index, 1)
      links.splice(nextIndex, 0, item)
      return { ...current, links }
    })
  const save = useCallback(async () => {
    if (!tenant || !tree || isSaving || !canEdit) return
    setIsSaving(true)
    setError('')
    const response = await api.updateLinkTree(tenant.id, tree)
    setIsSaving(false)
    if (response.data) {
      setSavedSnapshot(JSON.stringify(response.data))
      setTree(response.data)
    } else setError(response.error || 'No pudimos guardar los cambios')
  }, [canEdit, isSaving, tenant, tree])

  useEffect(() => {
    if (!isDirty || !canEdit || isSaving) return
    const timer = window.setTimeout(() => void save(), 850)
    return () => window.clearTimeout(timer)
  }, [canEdit, isDirty, isSaving, save])

  return {
    tenant,
    canEdit,
    tree,
    isLoading,
    isSaving,
    error,
    copied,
    isUploadingAvatar: avatar.isUploadingAvatar,
    isPreviewOpen,
    setIsPreviewOpen,
    avatarInputRef,
    publicUrl,
    isDirty,
    update,
    copyPublicUrl,
    uploadAvatar: avatar.uploadAvatar,
    selectCompanyLogo: avatar.selectCompanyLogo,
    updateLink,
    removeLink,
    moveLink,
    save,
  }
}
