import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  fetchList,
  fetchVersions,
  fetchItems,
  updateList,
  updateVersion,
  deleteList,
  createItem,
  updateItem,
  deleteItem,
  selectCurrentList,
  selectCurrentVersion,
  selectItems,
  selectIsLoading,
} from '../../store/slices/menuSlice'
import { toast } from '../../components/Toast'
import api from '../../services/api'
import { selectTenant, selectCanEdit } from '../../store/slices/authSlice'

interface ExtractedItem {
  name: string
  price: number
  description: string | null
}

export function ListEditScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const list = useAppSelector(selectCurrentList)
  const tenant = useAppSelector(selectTenant)
  const canEdit = useAppSelector(selectCanEdit)
  const currentVersion = useAppSelector(selectCurrentVersion)
  const items = useAppSelector(selectItems)
  const isLoading = useAppSelector(selectIsLoading)

  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [isEditingSlug, setIsEditingSlug] = useState(false)
  const [editedSlug, setEditedSlug] = useState('')
  const [showAddItem, setShowAddItem] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '' })
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editedItem, setEditedItem] = useState({ name: '', price: '', description: '', category: '' })

  // Import state
  const [showImportModal, setShowImportModal] = useState(false)
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [processedImages, setProcessedImages] = useState<{
    url: string
    status: 'pending' | 'processing' | 'done' | 'error'
    items: ExtractedItem[]
    error?: string
  }[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set()) // key: "imageIdx-itemIdx"

  useEffect(() => {
    if (id) {
      dispatch(fetchList(id))
      dispatch(fetchVersions(id))
    }
  }, [dispatch, id])

  // Sync version published status with list on initial load
  const [hasSyncedVersion, setHasSyncedVersion] = useState(false)

  useEffect(() => {
    if (currentVersion?.id) {
      dispatch(fetchItems(currentVersion.id))
    }
  }, [dispatch, currentVersion?.id])

  useEffect(() => {
    // Auto-sync version published status with list if they're out of sync (one-time fix)
    if (list && currentVersion?.id && !hasSyncedVersion && currentVersion.published !== list.published) {
      setHasSyncedVersion(true)
      dispatch(updateVersion({ versionId: currentVersion.id, data: { published: list.published } }))
    }
  }, [dispatch, list, currentVersion, hasSyncedVersion])

  useEffect(() => {
    if (list) {
      setEditedName(list.name)
      setEditedSlug(list.slug || '')
    }
  }, [list])

  const handleUpdateName = async () => {
    if (!id || !editedName.trim() || editedName === list?.name) {
      setIsEditingName(false)
      return
    }
    await dispatch(updateList({ listId: id, data: { name: editedName.trim() } }))
    setIsEditingName(false)
    toast.success('Nombre actualizado')
  }

  const handleUpdateSlug = async () => {
    if (!id || !editedSlug.trim() || editedSlug === list?.slug) {
      setIsEditingSlug(false)
      return
    }
    await dispatch(updateList({ listId: id, data: { slug: editedSlug.trim() } }))
    setIsEditingSlug(false)
    toast.success('Link actualizado')
  }

  const handleTogglePublished = async () => {
    if (!id || !list) return
    const newPublished = !list.published
    await dispatch(updateList({ listId: id, data: { published: newPublished } }))
    // Also publish/unpublish the version so it shows in public view
    if (currentVersion?.id) {
      await dispatch(updateVersion({ versionId: currentVersion.id, data: { published: newPublished } }))
    }
    toast.success(newPublished ? 'Lista publicada' : 'Lista despublicada')
  }

  const handleToggleShowOnIndex = async () => {
    if (!id || !list) return
    await dispatch(updateList({ listId: id, data: { showOnIndex: !list.showOnIndex } }))
    toast.success(list.showOnIndex ? 'Quitada de principal' : 'Marcada como principal')
  }

  const handleDelete = async () => {
    if (!id) return
    if (confirm('¿Estás seguro de eliminar esta lista? Esta acción no se puede deshacer.')) {
      await dispatch(deleteList(id))
      toast.success('Lista eliminada')
      navigate('/admin/lists')
    }
  }

  const handleAddItem = async () => {
    const versionId = currentVersion?.id
    if (!versionId || !newItem.name.trim() || !newItem.price) return

    await dispatch(createItem({
      versionId,
      data: {
        name: newItem.name.trim(),
        price: parseFloat(newItem.price),
        description: newItem.description.trim() || undefined,
      }
    }))
    setNewItem({ name: '', price: '', description: '' })
    setShowAddItem(false)
    toast.success('Producto agregado')
  }

  const handleStartEditItem = (item: typeof items[0]) => {
    setEditingItemId(item.id)
    setEditedItem({
      name: item.name,
      price: item.price,
      description: item.description || '',
      category: item.category || '',
    })
  }

  const handleSaveItem = async () => {
    if (!editingItemId || !editedItem.name.trim() || !editedItem.price) return

    await dispatch(updateItem({
      itemId: editingItemId,
      data: {
        name: editedItem.name.trim(),
        price: parseFloat(editedItem.price),
        description: editedItem.description.trim() || undefined,
        category: editedItem.category.trim() || undefined,
      }
    }))
    setEditingItemId(null)
    toast.success('Producto actualizado')
  }

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('¿Eliminar este producto?')) {
      await dispatch(deleteItem(itemId))
      toast.success('Producto eliminado')
    }
  }

  // Process pending images
  useEffect(() => {
    const processPendingImages = async () => {
      const pendingIndex = processedImages.findIndex(img => img.status === 'pending')
      if (pendingIndex === -1) return

      // Update status to processing
      setProcessedImages(prev => prev.map((img, i) =>
        i === pendingIndex ? { ...img, status: 'processing' as const } : img
      ))

      const image = processedImages[pendingIndex]

      try {
        const response = await api.importFromImages([image.url])

        if (response.error) {
          setProcessedImages(prev => prev.map((img, i) =>
            i === pendingIndex ? { ...img, status: 'error' as const, error: response.error } : img
          ))
        } else if (response.data) {
          const items = response.data.items
          setProcessedImages(prev => prev.map((img, i) =>
            i === pendingIndex ? { ...img, status: 'done' as const, items } : img
          ))
          // Auto-select all new items
          setSelectedItems(prev => {
            const newSelected = new Set(prev)
            items.forEach((_, itemIdx) => newSelected.add(`${pendingIndex}-${itemIdx}`))
            return newSelected
          })
        }
      } catch {
        setProcessedImages(prev => prev.map((img, i) =>
          i === pendingIndex ? { ...img, status: 'error' as const, error: 'Error de conexión' } : img
        ))
      }
    }

    // Check if there's a pending image and no currently processing
    const hasPending = processedImages.some(img => img.status === 'pending')
    const hasProcessing = processedImages.some(img => img.status === 'processing')

    if (hasPending && !hasProcessing) {
      processPendingImages()
    }
  }, [processedImages])

  // Handle pasting/adding new image URLs
  const handleAddImageUrls = (input: string) => {
    const urls = input
      .split(/[\n,\s]+/)
      .map(u => u.trim())
      .filter(u => u.startsWith('http'))

    if (urls.length === 0) return

    // Add new images to the list
    const existingUrls = new Set(processedImages.map(img => img.url))
    const newImages = urls
      .filter(url => !existingUrls.has(url))
      .map(url => ({ url, status: 'pending' as const, items: [] }))

    if (newImages.length > 0) {
      setProcessedImages(prev => [...prev, ...newImages])
      setImageUrlInput('')
    }
  }

  // Handle input change with auto-detect paste
  const handleImageInputChange = (value: string) => {
    setImageUrlInput(value)
    // Auto-process if it looks like a complete URL was pasted
    if (value.includes('http') && (value.includes('\n') || value.endsWith('.jpg') || value.endsWith('.png') || value.endsWith('.jpeg') || value.endsWith('.webp') || value.includes('googleusercontent'))) {
      handleAddImageUrls(value)
    }
  }

  const handleImageInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddImageUrls(imageUrlInput)
    }
  }

  const handleRemoveImage = (index: number) => {
    setProcessedImages(prev => prev.filter((_, i) => i !== index))
    // Remove associated selections
    setSelectedItems(prev => {
      const newSelected = new Set(prev)
      for (const key of prev) {
        if (key.startsWith(`${index}-`)) {
          newSelected.delete(key)
        }
      }
      return newSelected
    })
  }

  const handleToggleItem = (imageIdx: number, itemIdx: number) => {
    const key = `${imageIdx}-${itemIdx}`
    setSelectedItems(prev => {
      const newSelected = new Set(prev)
      if (newSelected.has(key)) {
        newSelected.delete(key)
      } else {
        newSelected.add(key)
      }
      return newSelected
    })
  }

  const handleAddSelectedItems = async () => {
    const versionId = currentVersion?.id
    if (!versionId) return

    // Collect all selected items and dedupe by name (keep highest price)
    const itemsByName = new Map<string, ExtractedItem>()

    for (const key of selectedItems) {
      const [imageIdx, itemIdx] = key.split('-').map(Number)
      const item = processedImages[imageIdx]?.items[itemIdx]
      if (item) {
        const normalizedName = item.name.toLowerCase().trim()
        const existing = itemsByName.get(normalizedName)
        // Keep the one with the highest price
        if (!existing || item.price > existing.price) {
          itemsByName.set(normalizedName, item)
        }
      }
    }

    // Add deduplicated items
    const itemCount = itemsByName.size
    for (const item of itemsByName.values()) {
      await dispatch(createItem({
        versionId,
        data: {
          name: item.name,
          price: item.price,
          description: item.description || undefined,
        }
      }))
    }

    // Reset import state
    setShowImportModal(false)
    setImageUrlInput('')
    setProcessedImages([])
    setSelectedItems(new Set())
    toast.success(`${itemCount} producto${itemCount !== 1 ? 's' : ''} importado${itemCount !== 1 ? 's' : ''}`)
  }

  const formatPrice = (price: string) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(parseFloat(price))

  if (isLoading && !list) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--color-text-muted)] text-sm">Cargando lista...</p>
        </div>
      </div>
    )
  }

  if (!list) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-[var(--color-text-muted)] mb-4">Lista no encontrada</p>
        <Link to="/admin/lists" className="text-[var(--color-accent)] hover:underline">
          Volver a listas
        </Link>
      </div>
    )
  }

  const publicListPath = `/p/${tenant?.subdomain || ''}/${list.slug || list.id}`
  const publicListUrl = `${window.location.origin}${publicListPath}`

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link
          to="/admin/lists"
          className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors text-sm flex items-center gap-2"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Volver a listas
        </Link>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 mb-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="soft-input flex-1 text-2xl font-medium"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateName()
                    if (e.key === 'Escape') setIsEditingName(false)
                  }}
                />
                <button
                  onClick={handleUpdateName}
                  className="p-2 text-[var(--color-success)] hover:bg-[var(--color-success-soft)] rounded-xl transition-colors"
                >
                  <CheckIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  className="p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] rounded-xl transition-colors"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            ) : canEdit ? (
              <button
                onClick={() => setIsEditingName(true)}
                className="group flex items-center gap-3 text-left"
              >
                <h1 className="text-2xl font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                  {list.name}
                </h1>
                <PencilIcon className="w-4 h-4 text-[var(--color-text-subtle)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ) : (
              <h1 className="text-2xl font-medium text-[var(--color-text-primary)]">{list.name}</h1>
            )}

            <div className="flex items-center gap-3 mt-4">
              {/* Published toggle */}
              <button
                onClick={canEdit ? handleTogglePublished : undefined}
                disabled={!canEdit}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${!canEdit ? 'cursor-default' : ''} ${
                  list.published
                    ? `bg-[var(--color-success-soft)] text-[var(--color-success)] ${canEdit ? 'hover:bg-[var(--color-success)]/20' : ''}`
                    : `bg-[var(--color-warning-soft)] text-[var(--color-warning)] ${canEdit ? 'hover:bg-[var(--color-warning)]/20' : ''}`
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${list.published ? 'bg-[var(--color-success)]' : 'bg-[var(--color-warning)]'}`} />
                {list.published ? 'Publicado' : 'Borrador'}
              </button>

              {/* Show on index toggle */}
              <button
                onClick={canEdit ? handleToggleShowOnIndex : undefined}
                disabled={!canEdit}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${!canEdit ? 'cursor-default' : ''} ${
                  list.showOnIndex
                    ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                    : `bg-[var(--color-bg-elevated)] text-[var(--color-text-subtle)] ${canEdit ? 'hover:bg-[var(--color-bg-hover)]' : ''}`
                }`}
              >
                <StarIcon className={`w-4 h-4 ${list.showOnIndex ? 'fill-current' : ''}`} />
                Principal
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4">
              <p className="text-xs tracking-widest uppercase text-[var(--color-text-subtle)] mb-2">
                Link público
              </p>
              {isEditingSlug ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[var(--color-text-muted)] whitespace-nowrap">
                    /p/{tenant?.subdomain || 'tu_negocio'}/
                  </span>
                  <input
                    type="text"
                    value={editedSlug}
                    onChange={(e) => setEditedSlug(e.target.value)}
                    className="soft-input flex-1 text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdateSlug()
                      if (e.key === 'Escape') setIsEditingSlug(false)
                    }}
                  />
                  <button
                    onClick={handleUpdateSlug}
                    className="p-2 text-[var(--color-success)] hover:bg-[var(--color-success-soft)] rounded-xl transition-colors"
                  >
                    <CheckIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsEditingSlug(false)}
                    className="p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] rounded-xl transition-colors"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <Link
                    to={publicListPath}
                    className="text-sm text-[var(--color-accent)] hover:underline break-all"
                  >
                    {publicListUrl}
                  </Link>
                  {canEdit && (
                    <button
                      onClick={() => setIsEditingSlug(true)}
                      className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors whitespace-nowrap"
                    >
                      Editar link
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {canEdit && (
            <button
              onClick={handleDelete}
              className="p-2 text-[var(--color-text-subtle)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-soft)] rounded-xl transition-all"
              title="Eliminar lista"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Items Section */}
      <div className="bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-[var(--shadow-soft)]">
        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-[var(--color-text-primary)]">Productos</h2>
            <p className="text-sm text-[var(--color-text-subtle)] mt-1">
              {items.length} producto{items.length !== 1 ? 's' : ''} en esta lista
            </p>
          </div>
          {canEdit && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowImportModal(true)}
                className="soft-button flex items-center gap-2"
              >
                <ImportIcon className="w-4 h-4" />
                Importar
              </button>
              <button
                onClick={() => setShowAddItem(true)}
                className="soft-button-primary flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Agregar
              </button>
            </div>
          )}
        </div>

        {/* Add item form */}
        {showAddItem && (
          <div className="p-6 bg-[var(--color-bg-elevated)]/50 border-b border-[var(--color-border)]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Nombre del producto"
                className="soft-input md:col-span-5"
                autoFocus
              />
              <input
                type="number"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                placeholder="Precio"
                className="soft-input md:col-span-2"
              />
              <input
                type="text"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Descripción (opcional)"
                className="soft-input md:col-span-5"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowAddItem(false)
                  setNewItem({ name: '', price: '', description: '' })
                }}
                className="soft-button-ghost"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddItem}
                disabled={!newItem.name.trim() || !newItem.price}
                className="soft-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* Items list */}
        {items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-bg-elevated)] flex items-center justify-center">
              <BoxIcon className="w-8 h-8 text-[var(--color-text-subtle)]" />
            </div>
            <p className="text-[var(--color-text-subtle)] mb-4">
              No hay productos en esta lista
            </p>
            {canEdit && (
              <button
                onClick={() => setShowAddItem(true)}
                className="text-[var(--color-accent)] hover:underline"
              >
                Agregar el primero
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-[var(--color-bg-hover)]/50 transition-colors"
              >
                {editingItemId === item.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <input
                        type="text"
                        value={editedItem.name}
                        onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
                        placeholder="Nombre"
                        className="soft-input md:col-span-5 py-2"
                        autoFocus
                      />
                      <input
                        type="number"
                        value={editedItem.price}
                        onChange={(e) => setEditedItem({ ...editedItem, price: e.target.value })}
                        placeholder="Precio"
                        className="soft-input md:col-span-2 py-2"
                      />
                      <input
                        type="text"
                        value={editedItem.category}
                        onChange={(e) => setEditedItem({ ...editedItem, category: e.target.value })}
                        placeholder="Categoría (ej: Bebidas)"
                        className="soft-input md:col-span-3 py-2"
                      />
                      <div className="md:col-span-2 flex items-center justify-end gap-2">
                        <button
                          onClick={handleSaveItem}
                          className="p-2 text-[var(--color-success)] hover:bg-[var(--color-success-soft)] rounded-xl transition-colors"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingItemId(null)}
                          className="p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] rounded-xl transition-colors"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={editedItem.description}
                      onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
                      placeholder="Descripción (opcional)"
                      className="soft-input w-full py-2"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-[var(--color-text-primary)] font-medium truncate">
                          {item.name}
                        </span>
                        {item.category && (
                          <span className="soft-badge text-[10px]">
                            {item.category}
                          </span>
                        )}
                        {item.description && (
                          <span className="text-[var(--color-text-subtle)] text-sm truncate hidden md:inline">
                            — {item.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[var(--color-accent)] font-medium whitespace-nowrap">
                        {formatPrice(item.price)}
                      </span>
                      {canEdit && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEditItem(item)}
                            className="p-2 text-[var(--color-text-subtle)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] rounded-xl transition-all"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 text-[var(--color-text-subtle)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-soft)] rounded-xl transition-all"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-[var(--shadow-elevated)] animate-scale-in">
            {/* Header */}
            <div className="p-6 border-b border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-medium text-[var(--color-text-primary)]">
                    Importar desde fotos
                  </h2>
                  <p className="text-sm text-[var(--color-text-subtle)] mt-1">
                    Pega links de fotos del menú y se analizarán automáticamente
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowImportModal(false)
                    setImageUrlInput('')
                    setProcessedImages([])
                    setSelectedItems(new Set())
                  }}
                  className="p-2 text-[var(--color-text-subtle)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] rounded-xl transition-colors"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              {/* URL Input */}
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => handleImageInputChange(e.target.value)}
                  onKeyDown={handleImageInputKeyDown}
                  placeholder="Pega un link de imagen del menú..."
                  className="soft-input flex-1"
                  autoFocus
                />
                <button
                  onClick={() => handleAddImageUrls(imageUrlInput)}
                  disabled={!imageUrlInput.trim()}
                  className="soft-button-primary px-5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Images being processed */}
              {processedImages.length > 0 && (
                <div className="space-y-4">
                  {processedImages.map((image, imageIdx) => (
                    <div key={imageIdx} className="border border-[var(--color-border)] rounded-xl overflow-hidden">
                      {/* Image header */}
                      <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-elevated)]">
                        <img
                          src={image.url}
                          alt="Menu"
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>'
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--color-text-secondary)] truncate">
                            {image.url.split('/').pop()?.substring(0, 40) || 'Imagen'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {image.status === 'pending' && (
                              <span className="text-xs text-[var(--color-text-muted)]">Esperando...</span>
                            )}
                            {image.status === 'processing' && (
                              <span className="text-xs text-[var(--color-accent)] flex items-center gap-1">
                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Analizando...
                              </span>
                            )}
                            {image.status === 'done' && (
                              <span className="text-xs text-emerald-400">
                                {image.items.length} productos encontrados
                              </span>
                            )}
                            {image.status === 'error' && (
                              <span className="text-xs text-red-400">{image.error}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveImage(imageIdx)}
                          className="p-1.5 text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Extracted items */}
                      {image.items.length > 0 && (
                        <div className="divide-y divide-[var(--color-border)]">
                          {image.items.map((item, itemIdx) => {
                            const key = `${imageIdx}-${itemIdx}`
                            // Check if this is a duplicate (same name in earlier image or earlier in same image)
                            const normalizedName = item.name.toLowerCase().trim()
                            let isDuplicate = false
                            for (let pi = 0; pi <= imageIdx; pi++) {
                              const img = processedImages[pi]
                              const maxIdx = pi === imageIdx ? itemIdx : img.items.length
                              for (let ii = 0; ii < maxIdx; ii++) {
                                if (img.items[ii]?.name.toLowerCase().trim() === normalizedName) {
                                  isDuplicate = true
                                  break
                                }
                              }
                              if (isDuplicate) break
                            }
                            return (
                              <label
                                key={itemIdx}
                                className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                                  selectedItems.has(key)
                                    ? 'bg-[var(--color-accent)]/5'
                                    : 'hover:bg-[var(--color-bg-elevated)]/50'
                                } ${isDuplicate ? 'opacity-50' : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedItems.has(key)}
                                  onChange={() => handleToggleItem(imageIdx, itemIdx)}
                                  className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:ring-offset-0 bg-[var(--color-bg-elevated)]"
                                />
                                <div className="flex-1 min-w-0">
                                  <span className="text-[var(--color-text-primary)] text-sm">
                                    {item.name}
                                  </span>
                                  {item.description && (
                                    <span className="text-[var(--color-text-muted)] text-xs ml-2">
                                      — {item.description}
                                    </span>
                                  )}
                                  {isDuplicate && (
                                    <span className="text-amber-400 text-xs ml-2">(duplicado)</span>
                                  )}
                                </div>
                                <span className="text-[var(--color-accent)] text-sm font-medium whitespace-nowrap">
                                  ${item.price.toLocaleString()}
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {processedImages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-[var(--color-accent)]" />
                  </div>
                  <p className="text-[var(--color-text-secondary)] mb-2">
                    Pega links de fotos del menú
                  </p>
                  <p className="text-[var(--color-text-subtle)] text-sm">
                    Soporta imágenes de Google Fotos, Instagram, etc.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {selectedItems.size > 0 && (
              <div className="p-6 border-t border-[var(--color-border)] flex items-center justify-between">
                <p className="text-sm text-[var(--color-text-subtle)]">
                  {selectedItems.size} producto{selectedItems.size !== 1 ? 's' : ''} seleccionado{selectedItems.size !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={handleAddSelectedItems}
                  className="soft-button-primary px-6 py-3"
                >
                  Agregar {selectedItems.size} producto{selectedItems.size !== 1 ? 's' : ''}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Icons
function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  )
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  )
}

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  )
}

function ImportIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  )
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}

export default ListEditScreen
