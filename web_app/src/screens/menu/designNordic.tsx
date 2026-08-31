import { rootBg, CartControl, type DesignProps } from './designsShared'

/* ══════════════════════════════════════════════════════════════════════
   2) NORDIC — beige paper menu, serif, dotted leaders (jyR00)
   ══════════════════════════════════════════════════════════════════════ */
const SERIF = "'Playfair Display', 'Georgia', serif"

export function NordicMenu(p: DesignProps) {
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
  const paper = '#F3EBE2',
    ink = '#2B2620',
    soft = '#6B6156',
    line = '#C5BEB6',
    accent = p.accent

  return (
    <div
      style={{
        background: rootBg(paper, p.hasBg),
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div className="mx-auto w-full max-w-[900px] px-6 md:px-12">
        {/* Cover */}
        <header
          className="flex flex-col items-center gap-3 border-b py-14 text-center"
          style={{ borderColor: line }}
        >
          {tenant.logoUrl && (
            <img
              src={tenant.logoUrl}
              alt={tenant.name}
              className="mb-2 h-16 w-auto max-w-[160px] object-contain"
            />
          )}
          <span
            className="text-[11px] font-semibold uppercase tracking-[4px]"
            style={{ color: accent }}
          >
            {t('pub.public')}
          </span>
          <h1
            className="text-5xl md:text-7xl"
            style={{ fontFamily: SERIF, color: ink, fontWeight: 600 }}
          >
            {tenant.name}
          </h1>
          {tenant.description && (
            <p
              className="max-w-[560px] text-[14px] leading-relaxed"
              style={{ color: soft }}
            >
              {tenant.description}
            </p>
          )}
          <span
            className="mt-2 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[2px]"
            style={{ borderColor: line, color: soft }}
          >
            {currency} · {t('pub.updated', { date: updated })}
          </span>
        </header>

        {/* Sections */}
        <main className="flex flex-col gap-12 py-14">
          {sections.length === 0 ? (
            <p className="py-16 text-center text-sm" style={{ color: soft }}>
              {t('pub.empty')}
            </p>
          ) : (
            sections.map((s) => (
              <section key={s.key} className="flex flex-col gap-1">
                <div className="mb-3 flex flex-col items-center gap-2 text-center">
                  <h2
                    className="text-[26px] md:text-[32px]"
                    style={{ fontFamily: SERIF, color: ink, fontWeight: 600 }}
                  >
                    {s.name}
                  </h2>
                  <span className="h-px w-16" style={{ background: accent }} />
                </div>
                {s.items.map((it) => (
                  <div
                    key={it.id}
                    className="flex flex-wrap items-start gap-x-3 gap-y-2 py-2.5 lg:flex-nowrap lg:items-baseline"
                  >
                    <div className="min-w-0 flex-1 basis-full lg:basis-0">
                      <p
                        className="break-words text-[16px] font-semibold"
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
                      style={{ borderColor: '#B9B0A4' }}
                    />
                    <div className="ml-auto flex shrink-0 items-center gap-3">
                      <span
                        className="text-[16px] font-semibold tabular-nums"
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
        </main>

        <footer
          className="flex flex-col items-center gap-2 border-t py-10 text-center"
          style={{ borderColor: line }}
        >
          <span
            className="text-[15px] uppercase tracking-[3px]"
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
  )
}

/* ══════════════════════════════════════════════════════════════════════
   3) FINE DINING — dark stage, cream sheet, gold accents, serif (IPt2q)
   ══════════════════════════════════════════════════════════════════════ */
