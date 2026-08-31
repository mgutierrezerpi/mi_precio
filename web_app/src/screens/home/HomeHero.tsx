import { landingText } from './homeContent'
import { MiniListPreview } from './homeShared'
import { QrCode } from './homeIcons'
import type { OpenAuth } from './homeTypes'

export function HomeHero({ onAuth }: { onAuth: OpenAuth }) {
  return (
    <section
      id="producto"
      className="scroll-mt-24 bg-[linear-gradient(135deg,#2E1065_0%,#5B21B6_45%,#7C3AED_85%,#A855F7_100%)] px-5 py-20 md:px-8 md:py-28"
    >
      <div className="mx-auto grid max-w-[1200px] items-center gap-16 lg:grid-cols-[560px_1fr]">
        <div className="flex flex-col gap-6">
          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-white md:text-[58px]">
            {landingText(
              'Tu catálogo online, listo para compartir.',
              'Your online catalog, ready to share.'
            )}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-[#DDD6FE]">
            {landingText(
              'Cargá tus productos, controlá tu stock y compartí tu lista de precios con un link o un código QR. Sin planillas, sin PDFs desactualizados, sin complicarte.',
              'Add products, manage stock, and share your price list with a link or QR code. No spreadsheets, outdated PDFs, or extra work.'
            )}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onAuth}
              className="landing-primary-action rounded-xl bg-white px-[22px] py-3.5 text-[15px] font-semibold text-slate-950 shadow-[0_10px_24px_-6px_rgba(124,58,237,0.4)] hover:bg-violet-50"
            >
              {landingText('Probá 14 días gratis', 'Start 14-day free trial')}
            </button>
          </div>
        </div>
        <HeroMockup />
      </div>
    </section>
  )
}

export function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[580px]">
      <MiniListPreview
        variant="wild-stem-verano"
        className="shadow-[0_28px_65px_-30px_rgba(0,0,0,0.8)]"
      />
      <div className="absolute -left-4 -top-4 flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0F172A] shadow-[0_8px_24px_-4px_rgba(15,23,42,0.15)]">
        <QrCode size={16} className="text-[#0F172A]" /> miprecio.app/p/acme
      </div>
    </div>
  )
}
