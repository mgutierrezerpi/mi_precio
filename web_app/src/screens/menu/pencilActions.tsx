import type { DesignProps } from './designs'
import { SIco } from './designs'

export function PencilActionBar({ props }: { props: DesignProps }) {
  const { brandGradient, cartCount, openCart, t, waHref } = props
  const cartLabel = cartCount > 0 ? `${t('store.myCart')} · ${cartCount}` : t('store.myCart')

  return (
    <div className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-[680px] rounded-2xl border border-black/10 bg-white/95 p-2 shadow-[0_18px_50px_-16px_rgba(15,13,26,0.45)] backdrop-blur sm:inset-x-6 sm:p-2.5">
      <div className="grid grid-cols-2 gap-2">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 text-center text-[12px] font-bold text-white transition-opacity hover:opacity-90 sm:text-[13px]"
        >
          <SIco name="message-circle" size={18} color="#fff" />
          {t('pub.cartWhatsApp')}
        </a>
        <button
          type="button"
          onClick={openCart}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-center text-[12px] font-bold text-white transition-opacity hover:opacity-90 sm:text-[13px]"
          style={{ background: brandGradient, color: '#fff' }}
        >
          <SIco name="shopping-cart" size={18} color="#fff" />
          {cartLabel}
        </button>
      </div>
    </div>
  )
}
