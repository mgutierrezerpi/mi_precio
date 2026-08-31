import { rootBg, SIco, CartControl, type DesignProps } from './designsShared'
import { lighten, readableOn } from '../../lib/designColors'
import { categoryIcon } from '../../lib/categoryIcon'
export function ImageCatalog(p: DesignProps) {
  const {
    tenant,
    t,
    money,
    currency,
    updated,
    sections,
    allItems,
    base,
    isService,
    cart,
    addToCart,
    decFromCart,
  } = p
  const accent = p.accent,
    hero = p.heroColor,
    heroDark = lighten(p.heroColor, -0.16),
    heroInk = readableOn(p.heroColor),
    ink = '#0F172A',
    soft = '#64748B',
    line = '#E2E8F0'
  const stat = (v: string, l: string) => (
    <div className="flex flex-col gap-0.5">
      <span
        className="text-[18px] font-extrabold md:text-[22px]"
        style={{ color: heroInk }}
      >
        {v}
      </span>
      <span
        className="text-[10px] font-semibold uppercase tracking-[1.5px]"
        style={{ color: heroInk, opacity: 0.6 }}
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
      {/* Hero header (uses the configurable hero color) */}
      <header style={{ background: hero }}>
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 px-5 py-9 md:px-12">
          <div className="flex items-center gap-3">
            {tenant.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt={tenant.name}
                className="h-10 w-auto max-w-[150px] object-contain"
              />
            ) : (
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[15px] font-black"
                style={{ background: accent, color: readableOn(accent) }}
              >
                {(tenant.name || '·').charAt(0).toUpperCase()}
              </span>
            )}
            <span className="text-[14px] font-bold" style={{ color: heroInk }}>
              {tenant.name}
            </span>
            <span
              className="ml-auto text-[11px] font-medium"
              style={{ color: heroInk, opacity: 0.55 }}
            >
              {t('pub.updated', { date: updated })}
            </span>
          </div>
          <h1
            className="max-w-[720px] text-3xl font-black leading-tight md:text-5xl"
            style={{ color: heroInk }}
          >
            {tenant.description || t('store.heroTitle', { name: tenant.name })}
          </h1>
          {tenant.description && (
            <p
              className="max-w-[560px] text-[13px] font-medium"
              style={{ color: heroInk, opacity: 0.72 }}
            >
              {t('store.heroSub')}
            </p>
          )}
        </div>
      </header>

      {/* Spec strip */}
      <div style={{ background: heroDark }}>
        <div className="mx-auto grid w-full max-w-[1180px] grid-cols-2 gap-4 px-5 py-5 sm:grid-cols-4 md:px-12">
          {stat(String(allItems.length), t('store.statProducts'))}
          {stat(String(sections.length), t('store.categories'))}
          {stat(updated, t('store.statUpdated'))}
          {stat(currency, t('pub.currency'))}
        </div>
      </div>

      {/* White image grid */}
      <main className="mx-auto flex w-full max-w-[1180px] flex-col gap-9 px-5 py-10 md:px-12">
        <div className="flex items-baseline justify-between gap-3">
          <h2
            className="text-[22px] font-extrabold md:text-[26px]"
            style={{ color: ink }}
          >
            {t('store.allProducts')}
          </h2>
          <span className="text-[12px] font-semibold" style={{ color: soft }}>
            {t('store.showing', {
              n: String(base.length),
              total: String(allItems.length),
            })}
          </span>
        </div>
        {sections.length === 0 ? (
          <p
            className="py-16 text-center text-sm font-medium"
            style={{ color: soft }}
          >
            {t('pub.empty')}
          </p>
        ) : (
          sections.map((s) => (
            <section key={s.key} className="flex flex-col gap-4">
              <div
                className="flex items-baseline gap-3 border-b pb-2"
                style={{ borderColor: line }}
              >
                <span
                  className="text-[11px] font-bold uppercase tracking-[2px]"
                  style={{ color: accent }}
                >
                  {s.name}
                </span>
                <span className="h-px flex-1" />
                <span
                  className="text-[12px] font-semibold"
                  style={{ color: soft }}
                >
                  {s.items.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {s.items.map((it) => (
                  <div
                    key={it.id}
                    className="flex flex-col overflow-hidden rounded-2xl border shadow-[0_4px_16px_rgba(15,23,42,0.06)]"
                    style={{ background: '#FFFFFF', borderColor: line }}
                  >
                    <div
                      className="relative flex h-40 items-center justify-center"
                      style={{ background: '#F1F5F9' }}
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
                          size={44}
                          color={accent}
                          style={{ opacity: 0.4 }}
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-4">
                      <p
                        className="text-[14px] font-bold leading-tight"
                        style={{ color: ink }}
                      >
                        {it.name}
                      </p>
                      {it.description && (
                        <p
                          className="line-clamp-1 text-[12px] font-medium"
                          style={{ color: soft }}
                        >
                          {it.description}
                        </p>
                      )}
                      <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                        <span
                          className="text-[18px] font-black"
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
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Hero-colored footer */}
      <footer style={{ background: hero }}>
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-1 px-5 py-8 md:px-12">
          <span className="text-[15px] font-bold" style={{ color: heroInk }}>
            {tenant.name}
          </span>
          {tenant.address && (
            <span
              className="text-[12px] font-medium"
              style={{ color: heroInk, opacity: 0.72 }}
            >
              {tenant.address}
            </span>
          )}
          <span
            className="text-[12px] font-medium"
            style={{ color: heroInk, opacity: 0.55 }}
          >
            {t('pub.footer', { currency })}
          </span>
        </div>
      </footer>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   8) TECH — dark modern SaaS grid, accent glow, monospaced prices
   ══════════════════════════════════════════════════════════════════════ */
