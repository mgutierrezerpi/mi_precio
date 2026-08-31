import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagazineEditor } from '../components/magazine/MagazineEditor'
import { useT } from '../lib/i18n'
import api from '../services/api'
import { CrmLayout } from '../screens/admin/crm/CrmLayout'
import { useAppSelector } from '../store/hooks'
import { selectCanEdit, selectTenant } from '../store/slices/authSlice'
import type { Magazine } from '../types'
import { MagazineList } from './magazines/MagazineList'
import { useMagazineEditorActions } from './magazines/useMagazineEditorActions'

type MagazineVisibilityUpdate = Pick<Magazine, 'published' | 'showOnIndex'>

export function MagazinesContainer() {
  const t = useT()
  const navigate = useNavigate()
  const tenant = useAppSelector(selectTenant)
  const canEdit = useAppSelector(selectCanEdit)
  const [magazines, setMagazines] = useState<Magazine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Magazine | null>(null)
  const [creating, setCreating] = useState(false)
  const tenantId = tenant?.id
  const loadMagazines = useCallback(async () => {
    if (!tenantId) return
    setLoading(true)
    const response = await api.getMagazines(tenantId)
    if (response.data) {
      setMagazines(response.data)
      setError(null)
    } else setError(response.error)
    setLoading(false)
  }, [tenantId])
  useEffect(() => void Promise.resolve().then(loadMagazines), [loadMagazines])
  const rows = useMemo(() => {
    if (loading) return null
    const query = search.trim().toLowerCase()
    return query
      ? magazines.filter((magazine) =>
          [magazine.name, magazine.slug, magazine.issue].some((value) =>
            value?.toLowerCase().includes(query)
          )
        )
      : magazines
  }, [loading, magazines, search])
  const replace = (magazine: Magazine) =>
    setMagazines((items) => replaceMagazine(items, magazine))
  const { createPage, deletePage, saveMagazine, savePage } =
    useMagazineEditorActions({
      editing,
      setCreating,
      setEditing,
      replace,
      t,
      tenantId,
    })
  const closeEditor = () => {
    setCreating(false)
    setEditing(null)
    void loadMagazines()
  }
  const openCreate = () => {
    setEditing(null)
    setCreating(true)
  }
  const updateMagazine = async (
    magazine: Magazine,
    changes: MagazineVisibilityUpdate
  ) => {
    const response = await api.updateMagazine(magazine.id, changes)
    if (response.data) replace(response.data)
    else setError(response.error)
  }
  const deleteMagazine = async (magazine: Magazine) => {
    if (!window.confirm(t('magazines.deleteConfirm', { name: magazine.name })))
      return
    const response = await api.deleteMagazine(magazine.id)
    if (response.data)
      setMagazines((items) => items.filter((item) => item.id !== magazine.id))
    else setError(response.error)
  }
  return (
    <CrmLayout
      active="Revistas"
      title={t('nav.magazines')}
      subtitle={t('magazines.subtitle')}
      searchPlaceholder={t('magazines.search')}
      searchValue={search}
      onSearchChange={setSearch}
      hideContext
    >
      <MagazineList
        canEdit={canEdit}
        error={error}
        magazines={magazines}
        rows={rows}
        subdomain={tenant?.subdomain}
        t={t}
        onCreate={openCreate}
        onDelete={(magazine) => void deleteMagazine(magazine)}
        onEdit={(magazine) => navigate(`/admin/magazines/${magazine.id}/edit`)}
        onRetry={() => void loadMagazines()}
        onToggleIndex={(magazine) =>
          void updateMagazine(magazine, { showOnIndex: !magazine.showOnIndex })
        }
        onTogglePublished={(magazine) =>
          void updateMagazine(magazine, { published: !magazine.published })
        }
      />
      {(creating || editing) && (
        <MagazineEditor
          magazine={editing}
          onClose={closeEditor}
          onSaveMagazine={saveMagazine}
          onCreatePage={createPage}
          onSavePage={savePage}
          onDeletePage={deletePage}
          t={t}
        />
      )}
    </CrmLayout>
  )
}

function replaceMagazine(rows: Magazine[], magazine: Magazine) {
  const index = rows.findIndex((row) => row.id === magazine.id)
  return index === -1
    ? [magazine, ...rows]
    : rows.map((row) => (row.id === magazine.id ? magazine : row))
}
