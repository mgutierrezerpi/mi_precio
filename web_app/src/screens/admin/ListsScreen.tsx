import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchLists, createList, deleteList, updateList, selectLists, selectIsLoading } from '../../store/slices/menuSlice'
import { selectTenant } from '../../store/slices/authSlice'

export function ListsScreen() {
  const dispatch = useAppDispatch()
  const tenant = useAppSelector(selectTenant)
  const lists = useAppSelector(selectLists)
  const isLoading = useAppSelector(selectIsLoading)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (tenant?.id) {
      dispatch(fetchLists(tenant.id))
    }
  }, [dispatch, tenant?.id])

  const handleCreateList = async () => {
    if (!tenant?.id || !newListName.trim()) return
    setCreating(true)
    await dispatch(createList({ tenantId: tenant.id, name: newListName.trim() }))
    setCreating(false)
    setNewListName('')
    setShowCreateModal(false)
  }

  const handleDelete = async (listId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm('¿Estás seguro de eliminar esta lista?')) {
      await dispatch(deleteList(listId))
    }
  }

  const handleTogglePublished = async (listId: string, currentlyPublished: boolean, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await dispatch(updateList({ listId, data: { published: !currentlyPublished } }))
  }

  if (isLoading && lists.length === 0) {
    return (
      <div className="max-w-6xl mx-auto relative pb-24 animate-fade-in">
        {/* Header skeleton */}
        <div className="mb-12 text-center">
          <div className="skeleton skeleton-title mx-auto mb-4" style={{ width: '200px' }} />
          <div className="skeleton skeleton-text mx-auto" style={{ width: '150px' }} />
        </div>
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
              <div className="skeleton h-1" />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="skeleton w-12 h-12 rounded-xl" />
                  <div className="skeleton w-16 h-5 rounded-full" />
                </div>
                <div className="skeleton skeleton-title mb-3" />
                <div className="flex items-center justify-between">
                  <div className="skeleton skeleton-text w-24" />
                  <div className="skeleton skeleton-text w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto relative pb-24">
      {/* Header */}
      <div className="mb-12 text-center animate-fade-in-down">
        <h1 className="text-4xl font-light text-[var(--color-text-primary)] tracking-wide">
          Tus Listas
        </h1>
        <p className="mt-3 text-[var(--color-text-muted)]">
          {lists.length === 0
            ? 'Crea tu primera lista de precios'
            : `${lists.length} lista${lists.length !== 1 ? 's' : ''} de precios`
          }
        </p>
      </div>

      {lists.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
          <div className="relative mb-8">
            <div className="w-32 h-40 border-2 border-dashed border-[var(--color-border)] rounded-2xl flex items-center justify-center opacity-60">
              <MenuPreviewIcon className="w-12 h-12 text-[var(--color-text-subtle)]" />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--color-accent-soft)] rounded-xl" />
            <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-[var(--color-accent-soft)] rounded-lg opacity-60" />
          </div>
          <h3 className="text-xl text-[var(--color-text-primary)] mb-2">
            Sin listas todavía
          </h3>
          <p className="text-[var(--color-text-subtle)] mb-8 text-center max-w-sm">
            Las listas de precios te permiten organizar tus productos y mostrarlos a tus clientes
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="soft-button-primary px-8 py-4 rounded-xl hover:scale-105 hover:shadow-[var(--shadow-glow)_rgba(var(--color-accent-rgb),0.25)] active:scale-100 transition-all"
          >
            Crear primera lista
          </button>
        </div>
      ) : (
        /* Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list, index) => (
            <Link
              key={list.id}
              to={`/admin/lists/${list.id}`}
              className="group relative block animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Card */}
              <div className="bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl overflow-hidden transition-all duration-300 hover:border-[var(--color-border-accent)] hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 card-shine">
                {/* Top accent line */}
                <div className={`h-0.5 ${list.published ? 'bg-gradient-to-r from-[var(--color-success)] via-[var(--color-success)]/60 to-transparent' : 'bg-gradient-to-r from-[var(--color-warning)] via-[var(--color-warning)]/60 to-transparent'}`} />

                {/* Content */}
                <div className="p-6">
                  {/* Header with icon and status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-elevated)] flex items-center justify-center group-hover:bg-[var(--color-accent-soft)] transition-colors">
                      <MenuPreviewIcon className="w-6 h-6 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
                    </div>
                    <div className="flex items-center gap-2">
                      {list.showOnIndex && (
                        <span className="soft-badge text-[10px]">
                          Principal
                        </span>
                      )}
                      <span className={`w-2 h-2 rounded-full ${list.published ? 'bg-[var(--color-success)]' : 'bg-[var(--color-warning)]'}`} title={list.published ? 'Publicado' : 'Borrador'} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors truncate mb-3">
                    {list.name}
                  </h3>

                  {/* Meta info */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 text-[var(--color-text-subtle)]">
                      <span>{list.versions?.length || 0} ver.</span>
                      <span className="w-1 h-1 rounded-full bg-[var(--color-border-light)]" />
                      <span>{formatRelativeDate(list.updatedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => handleTogglePublished(list.id, list.published, e)}
                        className={`p-1.5 rounded-lg transition-all ${
                          list.published
                            ? 'text-[var(--color-success)] hover:bg-[var(--color-success-soft)]'
                            : 'text-[var(--color-warning)] hover:bg-[var(--color-warning-soft)]'
                        }`}
                        title={list.published ? 'Despublicar' : 'Publicar'}
                      >
                        {list.published ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => handleDelete(list.id, e)}
                        className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-soft)] rounded-lg transition-colors"
                        title="Eliminar lista"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hover footer */}
                <div className="h-0 group-hover:h-12 overflow-hidden transition-all duration-300 bg-[var(--color-accent-soft)] flex items-center justify-center">
                  <span className="text-[var(--color-accent)] text-sm font-medium flex items-center gap-2">
                    <EditIcon className="w-4 h-4" />
                    Editar lista
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {/* Add new card */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="group min-h-[180px] border-2 border-dashed border-[var(--color-border)] rounded-2xl flex flex-col items-center justify-center gap-3 transition-all hover:border-[var(--color-border-accent)] hover:bg-[var(--color-accent-soft)] animate-fade-in-up active:scale-98"
            style={{ animationDelay: `${lists.length * 0.05}s` }}
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-elevated)] group-hover:bg-[var(--color-accent-soft)] flex items-center justify-center transition-colors">
              <PlusIcon className="w-6 h-6 text-[var(--color-text-subtle)] group-hover:text-[var(--color-accent)] transition-colors" />
            </div>
            <span className="text-[var(--color-text-subtle)] group-hover:text-[var(--color-accent)] transition-colors text-sm">
              Nueva lista
            </span>
          </button>
        </div>
      )}

      {/* Floating Action Button (mobile) */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[var(--gradient-accent)] rounded-2xl shadow-[var(--shadow-medium)] flex items-center justify-center text-[#1a1a1a] hover:scale-110 transition-transform z-40"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => { setShowCreateModal(false); setNewListName(''); }}
        >
          <div
            className="bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-8 w-full max-w-md shadow-[var(--shadow-elevated)] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center">
                <MenuPreviewIcon className="w-8 h-8 text-[var(--color-accent)]" />
              </div>
              <h2 className="text-2xl font-light text-[var(--color-text-primary)]">
                Nueva Lista
              </h2>
              <p className="text-[var(--color-text-subtle)] text-sm mt-2">
                Dale un nombre a tu nueva lista de precios
              </p>
            </div>

            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="ej. Lista principal, Promociones..."
              className="soft-input w-full text-center"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
            />

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewListName('')
                }}
                className="soft-button flex-1 py-4"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateList}
                disabled={!newListName.trim() || creating}
                className="soft-button-primary flex-1 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Hoy'
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

function MenuPreviewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  )
}

export default ListsScreen
