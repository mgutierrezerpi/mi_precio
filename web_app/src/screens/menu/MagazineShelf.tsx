import { Link } from 'react-router-dom'
import { getT } from '../../lib/i18n'
import type { Magazine, Tenant } from '../../types'

const MAGAZINE_CARD_CLASS = [
  'group relative min-h-[116px] overflow-hidden rounded-[18px] bg-[#3A2A1D] p-4 text-[#F3EDE2]',
  'transition-transform hover:-translate-y-0.5',
].join(' ')

export function MagazineShelf({
  tenant,
  magazines,
  accent,
  t,
}: {
  tenant: Tenant
  magazines: Magazine[]
  accent: string
  t: ReturnType<typeof getT>
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-3 pt-4 sm:px-6 sm:pt-6">
      <div className="rounded-[24px] border border-[#DCCDBB] bg-[#F7F2EA] p-4 shadow-[0_18px_40px_-28px_rgba(58,42,29,.55)] sm:p-5">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#A76D3E]">
              {t('magazines.eyebrow')}
            </p>
            <h2
              className="mt-1 text-[25px] leading-none text-[#3A2A1D]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {t('nav.magazines')}
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-[#806C58]">
            {magazines.length}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {magazines.map((magazine) => (
            <Link
              key={magazine.id}
              to={`/m/${tenant.subdomain}/${magazine.slug || magazine.id}`}
              className={MAGAZINE_CARD_CLASS}
            >
              {magazine.coverImageUrl && (
                <img
                  src={magazine.coverImageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-45"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#241B15] via-[#3A2A1D]/50 to-transparent" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#D6B58B]">
                    {magazine.issue || t('magazines.pages')}
                  </span>
                  <span className="text-lg transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </div>
                <div>
                  <h3
                    className="text-[21px] leading-none"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {magazine.name}
                  </h3>
                  <p className="mt-2 text-[11px] font-medium text-[#F3EDE2]/70">
                    {magazine.pages?.length ?? 0} {t('magazines.pages')}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div
        className="mx-6 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-10"
        style={{ color: accent }}
      />
    </section>
  )
}
