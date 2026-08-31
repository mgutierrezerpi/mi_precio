import { Navigate, useParams } from 'react-router-dom'

/**
 * Legacy deep link retained for existing bookmarks. List editing now happens
 * in the current Lists panel, so this route intentionally performs no data
 * loading or local state synchronization.
 */
export function ListEditScreen() {
  const { id } = useParams<{ id: string }>()
  return (
    <Navigate
      replace
      to={id ? `/admin/lists/${id}/customize` : '/admin/lists'}
    />
  )
}

export default ListEditScreen
