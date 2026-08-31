import { useEffect, useRef, useState } from 'react'
import type { PriceList, Product } from '../../types'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  createProduct,
  selectProductsSaving,
  updateProduct,
  type ProductInput,
} from '../../store/slices/productsSlice'
import api from '../../services/api'
import { normalizeCategory } from './crm/productFormat'
import { fileToImageBlob } from './productScreenUtils'

export function useProductForm({
  product,
  tenantId,
  lists,
  onClose,
  onCreated,
}: {
  product: Product | null
  tenantId?: string
  lists: PriceList[]
  onClose: () => void
  onCreated?: (product: Product) => void
}) {
  const dispatch = useAppDispatch()
  const saving = useAppSelector(selectProductsSaving)
  const [name, setName] = useState(product?.name ?? '')
  const [sku, setSku] = useState(product?.sku ?? '')
  const [category, setCategory] = useState(product?.category ?? '')
  const [price, setPrice] = useState(
    product ? String(parseFloat(product.price)) : ''
  )
  const [available, setAvailable] = useState(product?.available ?? true)
  const [description, setDescription] = useState(product?.description ?? '')
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '')
  const [imageThumbUrl, setImageThumbUrl] = useState(
    product?.imageThumbUrl ?? ''
  )
  const [selectedLists, setSelectedLists] = useState<Set<string>>(
    () => new Set(lists.map((list) => list.id))
  )
  const [imgLoading, setImgLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const priceChanged =
    !!product && (parseFloat(price) || 0) !== (parseFloat(product.price) || 0)
  useEffect(
    () => setSelectedLists(new Set(lists.map((list) => list.id))),
    [lists]
  )
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])
  const onPickImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImgLoading(true)
    setError(null)
    try {
      const image = await fileToImageBlob(file)
      if (!tenantId) throw new Error('No se encontró la empresa.')
      const response = await api.uploadProductImage(tenantId, image)
      if (response.error || !response.data)
        throw new Error(response.error || 'No se pudo subir la imagen.')
      setImageUrl(response.data.url)
      setImageThumbUrl(response.data.thumbnailUrl)
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'No se pudo subir la imagen.'
      )
    } finally {
      setImgLoading(false)
      event.target.value = ''
    }
  }
  const toggleList = (id: string) =>
    setSelectedLists((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    setError(null)
    const data: ProductInput = {
      name: name.trim(),
      price: parseFloat(price) || 0,
      available,
      sku: sku.trim() || null,
      category: normalizeCategory(category),
      description: description.trim() || null,
      imageUrl: imageUrl || '',
      imageThumbUrl: imageUrl ? imageThumbUrl || imageUrl : '',
    }
    if (priceChanged) data.priceListIds = Array.from(selectedLists)
    const result = product
      ? await dispatch(updateProduct({ productId: product.id, data }))
      : tenantId
        ? await dispatch(createProduct({ tenantId, data }))
        : null
    if (result && createProduct.fulfilled.match(result)) {
      onCreated?.(result.payload)
      onClose()
    } else if (result && updateProduct.fulfilled.match(result)) onClose()
    else if (
      result &&
      (createProduct.rejected.match(result) ||
        updateProduct.rejected.match(result))
    )
      setError((result.payload as string) || 'No se pudo guardar el producto.')
  }
  return {
    saving,
    name,
    setName,
    sku,
    setSku,
    category,
    setCategory,
    price,
    setPrice,
    available,
    setAvailable,
    description,
    setDescription,
    imageUrl,
    setImageUrl,
    imageThumbUrl,
    setImageThumbUrl,
    selectedLists,
    setSelectedLists,
    imgLoading,
    error,
    fileRef,
    priceChanged,
    onPickImage,
    toggleList,
    submit,
  }
}
