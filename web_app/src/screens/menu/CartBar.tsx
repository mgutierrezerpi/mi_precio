import { SIco, type CartTheme } from './designs'

type Translate = (key: string, vars?: Record<string, string>) => string

interface CartBarProps {
  theme: CartTheme
  accent: string
  gradient: string
  t: Translate
  count: number
  total: string
  onClear: () => void
  onOpen: () => void
}

export function CartBar({
  theme,
  accent,
  gradient,
  t,
  count,
  total,
  onClear,
  onOpen,
}: CartBarProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur md:hidden"
      style={{
        background: `${theme.surface}F2`,
        borderColor: theme.line,
        boxShadow: '0 -4px 24px rgba(15,13,26,0.12)',
      }}
    >
      <div className="mx-auto flex w-full max-w-[1160px] items-center justify-between gap-3 px-4 py-3 md:gap-4 md:px-12 md:py-4">
        <div className="flex min-w-0 items-center gap-2.5 md:gap-3.5">
          <SIco name="shopping-cart" size={22} color={accent} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="hidden text-[11px] font-bold tracking-[1.6px] sm:block" style={{ color: accent }}>
              {t('pub.cartTitle')}
            </span>
            <span className="text-[13px] font-semibold leading-tight md:text-[15px]" style={{ color: theme.ink }}>
              {t('pub.cartSummary', {
                n: String(count),
                unit: count === 1 ? t('pub.product') : t('pub.products'),
                total,
              })}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 md:gap-4">
          <button type="button" onClick={onClear} className="hidden text-[13px] font-semibold hover:opacity-70 sm:block" style={{ color: theme.muted }}>
            {t('pub.cartClear')}
          </button>
          <button type="button" onClick={onOpen} className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-[13px] font-bold text-white hover:opacity-90 md:px-5 md:py-3 md:text-[14px]" style={{ background: gradient }}>
            <SIco name="shopping-cart" size={18} color="#fff" />
            {t('store.myCart')}
          </button>
        </div>
      </div>
    </div>
  )
}
