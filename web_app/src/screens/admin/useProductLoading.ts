import { useEffect } from 'react'
import { useAppDispatch } from '../../store/hooks'
import { fetchLists } from '../../store/slices/menuSlice'
import { fetchProducts } from '../../store/slices/productsSlice'

export function useProductLoading(tenantId?: string) {
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (tenantId) dispatch(fetchProducts(tenantId))
  }, [dispatch, tenantId])
  useEffect(() => {
    if (tenantId) dispatch(fetchLists(tenantId))
  }, [dispatch, tenantId])
}
