import type { Item } from '../types'

interface MenuItemProps {
  item: Item
  viewMode?: 'grid' | 'list'
}

const listItemClass = [
  'flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200',
  'hover:shadow-md transition-shadow',
].join(' ')

const placeholderPath = [
  'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159',
  'm-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909',
  'm-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75',
  'A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25',
  'zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
].join('')

export function MenuItem({ item, viewMode = 'grid' }: MenuItemProps) {
  return viewMode === 'list' ? (
    <ListMenuItem item={item} />
  ) : (
    <GridMenuItem item={item} />
  )
}

function formatPrice(price: string): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(parseFloat(price))
}

function ListMenuItem({ item }: { item: Item }) {
  return (
    <div className={listItemClass}>
      <ItemImage
        item={item}
        className="w-16 h-16 rounded-lg"
        iconClassName="w-8 h-8"
        emptyClassName="bg-gray-100"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-gray-500 line-clamp-1">
            {item.description}
          </p>
        )}
      </div>
      <div className="text-lg font-semibold text-emerald-600">
        {formatPrice(item.price)}
      </div>
    </div>
  )
}

function GridMenuItem({ item }: { item: Item }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <ItemImage
        item={item}
        className="w-full h-40"
        iconClassName="w-12 h-12"
        emptyClassName="bg-gradient-to-br from-gray-100 to-gray-200"
      />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-gray-900">{item.name}</h3>
          <span className="text-lg font-semibold text-emerald-600 whitespace-nowrap">
            {formatPrice(item.price)}
          </span>
        </div>
        {item.description && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">
            {item.description}
          </p>
        )}
      </div>
    </div>
  )
}

function ItemImage({
  item,
  className,
  iconClassName,
  emptyClassName,
}: {
  item: Item
  className: string
  iconClassName: string
  emptyClassName: string
}) {
  if (item.imageUrl)
    return (
      <img
        src={item.imageThumbUrl || item.imageUrl}
        alt={item.name}
        className={`${className} object-cover`}
      />
    )
  return (
    <div
      className={`${className} ${emptyClassName} flex items-center justify-center`}
    >
      <PlaceholderIcon className={`${iconClassName} text-gray-400`} />
    </div>
  )
}

function PlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={placeholderPath} />
    </svg>
  )
}

export default MenuItem
