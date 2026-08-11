import type { DesignProps } from './designs'
import { cartThemeFor, SIco } from './designs'

export function PencilActionBar({ props }: { props: DesignProps }) {
  const { cartCount, openCart, t, waHref } = props
  const cartTheme = props.cartTheme ?? cartThemeFor('pencil-journal')
  const cartLabel = cartCount > 0 ? `${t('store.myCart')} · ${cartCount}` : t('store.myCart')
  const cartAccent = cartTheme.actionAccent || cartTheme.accent || props.accent
  const cartGradient = `linear-gradient(135deg, ${cartAccent} 0%, ${cartAccent} 100%)`

  return (
    <div className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-[680px] border p-2 shadow-[0_18px_50px_-16px_rgba(15,13,26,0.45)] backdrop-blur sm:inset-x-6 sm:p-2.5" style={{ background: `${cartTheme.surface}F2`, borderColor: cartTheme.line, borderRadius: cartTheme.barRadius }}>
      <div className="grid grid-cols-2 gap-2">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-12 items-center justify-center gap-2 px-3 text-center text-[12px] font-bold text-white transition-opacity hover:opacity-90 sm:text-[13px]"
          style={{ background: '#25D366', borderRadius: cartTheme.buttonRadius }}
        >
          <SIco name="message-circle" size={18} color="#fff" />
          {t('pub.cartWhatsApp')}
        </a>
        <button
          type="button"
          onClick={openCart}
          className="flex min-h-12 items-center justify-center gap-2 px-3 text-center text-[12px] font-bold text-white transition-opacity hover:opacity-90 sm:text-[13px]"
          style={{ background: cartGradient, color: '#fff', borderRadius: cartTheme.buttonRadius }}
        >
          <SIco name="shopping-cart" size={18} color="#fff" />
          {cartLabel}
        </button>
      </div>
    </div>
  )
}
