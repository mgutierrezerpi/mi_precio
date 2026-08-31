import { useCallback, useEffect, useState } from 'react'
import type { Customer, Order, Product } from '../../../types'
import api from '../../../services/api'
import { useOperationsT } from '../customerUtils'
import { DrawerPanel } from './parts/drawer_panel'
import { Overlay } from './shared'

export function CustomerDrawer({
  customerId,
  products,
  money,
  canEdit,
  onClose,
  onChanged,
}: {
  customerId: string
  products: Product[]
  money: (value: string | number) => string
  canEdit: boolean
  onClose: () => void
  onChanged: () => Promise<void>
}) {
  const t = useOperationsT()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingCustomer, setEditingCustomer] = useState(false)
  const load = useCallback(async () => {
    const res = await api.getCustomerDetail(customerId)
    if (res.data) {
      setCustomer(res.data.customer)
      setOrders(res.data.orders)
    }
    setLoading(false)
  }, [customerId])
  useEffect(() => {
    let cancelled = false
    api.getCustomerDetail(customerId).then((res) => {
      if (cancelled || !res.data) return
      setCustomer(res.data.customer)
      setOrders(res.data.orders)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [customerId])
  const reloadAll = async () => {
    await load()
    await onChanged()
  }
  const removeCustomer = async () => {
    if (!confirm(t('customers.deleteCurrentConfirm'))) return
    await api.deleteCustomer(customerId)
    await onChanged()
    onClose()
  }
  const removeOrder = async (orderId: string) => {
    await api.deleteOrder(orderId)
    await reloadAll()
  }
  return (
    <Overlay onClose={onClose} align="right">
      <DrawerPanel
        customer={customer}
        loading={loading}
        products={products}
        money={money}
        orders={orders}
        canEdit={canEdit}
        adding={adding}
        editingId={editingId}
        customerId={customerId}
        editingCustomer={editingCustomer}
        onClose={onClose}
        onDeleteCustomer={removeCustomer}
        onToggleAdd={() => {
          setEditingId(null)
          setAdding((value) => !value)
        }}
        onEditOrder={(id) => {
          setAdding(false)
          setEditingId(id)
        }}
        onDeleteOrder={removeOrder}
        onSaved={async () => {
          setAdding(false)
          setEditingId(null)
          await reloadAll()
        }}
        onCancelEdit={() => setEditingId(null)}
        onEditCustomer={() => setEditingCustomer(true)}
        onCloseEditCustomer={() => setEditingCustomer(false)}
      />
    </Overlay>
  )
}
