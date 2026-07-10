import type { Item } from '../types'

interface MenuItemProps {
  item: Item
  viewMode?: 'grid' | 'list'
}

export function MenuItem({ item, viewMode = 'grid' }: MenuItemProps) {
  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(parseFloat(item.price))

  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
        {item.imageUrl ? (
          <img
            src={item.imageThumbUrl || item.imageUrl}
            alt={item.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
            <PlaceholderIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
          {item.description && (
            <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
          )}
        </div>
        <div className="text-lg font-semibold text-emerald-600">{formattedPrice}</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {item.imageUrl ? (
        <img
          src={item.imageThumbUrl || item.imageUrl}
          alt={item.name}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <PlaceholderIcon className="w-12 h-12 text-gray-400" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-gray-900">{item.name}</h3>
          <span className="text-lg font-semibold text-emerald-600 whitespace-nowrap">
            {formattedPrice}
          </span>
        </div>
        {item.description && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">{item.description}</p>
        )}
      </div>
    </div>
  )
}

function PlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}

export default MenuItem
