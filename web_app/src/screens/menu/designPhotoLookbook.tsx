import { rootBg, SIco, CartControl, type DesignProps } from './designsShared'
import { categoryIcon } from '../../lib/categoryIcon'
import type { Item } from '../../types'
export function PhotoLookbook(p: DesignProps) {
  const {
    tenant,
    t,
    money,
    currency,
    updated,
    sections,
    allItems,
    isService,
    cart,
    addToCart,
    decFromCart,
  } = p
  const bg = '#0A0A0A',
    panel = '#161616',
    ink = '#F5F5F5',
    soft = '#9A9A9A',
    accent = p.accent
  const featured = [...allItems]
    .sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0))
    .slice(0, 3)

  const Thumb = ({ it, className }: { it: Item; className?: string }) => (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className ?? ''}`}
      style={{ background: panel }}
    >
      {it.imageUrl ? (
        <img
          src={it.imageThumbUrl || it.imageUrl}
          alt={it.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <SIco
          name={categoryIcon(it.category)}
          size={40}
          color={accent}
          style={{ opacity: 0.5 }}
        />
      )}
    </div>
  )

  return (
    <div
      style={{
        background: rootBg(bg, p.hasBg, 0.5),
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div className="mx-auto w-full max-w-[1120px] px-6 py-12 md:px-12">
        {/* Hero */}
        <header className="flex flex-col gap-4 pb-10">
          <div className="flex items-center gap-3">
            {tenant.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt={tenant.name}
                className="h-11 w-auto max-w-[150px] object-contain"
              />
            ) : (
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl text-[16px] font-black text-white"
                style={{ background: accent }}
              >
                {(tenant.name || '·').charAt(0).toUpperCase()}
              </span>
            )}
            <span className="text-[14px] font-bold" style={{ color: ink }}>
              {tenant.name}
            </span>
            <span
              className="ml-auto text-[11px] font-medium"
              style={{ color: soft }}
            >
              {t('pub.updated', { date: updated })}
            </span>
          </div>
          <h1
            className="max-w-[720px] text-4xl font-black leading-[1.05] tracking-tight md:text-6xl"
            style={{ color: ink }}
          >
            {tenant.description || t('store.heroTitle', { name: tenant.name })}
          </h1>
        </header>

        {/* Featured cards */}
        {featured.length > 0 && (
          <div className="grid grid-cols-1 gap-4 pb-12 sm:grid-cols-3">
            {featured.map((it) => (
              <div
                key={it.id}
                className="flex flex-col overflow-hidden rounded-2xl"
                style={{ background: panel }}
              >
                <Thumb it={it} className="h-44 w-full" />
                <div className="flex items-center justify-between gap-2 p-4">
                  <div className="min-w-0">
                    <p
                      className="truncate text-[14px] font-bold"
                      style={{ color: ink }}
                    >
                      {it.name}
                    </p>
                    <span
                      className="text-[18px] font-black"
                      style={{ color: accent }}
                    >
                      {money(it.price)}
                    </span>
                  </div>
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
          </div>
        )}

        {/* Category boards */}
        <main className="flex flex-col gap-10">
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
                  className="flex items-baseline justify-between border-b pb-2"
                  style={{ borderColor: '#262626' }}
                >
                  <h2
                    className="text-[20px] font-extrabold md:text-[24px]"
                    style={{ color: ink }}
                  >
                    {s.name}
                  </h2>
                  <span
                    className="text-[12px] font-semibold"
                    style={{ color: soft }}
                  >
                    {s.items.length}
                  </span>
                </div>
                {s.items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center gap-4 border-b py-3"
                    style={{ borderColor: '#1C1C1C' }}
                  >
                    <Thumb it={it} className="h-14 w-14 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-[15px] font-bold"
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
                    <span
                      className="shrink-0 text-[17px] font-black tabular-nums"
                      style={{ color: accent }}
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
                ))}
              </section>
            ))
          )}
        </main>

        <footer
          className="mt-12 flex flex-col gap-2 border-t pt-8"
          style={{ borderColor: '#262626' }}
        >
          <span className="text-[15px] font-bold" style={{ color: ink }}>
            {tenant.name}
          </span>
          <span className="text-[12px] font-medium" style={{ color: soft }}>
            {t('pub.footer', { currency })}
          </span>
        </footer>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   6) CARDS — light service-oriented price cards grid (N7Y8MV Laundromat)
   ══════════════════════════════════════════════════════════════════════ */
