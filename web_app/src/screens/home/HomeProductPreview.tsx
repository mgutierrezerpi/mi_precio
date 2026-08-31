import { landingText } from './homeContent'
import { CircleCheck } from './homeIcons'
import { Reveal } from './homeShared'

export function HomeProductPreview() {
  const checks = [
    landingText(
      'Sin necesidad de descargar apps.',
      'No app downloads required.'
    ),
    landingText(
      'Compatible con móvil y escritorio.',
      'Works on mobile and desktop.'
    ),
    landingText(
      'Personalizá colores y logo de tu marca.',
      'Customize your brand colors and logo.'
    ),
  ]
  return (
    <section className="bg-[linear-gradient(135deg,#FAF5FF_0%,#EDE9FE_100%)] px-5 py-24 md:px-8">
      <Reveal className="mx-auto grid max-w-[1200px] items-center gap-20 lg:grid-cols-[0.8fr_1fr]">
        <PhoneMockup />
        <div className="flex flex-col gap-5">
          <span className="w-fit rounded-full bg-[#EDE9FE] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#7C3AED]">
            {landingText('Para tus clientes', 'For your customers')}
          </span>
          <h2 className="text-3xl font-extrabold leading-tight text-[#0F172A] md:text-4xl">
            {landingText(
              'Tus clientes ven una lista profesional, siempre actualizada.',
              'Your customers see a professional list that is always current.'
            )}
          </h2>
          <p className="text-base leading-relaxed text-[#475569]">
            {landingText(
              'Compartí tu catálogo con un link o un QR y olvidate de mandar PDFs desactualizados por WhatsApp. Tus precios y tu stock siempre al día, vean de donde te vean.',
              'Share your catalog with a link or QR code and stop sending outdated PDFs over WhatsApp. Your prices and stock stay current everywhere.'
            )}
          </p>
          <div className="mt-2 flex flex-col gap-3">
            {checks.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2.5 text-[15px] font-medium text-[#0F172A]"
              >
                <CircleCheck size={20} className="text-[#10B981]" /> {item}
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[min(100%,340px)]">
      <div className="absolute -inset-5 -z-10 rounded-full bg-[#6C43E8]/20 blur-3xl" />
      <div className="overflow-hidden rounded-[38px] border-[7px] border-[#100922] bg-[#100922] p-1.5 shadow-[0_32px_70px_-24px_rgba(0,0,0,0.8)] ring-1 ring-[#6C43E8]/60">
        <div className="relative h-[560px] overflow-hidden rounded-[28px] bg-[#f8f7ff]">
          <iframe
            title={landingText(
              'Vista móvil de una lista de precios',
              'Mobile price-list preview'
            )}
            src="/template-preview/obsidian"
            className="pointer-events-none h-full w-full border-0"
          />
          <div className="pointer-events-none absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-[#100922]" />
        </div>
      </div>
    </div>
  )
}
