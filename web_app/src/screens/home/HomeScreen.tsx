import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { selectIsAuthenticated } from '../../store/slices/authSlice'
import { AuthModal } from '../../components/AuthModal'
import { PLANS } from '../../lib/plans'

type OpenAuth = () => void

/* ── Inline icons (lucide-style) ──────────────────────────────── */
type IcoProps = { className?: string; size?: number }
const line = (size: number, className: string | undefined, children: React.ReactNode) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {children}
  </svg>
)
const Package = ({ className, size = 22 }: IcoProps) => line(size, className, <><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /><path d="m7.5 4.27 9 5.15" /></>)
const Link2 = ({ className, size = 22 }: IcoProps) => line(size, className, <><path d="M9 17H7A5 5 0 0 1 7 7h2" /><path d="M15 7h2a5 5 0 1 1 0 10h-2" /><line x1="8" x2="16" y1="12" y2="12" /></>)
const QrCode = ({ className, size = 22 }: IcoProps) => line(size, className, <><rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" /></>)
const DollarSign = ({ className, size = 22 }: IcoProps) => line(size, className, <><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>)
const CircleCheck = ({ className, size = 20 }: IcoProps) => line(size, className, <><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></>)
const Check = ({ className, size = 18 }: IcoProps) => line(size, className, <path d="M20 6 9 17l-5-5" />)
const Sparkles = ({ className, size = 14 }: IcoProps) => line(size, className, <><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" /><path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" /></>)
const ArrowRight = ({ className, size = 18 }: IcoProps) => line(size, className, <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>)
const Plus = ({ className, size = 20 }: IcoProps) => line(size, className, <><path d="M5 12h14" /><path d="M12 5v14" /></>)
const Instagram = ({ className, size = 16 }: IcoProps) => line(size, className, <><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></>)
const Linkedin = ({ className, size = 16 }: IcoProps) => line(size, className, <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></>)
const Twitter = ({ className, size = 16 }: IcoProps) => line(size, className, <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />)
const Youtube = ({ className, size = 16 }: IcoProps) => line(size, className, <><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" /><path d="m10 15 5-3-5-3z" /></>)

/* ── Data ─────────────────────────────────────────────────────── */
const features = [
  { Icon: Package, color: '#7C3AED', bg: '#EDE9FE', title: 'Catálogo de productos', desc: 'Cargá productos, variantes, fotos y precios. Organizalos por categorías en minutos.' },
  { Icon: Link2, color: '#7C3AED', bg: '#EDE9FE', title: 'Lista de precios compartible', desc: 'Generá un link público o un QR para que tus clientes vean siempre la última versión.' },
  { Icon: QrCode, color: '#0EA5E9', bg: '#BAE6FD', title: 'Códigos QR personalizados', desc: 'Imprimí el QR para tu mostrador, catálogo impreso o redes sociales. Sin apps adicionales.' },
  { Icon: DollarSign, color: '#F59E0B', bg: '#FEF3C7', title: 'Multimoneda y listas por cliente', desc: 'Mostrá precios en pesos, dólares o por canal de venta. Una lista distinta por cliente.' },
]

const steps = [
  ['1', 'Cargá tus productos', 'Importá tu lista o creala desde cero en pocos clics.'],
  ['2', 'Generá tu link o QR', 'Activá el link público y descargá el QR para compartirlo.'],
  ['3', 'Compartí con tus clientes', 'Tus precios y stock siempre actualizados, sin reimprimir nada.'],
]

// Plan content is shared with the in-app billing cards (see lib/plans).
const PLAN_CTA = 'Probar 14 días'

const faqs = [
  ['¿Necesito instalar algo en mi computadora?', 'No. MiPrecio funciona 100% en el navegador y en el celular. Solo creás tu cuenta y empezás a cargar productos.'],
  ['¿Mis clientes necesitan registrarse para ver la lista?', 'No. Tus clientes abren el link o escanean el QR y ven la lista pública sin crear cuenta.'],
  ['¿Puedo tener listas distintas por cliente o canal?', 'Sí. Podés manejar listas por cliente, mayorista, minorista o canal de venta, cada una con sus precios.'],
  ['¿Cómo se actualizan los precios y el stock?', 'Actualizás desde tu panel y el cambio se refleja inmediatamente en el link y el QR que ya compartiste.'],
  ['¿Hay límite de productos o usuarios?', 'Depende de tu plan. El plan Inicial es gratis hasta 10 productos; los planes pagos ofrecen productos y usuarios ilimitados.'],
]

const footerColumns = [
  ['Producto', 'Funciones', 'Precios', 'Casos de uso', 'Novedades', 'Demo'],
  ['Empresa', 'Sobre nosotros', 'Blog', 'Clientes', 'Contacto', 'Trabajá con nosotros'],
  ['Recursos', 'Centro de ayuda', 'Documentación', 'Estado del servicio', 'Guías para pymes', 'Comunidad'],
  ['Legal', 'Términos', 'Privacidad', 'Cookies', 'Seguridad'],
]

/* ── Page ─────────────────────────────────────────────────────── */
export function HomeScreen() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const navigate = useNavigate()
  const location = useLocation()
  const [authOpen, setAuthOpen] = useState(location.pathname === '/login' && !isAuthenticated)

  const openAuth: OpenAuth = () => {
    if (isAuthenticated) {
      navigate('/admin')
      return
    }
    setAuthOpen(true)
  }

  // Smooth anchor scrolling while the landing is shown (scoped, restored on leave).
  useEffect(() => {
    const root = document.documentElement
    const prev = root.style.scrollBehavior
    root.style.scrollBehavior = 'smooth'
    return () => { root.style.scrollBehavior = prev }
  }, [])

  return (
    <main className="landing-page min-h-screen bg-white font-sans text-slate-900">
      <Navbar onAuth={openAuth} isAuthenticated={isAuthenticated} />
      <Hero onAuth={openAuth} />
      <Features />
      <HowItWorks />
      <ProductPreview />
      <Pricing onAuth={openAuth} />
      <Faq />
      <FinalCta onAuth={openAuth} />
      <Footer />
      <AuthModal
        open={authOpen}
        onClose={() => {
          setAuthOpen(false)
          if (location.pathname === '/login') navigate('/', { replace: true })
        }}
      />
    </main>
  )
}

/** Fades + slides its content up the first time it scrolls into view. */
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setShown(true); io.disconnect() }
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      style={{ transitionDelay: shown ? `${delay}ms` : '0ms' }}
      className={`transition-all duration-700 ease-out ${shown ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} ${className}`}
    >
      {children}
    </div>
  )
}

function SectionHead({ eyebrow, title, subtitle, eyebrowColor = 'text-[#7C3AED]', inverted = false }: { eyebrow: string; title: string; subtitle?: string; eyebrowColor?: string; inverted?: boolean }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-3.5 text-center">
      <p className={`text-[13px] font-bold uppercase tracking-[0.15em] ${eyebrowColor}`}>{eyebrow}</p>
      <h2 className={`text-3xl font-extrabold leading-tight tracking-tight md:text-[42px] ${inverted ? 'text-white' : 'text-[#0F172A]'}`}>{title}</h2>
      {subtitle && <p className={`text-base ${inverted ? 'text-indigo-100' : 'text-[#64748B]'}`}>{subtitle}</p>}
    </div>
  )
}

function Navbar({ onAuth, isAuthenticated }: { onAuth: OpenAuth; isAuthenticated: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4 md:px-8">
        <a href="#" className="flex items-center">
          <img src="/miprecio-logo-pencil.png" alt="MiPrecio" className="h-11 w-auto" />
        </a>
        <div className="flex items-center gap-7">
          <nav className="hidden items-center gap-6 text-sm font-medium text-[#475569] lg:flex">
            <a href="#funciones" className="hover:text-[#7C3AED]">Producto</a>
            <a href="#funciones" className="hover:text-[#7C3AED]">Funciones</a>
            <a href="#precios" className="hover:text-[#7C3AED]">Precios</a>
            <a href="#faq" className="hover:text-[#7C3AED]">Recursos</a>
          </nav>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onAuth} className="rounded-[10px] border-[1.5px] border-[#7C3AED] px-[18px] py-2.5 text-sm font-bold text-[#7C3AED] hover:bg-[#F5F3FF]">
              {isAuthenticated ? 'Mi panel' : 'Iniciar sesión'}
            </button>
            <button type="button" onClick={onAuth} className="rounded-[10px] bg-gradient-to-br from-[#7C3AED] to-[#A855F7] px-[18px] py-2.5 text-sm font-semibold text-white hover:brightness-105">
              Probar gratis
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

function Hero({ onAuth }: { onAuth: OpenAuth }) {
  return (
    <section id="producto" className="scroll-mt-24 bg-[linear-gradient(135deg,#2E1065_0%,#5B21B6_45%,#7C3AED_85%,#A855F7_100%)] px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-[1200px] items-center gap-16 lg:grid-cols-[560px_1fr]">
        <div className="flex flex-col gap-6">
          <span className="w-fit rounded-full border border-white/40 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white">
            NUEVO · Compartí tu lista con un QR
          </span>
          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-white md:text-[58px]">
            Tu catálogo online. Tus precios al día.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-[#DDD6FE]">
            Cargá tus productos, controlá tu stock y compartí tu lista de precios con un link o un código QR. Sin planillas, sin PDFs desactualizados, sin complicarte.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={onAuth} className="rounded-xl bg-white px-[22px] py-3.5 text-[15px] font-semibold text-slate-950 shadow-[0_10px_24px_-6px_rgba(124,58,237,0.4)] hover:bg-violet-50">
              Crear cuenta gratis
            </button>
          </div>
        </div>
        <HeroMockup />
      </div>
    </section>
  )
}

function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[580px]">
      <img
        src="/hero-img.png"
        alt="Ejemplo de lista de precios de MiPrecio"
        className="w-full"
      />
      <div className="absolute -left-4 -top-4 flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0F172A] shadow-[0_8px_24px_-4px_rgba(15,23,42,0.15)]">
        <QrCode size={16} className="text-[#0F172A]" /> miprecio.app/p/acme
      </div>
    </div>
  )
}

function Features() {
  return (
    <section id="funciones" className="scroll-mt-24 bg-[#F5F3FF] px-5 py-24 md:px-8">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-12">
        <SectionHead eyebrow="Funciones" title="Todo lo que tu negocio necesita para vender mejor." />
        <Reveal className="grid gap-6 md:grid-cols-2">
          {features.map(({ Icon, color, bg, title, desc }) => (
            <article key={title} className="flex flex-col gap-3.5 rounded-[20px] border border-[#E2E8F0] bg-white p-6 shadow-[0_4px_16px_-6px_rgba(15,23,42,0.08)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: bg, color }}>
                <Icon size={22} />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">{title}</h3>
              <p className="text-sm leading-relaxed text-[#475569]">{desc}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="bg-[#EDE9FE] px-5 py-24 md:px-8">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-12">
        <SectionHead eyebrow="Cómo funciona" title="Empezá en 3 pasos." eyebrowColor="text-[#6D28D9]" />
        <Reveal className="grid gap-6 md:grid-cols-3">
          {steps.map(([number, title, desc]) => (
            <article key={number} className="flex flex-col gap-4 rounded-3xl border border-[#E2E8F0] bg-white p-8 shadow-[0_6px_20px_-8px_rgba(15,23,42,0.08)]">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] text-2xl font-extrabold text-white shadow-[0_8px_18px_-4px_rgba(124,58,237,0.4)]">{number}</div>
              <h3 className="text-xl font-bold text-[#0F172A]">{title}</h3>
              <p className="leading-relaxed text-[#475569]">{desc}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

function ProductPreview() {
  const checks = ['Sin necesidad de descargar apps.', 'Compatible con móvil y escritorio.', 'Personalizá colores y logo de tu marca.']
  return (
    <section className="bg-[linear-gradient(135deg,#FAF5FF_0%,#EDE9FE_100%)] px-5 py-24 md:px-8">
      <Reveal className="mx-auto grid max-w-[1200px] items-center gap-20 lg:grid-cols-[0.8fr_1fr]">
        <PhoneMockup />
        <div className="flex flex-col gap-5">
          <span className="w-fit rounded-full bg-[#EDE9FE] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#7C3AED]">Para tus clientes</span>
          <h2 className="text-3xl font-extrabold leading-tight text-[#0F172A] md:text-4xl">Tus clientes ven una lista profesional, siempre actualizada.</h2>
          <p className="text-base leading-relaxed text-[#475569]">
            Compartí tu catálogo con un link o un QR y olvidate de mandar PDFs desactualizados por WhatsApp. Tus precios y tu stock siempre al día, vean de donde te vean.
          </p>
          <div className="mt-2 flex flex-col gap-3">
            {checks.map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-[15px] font-medium text-[#0F172A]">
                <CircleCheck size={20} className="text-[#10B981]" /> {item}
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function PhoneMockup() {
  return (
    <div className="mx-auto h-[560px] w-[280px] rounded-[32px] bg-[#2E1065] p-2 shadow-[0_30px_60px_-10px_rgba(30,41,59,0.4)]">
      <div className="h-full overflow-hidden rounded-[26px] bg-white">
        <img src="/mockup-img.png" alt="Vista del catálogo de MiPrecio en el celular" className="block w-full" />
      </div>
    </div>
  )
}

function Pricing({ onAuth }: { onAuth: OpenAuth }) {
  return (
    <section id="precios" className="scroll-mt-24 bg-[#EDE9FE] px-5 py-24 md:px-8">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-12">
        <SectionHead eyebrow="Precios" title="Planes simples, pensados para pymes." subtitle="Probá MiPrecio gratis 14 días. Sin tarjeta de crédito." />
        <Reveal className="grid items-stretch gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const dark = plan.popular
            return (
              <article key={plan.name} className={`relative flex flex-col gap-[14px] rounded-[24px] px-7 py-8 ${dark ? 'bg-[#0F172A] text-white shadow-[0_30px_60px_rgba(15,23,42,0.2)]' : 'border border-[#E2E8F0] bg-white'}`}>
                {dark && <em className="absolute right-6 top-6 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] px-3 py-1.5 text-[0.64rem] font-bold not-italic uppercase tracking-[0.05em] text-white">Más popular</em>}
                <h3 className={`text-[1.4rem] font-extrabold ${dark ? 'text-white' : 'text-[#0F172A]'}`}>{plan.name}</h3>
                <p className={`text-[0.84rem] ${dark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>{plan.description}</p>
                <strong className={`mt-2 text-[2.75rem] font-black leading-none ${dark ? 'text-white' : 'text-[#0F172A]'}`}>{plan.price}</strong>
                <small className={`-mt-1.5 text-[0.82rem] font-medium ${dark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>{plan.cadence}</small>
                <span className={`flex w-fit items-center gap-1.5 rounded-full px-[11px] py-[5px] text-[0.74rem] font-semibold ${dark ? 'bg-white/[0.12] text-[#C4B5FD]' : 'bg-[#EDE9FE] text-[#7C3AED]'}`}>
                  <Sparkles size={14} /> 14 días de prueba gratis
                </span>
                <ul className="my-2 flex flex-col gap-3">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2.5 text-[0.88rem] font-medium ${dark ? 'text-[#E2E8F0]' : 'text-[#334155]'}`}>
                      <Check size={18} className={`flex-none ${dark ? 'text-[#C4B5FD]' : 'text-[#7C3AED]'}`} /> {f}
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

function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="scroll-mt-24 bg-[#F5F3FF] px-5 py-24 md:px-8">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10">
        <SectionHead eyebrow="Preguntas frecuentes" title="Todo lo que necesitás saber." />
        <Reveal className="mx-auto flex w-full max-w-[800px] flex-col gap-3.5">
          {faqs.map(([q, a], i) => {
            const isOpen = open === i
            return (
              <div key={q} className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-6 py-5">
                <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-3 text-left text-base font-bold text-[#0F172A]">
                  {q}
                  <Plus size={20} className={`shrink-0 text-[#7C3AED] transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
                </button>
                <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="leading-relaxed text-[#475569]">{a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}

function FinalCta({ onAuth }: { onAuth: OpenAuth }) {
  return (
    <section className="bg-[#EDE9FE] px-5 py-20 md:px-8">
      <Reveal className="mx-auto flex max-w-[1100px] flex-col items-center gap-5 rounded-[32px] bg-gradient-to-br from-[#7C3AED] to-[#A855F7] px-8 py-16 text-center shadow-[0_32px_80px_-20px_rgba(124,58,237,0.5)] md:px-20">
        <h2 className="text-4xl font-black leading-tight tracking-tight text-white md:text-[46px]">Tu lista de precios, lista en 5 minutos.</h2>
        <p className="max-w-2xl text-[17px] font-medium text-[#E0E7FF]">Creá tu cuenta gratis hoy y empezá a compartir tu catálogo con un link o un QR.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-3.5">
          <button type="button" onClick={onAuth} className="flex h-[52px] items-center gap-2 rounded-[14px] bg-white px-7 text-[15px] font-bold text-[#7C3AED] hover:bg-violet-50">
            Crear cuenta gratis <ArrowRight size={18} />
          </button>
          <a href="mailto:hola@miprecio.app" className="flex h-[52px] items-center rounded-[14px] border border-white/40 px-7 text-[15px] font-bold text-white hover:bg-white/10">Hablar con ventas</a>
        </div>
      </Reveal>
    </section>
  )
}

function Footer() {
  const socials = [Instagram, Linkedin, Twitter, Youtube]
  return (
    <footer className="bg-[#2E1065] px-5 pb-8 pt-16 text-white md:px-[120px]">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-16 lg:grid-cols-[320px_repeat(4,1fr)]">
          <div className="flex flex-col gap-4">
            <img src="/miprecio-logo-white-pencil.png" alt="MiPrecio" className="h-12 w-auto self-start" />
            <p className="text-[13px] leading-relaxed text-[#94A3B8]">
              La plataforma simple para que tu negocio cargue productos, controle stock y comparta su lista de precios con un link o un QR.
            </p>
            <div className="mt-2 flex gap-2.5">
              {socials.map((Ico, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white/10 text-white hover:bg-white/20">
                  <Ico size={16} />
                </a>
              ))}
            </div>
          </div>
          {footerColumns.map(([title, ...links]) => (
            <div key={title} className="flex flex-col gap-3.5">
              <h3 className="text-[13px] font-bold tracking-wide text-white">{title}</h3>
              {links.map((link) => (
                <a key={link} href="#" className="text-[13px] font-medium text-[#94A3B8] hover:text-white">{link}</a>
              ))}
            </div>
          ))}
        </div>
        <div className="my-10 h-px bg-white/10" />
        <p className="text-center text-xs font-medium text-[#64748B]">© 2026 MiPrecio. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

export default HomeScreen
