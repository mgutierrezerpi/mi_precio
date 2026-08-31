import { SIco, CartControl, code, type DesignProps, type StoreColors } from './designsShared'
import { lighten } from '../../lib/designColors'
function Meta({ C, label, value }: { C: StoreColors; label: string; value: string }) { return <div className="flex flex-col gap-1"><span className="text-[10px] font-semibold tracking-[1.5px]" style={{ color: C.muted }}>{label}</span><span className="text-[13px] font-medium" style={{ color: C.ink }}>{value}</span></div> }
function FilterTab({ C, active, onClick, name, count, accent }: { C: StoreColors; active: boolean; onClick: () => void; name: string; count: number; accent: string }) { return <button type="button" onClick={onClick} className="flex items-center gap-1.5 py-0.5">{active && <span className="h-[5px] w-[5px] rounded-full" style={{ background: accent }} />}<span className="text-[12px]" style={{ color: active ? accent : C.body, fontWeight: active ? 700 : 500 }}>{name}</span><span className="text-[10px]" style={{ color: C.muted }}>({count})</span></button> }
export function ClassicList(p: DesignProps) {
  const {
    tenant,
    C,
    accent,
    brandGradient,
    t,
    money,
    currency,
    updated,
    monthYear,
    sections,
    base,
    cat,
    setCat,
    q,
    setQ,
    isService,
    listName,
    edition,
    taxId,
    cart,
    addToCart,
    decFromCart,
  } = p
  const visibleSections =
    cat === 'all' ? sections : sections.filter((s) => s.key === cat)

  return (
    <>
      <div className="h-1.5 w-full" style={{ background: brandGradient }} />
      <div
        style={{
          background: `linear-gradient(180deg, ${accent}12 0%, ${accent}00 560px)`,
        }}
      >
        <div className="mx-auto w-full max-w-[1160px] px-6 md:px-12">
          <header className="pb-8 pt-10">
            <div className="mb-5 flex items-center gap-3">
              {tenant.logoUrl ? (
                <img
                  src={tenant.logoUrl}
                  alt={tenant.name}
                  className="h-14 w-auto max-w-[180px] object-contain"
                />
              ) : (
                <>
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-[20px] font-black text-white shadow-sm"
                    style={{ background: brandGradient }}
                  >
                    {(tenant.name || '·').charAt(0).toUpperCase()}
                  </span>
                  <span
                    className="text-[18px] font-extrabold tracking-tight"
                    style={{ color: C.ink }}
                  >
                    {tenant.name}
                  </span>
                </>
              )}
            </div>
            <div
              className="h-1 w-14 rounded-full"
              style={{ background: brandGradient }}
            />
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
              <span
                className="flex items-center gap-2 rounded-full border bg-white px-2.5 py-1.5"
                style={{ borderColor: C.line }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: C.accent }}
                />
                <span
                  className="text-[11px] font-semibold tracking-[2px]"
                  style={{ color: C.muted }}
                >
                  {t('pub.edition', { n: edition })}
                </span>
              </span>
              <div className="flex-1" />
              <div className="flex flex-wrap items-center gap-4">
                <span
                  className="rounded-full border px-3 py-1 text-[11px] font-bold tracking-[2px]"
                  style={{ borderColor: C.accent, color: C.accent }}
                >
                  {t('pub.public')}
                </span>
                <span
                  className="text-[12px] font-medium"
                  style={{ color: C.muted }}
                >
                  {t('pub.updated', { date: updated })}
                </span>
              </div>
            </div>

            <div className="my-5 h-px w-full" style={{ background: C.line }} />

            <div className="flex items-end gap-5">
              <span
                className="hidden h-[72px] w-1.5 sm:block"
                style={{ background: C.accent }}
              />
              <h1 className="flex flex-wrap items-end gap-x-4 text-5xl font-black leading-[0.95] tracking-tight md:text-8xl">
                <span style={{ color: C.ink }}>{t('pub.titleA')}</span>
                <span
                  style={{
                    background: brandGradient,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {t('pub.titleB')}
                </span>
              </h1>
              <div className="flex-1" />
              <span
                className="hidden rounded-lg px-3 py-2 text-[12px] font-bold sm:block"
                style={{
                  background: `${accent}12`,
                  border: `1px solid ${accent}33`,
                  color: C.accent,
                }}
              >
                {currency} · {monthYear}
              </span>
            </div>

            <p
              className="mt-6 max-w-[720px] text-[16px] leading-relaxed"
              style={{ color: C.body }}
            >
              {tenant.description ||
                t('pub.intro', {
                  listPrefix: listName ? `${listName}. ` : '',
                  name: tenant.name,
                })}
            </p>

            <div className="my-5 h-px w-full" style={{ background: C.line }} />

            <div className="flex flex-wrap gap-x-12 gap-y-4 pt-1">
              <Meta C={C} label={t('pub.issuedBy')} value={tenant.name} />
              {taxId && <Meta C={C} label={t('pub.taxId')} value={taxId} />}
              <Meta
                C={C}
                label={t('pub.catalog')}
                value={listName ?? t('pub.allLists')}
              />
              <Meta C={C} label={t('pub.updatedLabel')} value={updated} />
              <Meta C={C} label={t('pub.currency')} value={currency} />
            </div>
          </header>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-3 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <FilterTab
                C={C}
                active={cat === 'all'}
                onClick={() => setCat('all')}
                name={t('pub.all')}
                count={base.length}
                accent={C.accent}
              />
              {sections.map((s) => (
                <span key={s.key} className="flex items-center gap-3">
                  <span className="h-3 w-px" style={{ background: C.line }} />
                  <FilterTab
                    C={C}
                    active={cat === s.key}
                    onClick={() => setCat(s.key)}
                    name={s.name}
                    count={s.items.length}
                    accent={C.accent}
                  />
                </span>
              ))}
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <label
                className="flex h-10 items-center gap-2.5 rounded-xl px-3.5"
                style={{
                  background: `${accent}12`,
                  border: `1px solid ${accent}26`,
                }}
              >
                <SIco name="search" size={16} color={C.muted} />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t('pub.search')}
                  className="w-72 max-w-[60vw] border-0 bg-transparent text-[13px] outline-none placeholder:text-[#84818E] focus:ring-0"
                  style={{ color: C.ink }}
                />
              </label>
            </div>
          </div>

          <main className="flex flex-col gap-7 pb-24 pt-4">
            {visibleSections.length === 0 ? (
              <p
                className="py-16 text-center text-sm font-medium"
                style={{ color: C.muted }}
              >
                {t('pub.empty')}
              </p>
            ) : (
              visibleSections.map((s, si) => (
                <section
                  key={s.key}
                  className="rounded-[24px] border bg-white p-6 shadow-[0_12px_32px_-10px_rgba(30,27,75,0.14)] md:p-7"
                  style={{ borderColor: lighten(accent, 0.84) }}
                >
                  <div
                    className="flex items-end justify-between border-b-2 pb-3"
                    style={{ borderColor: C.accent }}
                  >
                    <div className="flex items-end gap-4">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-xl text-[17px] font-bold leading-none text-white"
                        style={{ background: brandGradient }}
                      >
                        {String(si + 1).padStart(2, '0')}
                      </span>
                      <div className="flex flex-col gap-1.5">
                        <span
                          className="text-[28px] font-extrabold leading-none md:text-[36px]"
                          style={{ color: C.ink }}
                        >
                          {s.name}
                        </span>
                        <span
                          className="text-[11px]"
                          style={{ color: C.muted }}
                        >
                          {s.items.length}{' '}
                          {s.items.length === 1
                            ? t('pub.product')
                            : t('pub.products')}
                        </span>
                      </div>
                    </div>
                    <div className="hidden items-end gap-6 sm:flex">
                      <div className="flex flex-col items-end gap-0.5">
                        <span
                          className="text-[10px] font-semibold tracking-[1.5px]"
                          style={{ color: C.muted }}
                        >
                          {t('pub.from')}
                        </span>
                        <span
                          className="text-[13px] font-semibold"
                          style={{ color: C.ink }}
                        >
                          {money(s.min)}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span
                          className="text-[10px] font-semibold tracking-[1.5px]"
                          style={{ color: C.muted }}
                        >
                          {t('pub.to')}
                        </span>
                        <span
                          className="text-[13px] font-semibold"
                          style={{ color: C.ink }}
                        >
                          {money(s.max)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {s.items.map((it, i) => (
                      <div
                        key={it.id}
                        className="flex flex-wrap items-start gap-x-3 gap-y-2 border-b py-4 lg:flex-nowrap lg:items-center lg:gap-5"
                        style={{ borderColor: C.line }}
                      >
                        <span
                          className="hidden w-[96px] shrink-0 text-[13px] font-medium lg:block"
                          style={{ color: C.muted }}
                        >
                          {code(it, i)}
                        </span>
                        <div className="min-w-0 flex-1 basis-full lg:basis-0">
                          <p
                            className="break-words text-[16px] font-medium"
                            style={{ color: C.ink }}
                          >
                            {it.name}
                          </p>
                          {it.description && (
                            <p
                              className="mt-0.5 text-[12px]"
                              style={{ color: C.muted }}
                            >
                              {it.description}
                            </p>
                          )}
                        </div>
                        <span
                          className="mx-2 hidden flex-1 translate-y-[-3px] border-b border-dotted lg:block"
                          style={{ borderColor: '#CBC8C0' }}
                        />
                        <div className="ml-auto flex shrink-0 items-center gap-3">
                          <div className="flex flex-col items-end">
                            <span
                              className="text-[18px] font-bold md:text-[20px]"
                              style={{ color: C.ink }}
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
                              ink={C.ink}
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

          <footer
            className="flex flex-col items-center gap-3 border-t py-10 text-center"
            style={{ borderColor: C.line }}
          >
            <div
              className="h-1 w-16 rounded-full"
              style={{ background: brandGradient }}
            />
            <span
              className="text-base font-black uppercase tracking-[0.2em]"
              style={{
                background: brandGradient,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {tenant.name}
            </span>
            <p className="text-xs font-medium" style={{ color: C.muted }}>
              {t('pub.footer', { currency })}
            </p>
          </footer>
        </div>
      </div>
    </>
  )
}
