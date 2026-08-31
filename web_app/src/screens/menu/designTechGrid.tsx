import { rootBg, CartControl, type DesignProps } from './designsShared'
import { readableOn } from '../../lib/designColors'
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"

export function TechGrid(p: DesignProps) {
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
    hero = p.heroColor
  const bg = '#0A0E16',
    panel = 'rgba(255,255,255,0.035)',
    panelSolid = '#121826',
    border = 'rgba(255,255,255,0.08)',
    ink = '#E8EDF5',
    soft = '#8A94A6'
  const grid: React.CSSProperties = {
    backgroundImage:
      'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
    backgroundSize: '34px 34px',
  }

  return (
    <div
      style={{
        background: rootBg(bg, p.hasBg, 0.55),
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 py-10 md:px-10 md:py-14">
        {/* Hero panel */}
        <header
          className="relative overflow-hidden rounded-3xl border p-7 md:p-11"
          style={{ borderColor: border, background: panelSolid }}
        >
          <div className="pointer-events-none absolute inset-0" style={grid} />
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
            style={{ background: hero, filter: 'blur(90px)', opacity: 0.35 }}
          />
          <div className="relative flex flex-col gap-5">
            <div className="flex items-center gap-3">
              {tenant.logoUrl ? (
                <img
                  src={tenant.logoUrl}
                  alt={tenant.name}
                  className="h-10 w-auto max-w-[150px] object-contain"
                />
              ) : (
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-[15px] font-black"
                  style={{ background: accent, color: readableOn(accent) }}
                >
                  {(tenant.name || '·').charAt(0).toUpperCase()}
                </span>
              )}
              <span
                className="flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold"
                style={{ borderColor: border, color: soft, fontFamily: MONO }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
                />{' '}
                {tenant.name}
              </span>
              <span
                className="ml-auto text-[11px]"
                style={{ color: soft, fontFamily: MONO }}
              >
                {updated}
              </span>
            </div>
            <h1
              className="max-w-[760px] text-4xl font-black leading-[1.05] tracking-tight md:text-6xl"
              style={{ color: ink }}
            >
              {tenant.description ||
                t('store.heroTitle', { name: tenant.name })}
            </h1>
            <div className="flex flex-wrap gap-2.5">
              {[
                [String(allItems.length), t('store.statProducts')],
                [String(sections.length), t('store.categories')],
                [currency, t('pub.currency')],
                [updated, t('store.statUpdated')],
              ].map(([v, l]) => (
                <div
                  key={l}
                  className="flex items-center gap-2 rounded-xl border px-3 py-2"
                  style={{ borderColor: border, background: panel }}
                >
                  <span
                    className="text-[14px] font-bold"
                    style={{ color: ink, fontFamily: MONO }}
                  >
                    {v}
                  </span>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[1.5px]"
                    style={{ color: soft }}
                  >
                    {l}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* Data panels */}
        <main className="mt-6 flex flex-col gap-5">
          {sections.length === 0 ? (
            <p
              className="py-16 text-center text-sm font-medium"
              style={{ color: soft }}
            >
              {t('pub.empty')}
            </p>
          ) : (
            sections.map((s, si) => (
              <section
                key={s.key}
                className="overflow-hidden rounded-2xl border"
                style={{ borderColor: border, background: panelSolid }}
              >
                <div
                  className="flex items-center gap-3 border-b px-5 py-3.5"
                  style={{ borderColor: border }}
                >
                  <span
                    className="text-[12px] font-bold"
                    style={{ color: accent, fontFamily: MONO }}
                  >
                    {String(si + 1).padStart(2, '0')}
                  </span>
                  <h2
                    className="text-[16px] font-extrabold"
                    style={{ color: ink }}
                  >
                    {s.name}
                  </h2>
                  <span
                    className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      borderColor: border,
                      color: soft,
                      fontFamily: MONO,
                    }}
                  >
                    {s.items.length}
                  </span>
                </div>
                <div>
                  {s.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center gap-4 border-b px-5 py-3.5 transition-colors last:border-b-0 hover:bg-white/[0.02]"
                      style={{ borderColor: border }}
                    >
                      <span
                        className="hidden h-1.5 w-1.5 shrink-0 rounded-full sm:block"
                        style={{ background: accent }}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-[14px] font-semibold"
                          style={{ color: ink }}
                        >
                          {it.name}
                        </p>
                        {it.description && (
                          <p
                            className="mt-0.5 line-clamp-1 text-[12px]"
                            style={{ color: soft }}
                          >
                            {it.description}
                          </p>
                        )}
                      </div>
                      <span
                        className="shrink-0 text-[15px] font-bold tabular-nums"
                        style={{ color: accent, fontFamily: MONO }}
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
                </div>
              </section>
            ))
          )}
        </main>

        <footer
          className="mt-8 flex items-center justify-between gap-3 border-t pt-6"
          style={{ borderColor: border }}
        >
          <span className="text-[13px] font-bold" style={{ color: ink }}>
            {tenant.name}
          </span>
          <span
            className="text-[11px]"
            style={{ color: soft, fontFamily: MONO }}
          >
            {t('pub.footer', { currency })}
          </span>
        </footer>
      </div>
    </div>
  )
}
