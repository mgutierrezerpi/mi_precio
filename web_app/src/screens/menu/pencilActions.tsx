import type { DesignProps } from './designs'
import { cartThemeFor, SIco } from './designs'

export function PencilActionBar({
  props,
  docked = false,
  hideOnDesktop = false,
  askLabel,
}: {
  props: DesignProps
  /** Replaces the WhatsApp button's wording (e.g. "Reservar turno"). */
  askLabel?: string
  /** Rendered in the flow of a layout (the desktop cover) instead of floating. */
  docked?: boolean
  /** The layout already docks its own copy from lg up, so the floating one steps aside. */
  hideOnDesktop?: boolean
}) {
  const { cartCount, openCart, t, waHref, checkoutChannel, onCheckout } = props
  const cartTheme = props.cartTheme ?? cartThemeFor('pencil-journal')
  const cartLabel =
    cartCount > 0 ? `${t('store.myCart')} · ${cartCount}` : t('store.myCart')
  const cartAccent = cartTheme.actionAccent || cartTheme.accent || props.accent
  const cartGradient = `linear-gradient(135deg, ${cartAccent} 0%, ${cartAccent} 100%)`
  const barClassName = docked
    ? 'w-full'
    : [
        'fixed inset-x-4 bottom-4 z-40 mx-auto max-w-[680px] border p-2',
        'shadow-[0_18px_50px_-16px_rgba(15,13,26,0.45)] backdrop-blur sm:inset-x-6 sm:p-2.5',
        // Centered across the bottom is a thumb-reach bar: on a monitor it reads
        // as a phone app parked mid-screen. From lg it docks to the corner.
        'lg:inset-x-auto lg:bottom-6 lg:right-8 lg:mx-0 lg:w-[420px]',
        hideOnDesktop ? 'lg:hidden' : '',
      ].join(' ')
  const actionClassName = [
    'flex min-h-12 items-center justify-center gap-2 px-3 text-center text-[12px] font-bold text-white',
    'transition-opacity hover:opacity-90 sm:text-[13px]',
  ].join(' ')

  return (
    <div
      className={barClassName}
      style={
        docked
          ? undefined
          : {
              background: `${cartTheme.surface}F2`,
              borderColor: cartTheme.line,
              borderRadius: cartTheme.barRadius,
            }
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <a
          href={waHref}
          onClick={onCheckout}
          target="_blank"
          rel="noopener noreferrer"
          className={actionClassName}
          style={{
            background:
              checkoutChannel === 'instagram'
                ? 'linear-gradient(135deg, #833AB4, #E1306C, #FCAF45)'
                : '#25D366',
            borderRadius: cartTheme.buttonRadius,
          }}
        >
          <SIco name="message-circle" size={18} color="#fff" />
          {checkoutChannel === 'instagram'
            ? 'Copiar pedido · Instagram'
            : askLabel
              ? askLabel
              : cartCount > 0
                ? t('pub.cartWhatsApp')
                : t('pub.askWhatsApp')}
        </a>
        <button
          type="button"
          onClick={openCart}
          className={actionClassName}
          style={{
            background: cartGradient,
            color: '#fff',
            borderRadius: cartTheme.buttonRadius,
          }}
        >
          <SIco name="shopping-cart" size={18} color="#fff" />
          {cartLabel}
        </button>
      </div>
    </div>
  )
}
