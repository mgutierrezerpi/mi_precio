import { rootBg, SIco, CartControl, type DesignProps } from './designsShared'
import { readableOn } from '../../lib/designColors'
import { categoryIcon } from '../../lib/categoryIcon'
export function ServiceCards(p: DesignProps) {
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
  const accent = p.accent,
    hero = p.heroColor,
    heroInk = readableOn(p.heroColor),
    ink = '#0F172A',
    soft = '#64748B',
    line = '#E2E8F0',
    card = '#FFFFFF',
    bg = '#F4F7FB'

  return (
    <div
      style={{
        background: rootBg(bg, p.hasBg),
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div className="mx-auto w-full max-w-[1120px] px-5 py-10 md:px-10">
        {/* Header */}
        <header className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
          <div
            className="flex flex-1 flex-col justify-center gap-3 rounded-3xl border bg-white p-6 md:p-8"
            style={{ borderColor: line }}
          >
            <div className="flex items-center gap-3">
              {tenant.logoUrl ? (
                <img
                  src={tenant.logoUrl}
                  alt={tenant.name}
                  className="h-11 w-auto max-w-[150px] object-contain"
                />
              ) : (
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-[16px] font-black text-white"
                  style={{ background: accent }}
                >
                  {(tenant.name || '·').charAt(0).toUpperCase()}
                </span>
              )}
              <span
                className="text-[13px] font-bold uppercase tracking-[2px]"
                style={{ color: accent }}
              >
                {t('store.badge')}
              </span>
            </div>
            <h1
              className="text-3xl font-black leading-tight md:text-5xl"
              style={{ color: ink }}
            >
              {tenant.name}
            </h1>
            {tenant.description && (
              <p
                className="max-w-[520px] text-[14px] font-medium"
                style={{ color: soft }}
              >
                {tenant.description}
              </p>
            )}
          </div>
          <div
            className="flex w-full flex-col justify-center gap-2 rounded-3xl p-6 md:p-8 lg:w-[320px]"
            style={{ background: hero, color: heroInk }}
          >
            <span
              className="text-[11px] font-bold uppercase tracking-[2px]"
              style={{ color: heroInk, opacity: 0.8 }}
            >
              {t('pub.updated', { date: updated })}
            </span>
            <span className="text-[20px] font-extrabold leading-tight">
              {t('store.heroSub')}
            </span>
            <span
              className="mt-1 text-[13px] font-semibold"
              style={{ color: heroInk, opacity: 0.9 }}
            >
              {allItems.length} · {currency}
            </span>
          </div>
        </header>

        {/* Card grid per section */}
        <main className="flex flex-col gap-10 pt-10">
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
                <div className="flex items-baseline gap-3">
                  <h2
                    className="text-[13px] font-bold uppercase tracking-[2px]"
                    style={{ color: accent }}
                  >
                    {s.name}
                  </h2>
                  <span className="h-px flex-1" style={{ background: line }} />
                  <span
                    className="text-[12px] font-semibold"
                    style={{ color: soft }}
                  >
                    {s.items.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {s.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex flex-col gap-2 rounded-2xl border p-4 shadow-[0_4px_16px_rgba(15,23,42,0.04)]"
                      style={{ background: card, borderColor: line }}
                    >
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-xl"
                        style={{ background: `${accent}18` }}
                      >
                        <SIco
                          name={categoryIcon(it.category)}
                          size={18}
                          color={accent}
                        />
                      </span>
                      <p
                        className="text-[14px] font-bold leading-tight"
                        style={{ color: ink }}
                      >
                        {it.name}
                      </p>
                      {it.description && (
                        <p
                          className="line-clamp-2 text-[12px] font-medium"
                          style={{ color: soft }}
                        >
                          {it.description}
                        </p>
                      )}
                      <div className="mt-auto flex items-end justify-between gap-2 pt-1">
                        <span
                          className="text-[19px] font-black"
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
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </main>

        {/* Contact CTA */}
        <div
          className="mt-10 flex flex-col gap-2 rounded-3xl p-6 md:p-8"
          style={{ background: ink }}
        >
          <span className="text-[18px] font-extrabold text-white">
            {tenant.name}
          </span>
          {tenant.address && (
            <span className="text-[13px] font-medium text-white/80">
              {tenant.address}
            </span>
          )}
          {tenant.taxId && (
            <span className="text-[13px] font-medium text-white/60">
              {t('pub.taxId')} {tenant.taxId}
            </span>
          )}
          <span className="mt-1 text-[12px] font-medium text-white/60">
            {t('pub.footer', { currency })}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   7) CATALOG — dark header + spec strip + white image grid (s12NN)
   ══════════════════════════════════════════════════════════════════════ */
