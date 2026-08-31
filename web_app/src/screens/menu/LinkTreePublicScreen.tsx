import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { LoadingSpinner } from '../../components'
import api from '../../services/api'
import type { LinkTree } from '../../types'
import { LinkTreeView } from '../../components/linktree/LinkTreeView'

export function LinkTreePublicScreen() {
  const { subdomain } = useParams<{ subdomain: string }>()
  const [tree, setTree] = useState<LinkTree | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!subdomain) return
    void api.getPublicLinkTree(subdomain).then((response) => {
      if (response.data?.linktree) setTree(response.data.linktree)
      else setError(true)
    })
  }, [subdomain])

  if (tree) return <LinkTreeView data={tree} />
  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F4ED] px-6 text-center text-sm text-[#59614B]">
        Este Linktree no está disponible.
      </div>
    )
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F4ED]">
      <LoadingSpinner />
    </div>
  )
}
