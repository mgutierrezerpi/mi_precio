import { localeForHostname } from '../../lib/domainLocale'
import { PLANS } from '../../lib/plans'
import { landingText, PLAN_CTA } from './homeContent'
import { Check, Sparkles } from './homeIcons'
import { Reveal, SectionHead } from './homeShared'
import type { OpenAuth } from './homeTypes'

export function HomePricing({ onAuth }: { onAuth: OpenAuth }) {
  return (
    <section
      id="precios"
      className="scroll-mt-24 bg-[#EDE9FE] px-5 py-24 md:px-8"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-12">
        <SectionHead
          eyebrow={landingText('Precios', 'Pricing')}
          title={landingText(
            'Planes simples para vender mejor.',
            'Simple plans to help you sell better.'
          )}
          subtitle={landingText(
            'Probá MiPrecio 14 días gratis antes de pagar. Sin tarjeta de crédito.',
            'Try PricePanel free for 14 days before you pay. No credit card required.'
          )}
        />
        <Reveal className="grid items-stretch gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const dark = plan.popular
            const englishPlan =
              localeForHostname() === 'en'
                ? (
                    {
                      micro: {
                        description:
                          'Start with a simple list and share it with a link or QR code.',
                        cadence: 'per month',
                        trialLabel: '14-day free trial',
                        features: [
                          '14 days free',
                          'Up to 25 products',
                          '3 public lists',
                          'Custom QR code',
                        ],
                      },
                      plus: {
                        description:
                          'More products, more lists, and tools to run your business better.',
                        cadence: 'per month',
                        trialLabel: '14-day free trial',
                        features: [
                          '14 days free',
                          'Up to 300 products',
                          '15 public lists',
                          'Team of up to 5 users',
                        ],
                      },
                      pro: {
                        description:
                          'High limits, a complete team, and advanced features.',
                        cadence: 'per month',
                        trialLabel: '14-day free trial',
                        features: [
                          '14 days free',
                          'Unlimited products',
                          'Unlimited public lists',
                          'Unlimited users',
                        ],
                      },
                    } as Partial<
                      Record<
                        typeof plan.id,
                        {
                          description: string
                          cadence: string
                          trialLabel: string
                          features: string[]
                        }
                      >
                    >
                  )[plan.id]
                : undefined
            const planCopy = englishPlan ?? plan
            return (
              <article
                key={plan.name}
                className={`relative flex flex-col gap-[14px] rounded-[24px] px-7 py-8 ${dark ? 'landing-plan-featured text-white' : 'landing-plan-card border border-[#E2E8F0] bg-white shadow-[0_12px_32px_-14px_rgba(15,23,42,0.18)]'}`}
              >
                {dark && (
                  <em className="landing-plan-popular absolute right-6 top-6 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] px-3 py-1.5 text-[0.64rem] font-bold not-italic uppercase tracking-[0.05em] text-white">
                    {landingText('Más popular', 'Most popular')}
                  </em>
                )}
                <h3
                  className={`text-[1.4rem] font-extrabold ${dark ? 'text-white' : 'text-[#0F172A]'}`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-[0.84rem] ${dark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}
                >
                  {planCopy.description}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <strong
                    className={`text-[2.75rem] font-black leading-none ${dark ? 'text-white' : 'text-[#0F172A]'}`}
                  >
                    {plan.price}
                  </strong>
                  <small
                    className={`text-[0.82rem] font-medium ${dark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}
                  >
                    {planCopy.cadence}
                  </small>
                </div>
                <span
                  className={`flex w-fit items-center gap-1.5 rounded-full px-[11px] py-[5px] text-[0.74rem] font-semibold ${dark ? 'bg-white/[0.12] text-[#C4B5FD]' : 'bg-[#EDE9FE] text-[#7C3AED]'}`}
                >
                  <Sparkles size={14} /> {planCopy.trialLabel}
                </span>
                <div
                  className={`h-px ${dark ? 'bg-white/10' : 'bg-[#F1F5F9]'}`}
                />
                <ul className="flex flex-col gap-3">
                  {planCopy.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-center gap-2.5 text-[0.88rem] font-medium ${dark ? 'text-[#E2E8F0]' : 'text-[#334155]'}`}
                    >
                      <Check
                        size={18}
                        className={`flex-none ${dark ? 'text-[#C4B5FD]' : 'text-[#7C3AED]'}`}
                      />{' '}
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={onAuth}
                  className={`mt-auto flex h-12 items-center justify-center rounded-xl text-[0.88rem] font-bold ${dark ? 'bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white hover:brightness-110' : 'border border-[#0F172A] bg-white text-[#0F172A] hover:bg-[#0F172A] hover:text-white'}`}
                >
                  {PLAN_CTA}
                </button>
              </article>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}
