import { useState } from 'react'
import type { Order, Product } from '../../../../types'
import api from '../../../../services/api'
import { newLine, type Line } from './order_types'

export function useOrderForm({
  customerId,
  products,
  order,
  onSaved,
}: {
  customerId: string
  products: Product[]
  order?: Order
  onSaved: () => Promise<void>
}) {
  const initialLines =
    order && order.items.length
      ? order.items.map((item) => ({
          name: item.name,
          quantity: String(item.quantity),
          unitPrice: item.unitPrice,
          custom: !products.some((product) => product.name === item.name),
        }))
      : [newLine()]
  const [lines, setLines] = useState<Line[]>(initialLines)
  const [reference, setReference] = useState(order?.reference ?? '')
  const [note, setNote] = useState(order?.note ?? '')
  const [status, setStatus] = useState(order?.status ?? 'paid')
  const [saving, setSaving] = useState(false)
  const setLine = (index: number, patch: Partial<Line>) =>
    setLines((current) =>
      current.map((line, i) => (i === index ? { ...line, ...patch } : line))
    )
  const pickProduct = (index: number, value: string) => {
    if (value === '__custom__')
      return setLine(index, { custom: true, name: '', unitPrice: '' })
    const product = products.find((item) => item.name === value)
    setLine(index, {
      custom: false,
      name: value,
      unitPrice: product ? product.price : '',
    })
  }
  const total = lines.reduce(
    (sum, line) =>
      sum + (parseFloat(line.unitPrice) || 0) * (parseInt(line.quantity) || 0),
    0
  )
  const valid = lines.some(
    (line) => line.name.trim() && parseFloat(line.unitPrice) > 0
  )
  const save = async () => {
    if (!valid || saving) return
    setSaving(true)
    const items = lines
      .filter((line) => line.name.trim() && parseFloat(line.unitPrice) > 0)
      .map((line) => ({
        name: line.name.trim(),
        quantity: parseInt(line.quantity) || 1,
        unit_price: parseFloat(line.unitPrice),
      }))
    const payload = {
      items,
      status,
      note: note.trim() || null,
      reference: reference.trim() || null,
    }
    if (order) await api.updateOrder(order.id, payload)
    else await api.createOrder(customerId, payload)
    setSaving(false)
    await onSaved()
  }
  return {
    lines,
    reference,
    note,
    status,
    saving,
    isEdit: !!order,
    total,
    valid,
    setReference,
    setNote,
    setStatus,
    setLine,
    pickProduct,
    addLine: () => setLines((current) => [...current, newLine()]),
    removeLine: (index: number) =>
      setLines((current) =>
        current.length > 1 ? current.filter((_, i) => i !== index) : current
      ),
    save,
  }
}
