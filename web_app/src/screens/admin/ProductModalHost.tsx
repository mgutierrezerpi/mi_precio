import type { PriceList, Product } from '../../types'
import { ProductModal } from './ProductModal'

export function ProductModalHost({
  open,
  product,
  tenantId,
  lists,
  onClose,
}: {
  open: boolean
  product: Product | null
  tenantId?: string
  lists: PriceList[]
  onClose: () => void
}) {
  if (!open) return null
  return (
    <ProductModal
      key={product?.id ?? 'new'}
      product={product}
      tenantId={tenantId}
      lists={lists}
      onClose={onClose}
    />
  )
}
