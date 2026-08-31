import { landingText } from './homeContent'
import { ArrowRight } from './homeIcons'
import { Reveal } from './homeShared'
import type { OpenAuth } from './homeTypes'

export function HomeFinalCta({ onAuth }: { onAuth: OpenAuth }) {
  return (
    <section className="bg-[#EDE9FE] px-5 py-20 md:px-8">
      <Reveal className="landing-final-cta mx-auto flex max-w-[1100px] flex-col items-center gap-5 rounded-[32px] bg-gradient-to-br from-[#7C3AED] to-[#A855F7] px-8 py-16 text-center shadow-[0_32px_80px_-20px_rgba(124,58,237,0.5)] md:px-20">
        <h2 className="text-4xl font-black leading-tight tracking-tight text-white md:text-[46px]">
          {landingText(
            'Tu lista de precios, lista en 5 minutos.',
            'Your price list, ready in 5 minutes.'
          )}
        </h2>
        <p className="max-w-2xl text-[17px] font-medium text-[#E0E7FF]">
          {landingText(
            'Probá MiPrecio 14 días gratis y empezá a compartir tu catálogo con un link o un QR.',
            'Try PricePanel free for 14 days and start sharing your catalog with a link or QR code.'
          )}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-3.5">
          <button
            type="button"
            onClick={onAuth}
            className="landing-final-primary flex h-[52px] items-center gap-2 rounded-[14px] bg-white px-7 text-[15px] font-bold text-[#7C3AED] hover:bg-violet-50"
          >
            {landingText('Probar 14 días gratis', 'Start 14-day free trial')}{' '}
            <ArrowRight size={18} />
          </button>
          <a
            href="mailto:hola@miprecio.app"
            className="landing-final-secondary flex h-[52px] items-center rounded-[14px] border border-white/40 px-7 text-[15px] font-bold text-white hover:bg-white/10"
          >
            {landingText('Hablar con ventas', 'Talk to sales')}
          </a>
        </div>
      </Reveal>
    </section>
  )
}

// Footer brand/nav/socials are intentionally omitted for now — those pages don't
// exist yet. The full markup lives in the static landing (landing/index.html) and
// git history; restore from there when the links are ready.
export function HomeFooter() {
  return (
    <footer className="bg-[#2E1065] px-5 py-8 text-white md:px-[120px]">
      <div className="mx-auto max-w-[1200px]">
        <p className="text-center text-xs font-medium text-[#64748B]">
          {landingText(
            '© 2026 MiPrecio. Todos los derechos reservados.',
            '© 2026 PricePanel. All rights reserved.'
          )}
        </p>
      </div>
    </footer>
  )
}
