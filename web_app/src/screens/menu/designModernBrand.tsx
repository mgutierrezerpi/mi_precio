import { rootBg, CartControl, type DesignProps } from './designsShared'
import { readableOn } from '../../lib/designColors'
export function ModernBrand(p: DesignProps) {
  const {
    tenant,
    t,
    money,
    currency,
    updated,
    sections,
    base,
    allItems,
    isService,
    cart,
    addToCart,
    decFromCart,
  } = p
  const accent = p.accent,
    hero = p.heroColor,
    heroInk = readableOn(p.heroColor),
    ink = '#0F0F0F',
    soft = '#6B7280',
    line = '#E5E7EB'
  const stat = (v: string, l: string) => (
    <div className="flex flex-col gap-0.5">
      <span
        className="text-[22px] font-black md:text-[26px]"
        style={{ color: heroInk }}
      >
        {v}
      </span>
      <span
        className="text-[11px] font-semibold"
        style={{ color: heroInk, opacity: 0.75 }}
      >
        {l}
      </span>
    </div>
  )

  return (
    <div
      style={{
        background: rootBg('#FFFFFF', p.hasBg),
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Masthead */}
      <header className="border-b" style={{ borderColor: line }}>
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-6 py-10 md:px-12">
          <div className="flex items-center gap-3">
            {tenant.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt={tenant.name}
                className="h-12 w-auto max-w-[160px] object-contain"
              />
            ) : (
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl text-[18px] font-black text-white"
                style={{ background: accent }}
              >
                {(tenant.name || '·').charAt(0).toUpperCase()}
              </span>
            )}
            <span className="text-[15px] font-bold" style={{ color: ink }}>
              {tenant.name}
            </span>
          </div>
          <h1
            className="max-w-[820px] text-4xl font-black leading-[1.05] tracking-tight md:text-6xl"
            style={{ color: ink }}
          >
            {tenant.description || t('store.heroTitle', { name: tenant.name })}
          </h1>
        </div>
      </header>

      {/* Proof strip (uses the configurable hero color) */}
      <div style={{ background: hero }}>
        <div className="mx-auto flex w-full max-w-[1120px] flex-wrap gap-x-14 gap-y-4 px-6 py-6 md:px-12">
          {stat(String(allItems.length), t('store.statProducts'))}
          {stat(String(sections.length), t('store.categories'))}
          {stat(updated, t('store.statUpdated'))}
          {stat(currency, t('pub.currency'))}
        </div>
      </div>

      {/* Body */}
      <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-10 px-6 py-12 md:px-12">
        {sections.length === 0 ? (
          <p
            className="py-16 text-center text-sm font-medium"
            style={{ color: soft }}
          >
            {t('pub.empty')}
          </p>
        ) : (
          sections.map((s) => (
            <section key={s.key} className="flex flex-col">
              <div
                className="flex items-baseline justify-between border-b-2 pb-2"
                style={{ borderColor: ink }}
              >
                <h2
                  className="text-[20px] font-extrabold md:text-[24px]"
                  style={{ color: ink }}
                >
                  {s.name}
                </h2>
                <span className="text-[12px] font-bold" style={{ color: soft }}>
                  {s.items.length} · {money(s.min)}–{money(s.max)}
                </span>
              </div>
              {s.items.map((it) => (
                <div
                  key={it.id}
                  className="flex flex-wrap items-start gap-x-4 gap-y-2 border-b py-3.5 lg:flex-nowrap lg:items-center"
                  style={{ borderColor: line }}
                >
                  <div className="min-w-0 flex-1 basis-full lg:basis-0">
                    <p
                      className="break-words text-[15px] font-bold"
                      style={{ color: ink }}
                    >
                      {it.name}
                    </p>
                    {it.description && (
                      <p
                        className="mt-0.5 line-clamp-1 text-[12px] font-medium"
                        style={{ color: soft }}
                      >
                        {it.description}
                      </p>
                    )}
                  </div>
                  <div className="ml-auto flex shrink-0 items-center gap-3">
                    <span
                      className="text-[18px] font-black tabular-nums"
                      style={{ color: ink }}
                    >
                      {money(it.price)}
                    </span>
                    {!isService && (
                      <CartControl
                        qty={cart[it.id] ?? 0}
                        id={it.id}
                        addToCart={addToCart}
                        decFromCart={decFromCart}
                        accent={accent}
                        ink={ink}
                      />
                    )}
                  </div>
                </div>
              ))}
            </section>
          ))
        )}
        <p className="pt-2 text-[12px] font-medium" style={{ color: soft }}>
          {t('store.showing', {
            n: String(base.length),
            total: String(allItems.length),
          })}
        </p>
      </main>

      {/* Footer */}
      <footer className="py-10" style={{ background: '#111111' }}>
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-2 px-6 md:px-12">
          <span className="text-[16px] font-bold text-white">
            {tenant.name}
          </span>
          <span
            className="text-[12px] font-medium"
            style={{ color: '#9CA3AF' }}
          >
            {t('pub.footer', { currency })}
          </span>
        </div>
      </footer>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   5) PHOTO LOOKBOOK — dark, product photos, catalog boards (waReV)
   ══════════════════════════════════════════════════════════════════════ */
