import { rootBg, CartControl, type DesignProps } from './designsShared'
const SERIF = "'Playfair Display', 'Georgia', serif"
export function FineDining(p: DesignProps) {
  const {
    tenant,
    t,
    money,
    currency,
    updated,
    sections,
    isService,
    cart,
    addToCart,
    decFromCart,
  } = p
  const stage = '#10100F',
    paper = '#F7F2E8',
    ink = '#211D16',
    soft = '#6E6656',
    gold = '#B69A62'

  return (
    <div
      style={{
        background: rootBg(stage, p.hasBg, 0.5),
        padding: '40px 0',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div className="mx-auto w-full max-w-[1000px] px-4">
        <div
          className="mx-auto w-full border p-8 md:p-16"
          style={{ background: paper, borderColor: gold }}
        >
          {/* Masthead */}
          <header className="flex flex-col items-center gap-4 text-center">
            {tenant.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt={tenant.name}
                className="h-16 w-auto max-w-[150px] object-contain"
              />
            ) : (
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full border text-[20px] font-bold"
                style={{ borderColor: gold, color: gold, fontFamily: SERIF }}
              >
                {(tenant.name || '·').charAt(0).toUpperCase()}
              </span>
            )}
            <span
              className="text-[11px] font-semibold uppercase tracking-[5px]"
              style={{ color: gold }}
            >
              {t('pub.updated', { date: updated })}
            </span>
            <h1
              className="text-5xl md:text-7xl"
              style={{ fontFamily: SERIF, color: ink, fontWeight: 600 }}
            >
              {tenant.name}
            </h1>
            {tenant.description && (
              <p
                className="max-w-[560px] text-[13px] leading-relaxed"
                style={{ color: soft }}
              >
                {tenant.description}
              </p>
            )}
            <span className="h-px w-24" style={{ background: gold }} />
          </header>

          {/* Sections */}
          <main className="flex flex-col gap-11 pt-12">
            {sections.length === 0 ? (
              <p className="py-16 text-center text-sm" style={{ color: soft }}>
                {t('pub.empty')}
              </p>
            ) : (
              sections.map((s, si) => (
                <section key={s.key} className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[13px] font-semibold tabular-nums"
                      style={{ color: gold }}
                    >
                      {String(si + 1).padStart(2, '0')}
                    </span>
                    <h2
                      className="text-[22px] md:text-[26px]"
                      style={{ fontFamily: SERIF, color: ink, fontWeight: 600 }}
                    >
                      {s.name}
                    </h2>
                    <span
                      className="h-px flex-1"
                      style={{ background: `${gold}66` }}
                    />
                  </div>
                  {s.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex flex-wrap items-start gap-x-3 gap-y-2 py-1.5 lg:flex-nowrap lg:items-baseline"
                    >
                      <div className="min-w-0 flex-1 basis-full lg:basis-0">
                        <p
                          className="break-words text-[15px] font-semibold"
                          style={{ color: ink }}
                        >
                          {it.name}
                        </p>
                        {it.description && (
                          <p
                            className="mt-0.5 text-[12px] italic"
                            style={{ color: soft }}
                          >
                            {it.description}
                          </p>
                        )}
                      </div>
                      <span
                        className="mx-1 hidden min-w-[16px] flex-1 translate-y-[-3px] border-b border-dotted lg:block"
                        style={{ borderColor: '#CDBF9F' }}
                      />
                      <div className="ml-auto flex shrink-0 items-center gap-3">
                        <span
                          className="text-[15px] font-semibold tabular-nums"
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
                            accent={gold}
                            ink={ink}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </section>
              ))
            )}
          </main>

          <footer
            className="mt-14 flex flex-col items-center gap-2 border-t pt-8 text-center"
            style={{ borderColor: `${gold}55` }}
          >
            <span
              className="text-[14px] uppercase tracking-[4px]"
              style={{ fontFamily: SERIF, color: ink }}
            >
              {tenant.name}
            </span>
            <p className="text-[11px]" style={{ color: soft }}>
              {t('pub.footer', { currency })}
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   4) MODERN BRAND — white, bold, accent proof strip, tabular rows (KkLqy)
   ══════════════════════════════════════════════════════════════════════ */
