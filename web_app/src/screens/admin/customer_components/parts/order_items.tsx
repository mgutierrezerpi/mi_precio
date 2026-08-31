import type { Order } from '../../../../types'

export function OrderItems({
  items,
  money,
}: {
  items: Order['items']
  money: (value: string | number) => string
}) {
  return (
    <div className="flex flex-col gap-1 border-t border-[var(--dash-divider)] pt-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between text-xs"
        >
          <span className="font-medium text-[var(--dash-text2)]">
            {item.quantity}× {item.name}
          </span>
          <span className="font-semibold text-[var(--dash-muted)]">
            {money(parseFloat(item.unitPrice) * item.quantity)}
          </span>
        </div>
      ))}
    </div>
  )
}
