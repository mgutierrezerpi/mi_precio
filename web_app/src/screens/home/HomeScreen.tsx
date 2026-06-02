import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { selectIsAuthenticated } from '../../store/slices/authSlice'
import { AuthModal } from '../../components/AuthModal'

type OpenAuth = () => void

const features = [
  ['Catálogo de productos', 'Cargá productos, variantes, fotos y precios. Organizalos por categorías en minutos.'],
  ['Control de stock', 'Actualizá unidades en tiempo real y recibí alertas cuando un producto está por agotarse.'],
  ['Lista de precios compartible', 'Generá un link público o un QR para que tus clientes vean siempre la última versión.'],
  ['Códigos QR personalizados', 'Imprimí el QR para tu mostrador, catálogo impreso o redes sociales.'],
  ['Multimoneda y listas por cliente', 'Mostrá precios en pesos, dólares o por canal de venta.'],
  ['Actualizaciones masivas', 'Ajustá precios por porcentaje en toda una categoría sin rehacer planillas.'],
]

const steps = [
  ['1', 'Cargá tus productos', 'Importá tu lista o creala desde cero en pocos clics.'],
  ['2', 'Generá tu link o QR', 'Activá el link público y descargá el QR para compartirlo.'],
  ['3', 'Compartí con tus clientes', 'Tus precios y stock siempre actualizados, sin reimprimir nada.'],
]

const stats = [
  ['2.500+', 'Negocios activos'],
  ['180k', 'Productos cargados'],
  ['1.2M', 'QR escaneados'],
  ['98%', 'Recomendarían MiPrecio'],
]

const plans = [
  {
    name: 'Inicial',
    description: 'Para empezar a tener tu lista online.',
    price: 'Gratis',
    cadence: 'Por siempre',
    features: ['Hasta 10 productos', '1 lista pública', 'QR personalizado', 'Soporte por email'],
    highlighted: false,
    cta: 'Empezar gratis',
  },
  {
    name: 'Pyme',
    description: 'Para negocios que ya están creciendo.',
    price: '$19',
    cadence: 'USD por mes',
    features: ['Productos ilimitados', 'Listas por cliente', 'Control de stock + alertas', 'Multiusuario (5)', 'Soporte prioritario'],
    highlighted: true,
    cta: 'Probar 14 días',
  },
  {
    name: 'Negocio',
    description: 'Para equipos comerciales y mayoristas.',
    price: '$49',
    cadence: 'USD por mes',
    features: ['Todo lo de Pyme', 'Multimoneda', 'Importación masiva', 'Usuarios ilimitados', 'Integración con WhatsApp'],
    highlighted: false,
    cta: 'Hablar con ventas',
  },
]

const productRows = [
  ['Tornillo hex. 8mm', 'FER-001', '$85', 'Disponible', 'text-emerald-600 bg-emerald-50'],
  ['Cable eléctrico 2.5', 'ELE-220', '$1.250', 'Disponible', 'text-emerald-600 bg-emerald-50'],
  ['Pintura látex 4L', 'PIN-104', '$9.800', 'Bajo stock', 'text-amber-600 bg-amber-50'],
  ['Cemento 50kg', 'CON-050', '$6.300', 'Sin stock', 'text-red-600 bg-red-50'],
]

export function HomeScreen() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const navigate = useNavigate()
  const location = useLocation()
  // Opening /login (or any auth CTA) shows the modal over the landing.
  const [authOpen, setAuthOpen] = useState(location.pathname === '/login' && !isAuthenticated)

  // Open the auth modal, or go straight to the panel if already signed in.
  const openAuth: OpenAuth = () => {
    if (isAuthenticated) {
      navigate('/admin')
      return
    }
    setAuthOpen(true)
  }

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900">
      <Nav onAuth={openAuth} isAuthenticated={isAuthenticated} />
      <Hero onAuth={openAuth} />
      <Features />
      <HowItWorks />
      <ClientPreview />
      <Stats />
      <Testimonials />
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

function Nav({ onAuth, isAuthenticated }: { onAuth: OpenAuth; isAuthenticated: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <a href="#" className="flex items-center">
          <img src="/miprecio-logo-pencil.png" alt="MiPrecio" className="h-11 w-auto" />
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#producto" className="hover:text-violet-700">Producto</a>
          <a href="#funciones" className="hover:text-violet-700">Funciones</a>
          <a href="#precios" className="hover:text-violet-700">Precios</a>
          <a href="#faq" className="hover:text-violet-700">Recursos</a>
        </nav>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onAuth} className="hidden text-sm font-bold text-violet-700 sm:inline-flex">
            {isAuthenticated ? 'Mi panel' : 'Iniciar sesión'}
          </button>
          <button type="button" onClick={onAuth} className="rounded-full bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-700/20 hover:bg-violet-800">
            Probar gratis
          </button>
        </div>
      </div>
    </header>
  )
}

function Hero({ onAuth }: { onAuth: OpenAuth }) {
  return (
    <section id="producto" className="relative overflow-hidden bg-[#24105f]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.55),transparent_32%),radial-gradient(circle_at_88%_15%,rgba(236,72,153,0.35),transparent_28%),linear-gradient(135deg,#351279_0%,#14082f_100%)]" />
      <div className="absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-[1fr_0.95fr] md:px-8 md:py-28">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
            Nuevo · Compartí tu lista con un QR
          </div>
          <h1 className="max-w-3xl text-5xl font-extrabold leading-[0.98] tracking-[-0.05em] text-white md:text-7xl">
            Tu catálogo online. Tus precios al día.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-violet-100">
            Cargá tus productos, controlá tu stock y compartí tu lista de precios con un link o un código QR. Sin planillas, sin PDFs desactualizados.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <button type="button" onClick={onAuth} className="rounded-full bg-white px-6 py-3.5 text-center text-sm font-bold text-slate-950 shadow-xl shadow-black/20 hover:bg-violet-50">
              Crear cuenta gratis
            </button>
            <Link to="/p/demo" className="rounded-full border border-white/25 px-6 py-3.5 text-center text-sm font-bold text-white hover:bg-white/10">
              Ver demo
            </Link>
          </div>
          <p className="mt-7 text-sm font-medium text-violet-200">Más de 2.500 negocios ya usan MiPrecio</p>
        </div>
        <ProductCard />
      </div>
    </section>
  )
}

function ProductCard() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2rem] bg-white/10 blur-2xl" />
      <div className="relative rounded-[2rem] border border-white/20 bg-white p-5 shadow-2xl shadow-black/30">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Lista de precios</h2>
            <p className="mt-1 text-xs text-slate-400">Distribuidora ACME · Actualizada hoy</p>
          </div>
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">miprecio.app/p/acme</span>
        </div>
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400">Buscar producto...</div>
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="grid grid-cols-[1.4fr_0.75fr_0.65fr_0.85fr] bg-slate-50 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <span>Producto</span>
            <span>SKU</span>
            <span>Precio</span>
            <span>Stock</span>
          </div>
          {productRows.map(([name, sku, price, stock, badge]) => (
            <div key={sku} className="grid grid-cols-[1.4fr_0.75fr_0.65fr_0.85fr] items-center border-t border-slate-100 px-4 py-3 text-xs">
              <span className="font-bold text-slate-900">{name}</span>
              <span className="text-slate-500">{sku}</span>
              <span className="font-extrabold text-slate-900">{price}</span>
              <span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-bold ${badge}`}>{stock}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
            <p className="text-xs font-bold text-violet-700">Link público</p>
            <p className="mt-1 text-sm font-bold text-slate-900">miprecio.app/p/acme</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-bold text-emerald-700">Stock actualizado</p>
            <p className="mt-1 text-sm font-bold text-slate-900">Hace 2 min</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Features() {
  return (
    <section id="funciones" className="px-5 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionIntro eyebrow="Funciones" title="Todo lo que tu negocio necesita para vender mejor." />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(([title, description]) => (
            <article key={title} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-lg font-black text-violet-700">✓</div>
              <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="bg-violet-50/70 px-5 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionIntro eyebrow="Cómo funciona" title="Empezá en 3 pasos." />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map(([number, title, description]) => (
            <article key={number} className="rounded-[1.75rem] border border-violet-100 bg-white p-7 shadow-sm">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-violet-700 text-2xl font-black text-white">{number}</div>
              <h3 className="text-xl font-extrabold">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ClientPreview() {
  return (
    <section className="px-5 py-24 md:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1fr]">
        <PhoneMockup />
        <div>
          <SectionIntro eyebrow="Para tus clientes" title="Tus clientes ven una lista profesional, siempre actualizada." align="left" />
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
            Compartí tu catálogo con un link o un QR y olvidate de mandar PDFs desactualizados por WhatsApp. Tus precios y tu stock siempre al día, vean de donde te vean.
          </p>
          <div className="mt-8 space-y-4">
            {['Sin necesidad de descargar apps.', 'Compatible con móvil y escritorio.', 'Personalizá colores y logo de tu marca.'].map((item) => (
              <div key={item} className="flex items-center gap-3 font-semibold text-slate-900">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-sm text-violet-700">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function PhoneMockup() {
  const items = [
    ['Taladro Bosch', 'Bosch · 13mm', 'UYU 8.990'],
    ['Pintura látex 4L', 'Alba · Blanco', 'UYU 1.430'],
    ['Cemento 50kg', 'Bolsa', 'UYU 985'],
    ['Lámpara LED 9W', 'Philips · E27', 'UYU 145'],
  ]

  return (
    <div className="mx-auto w-full max-w-sm rounded-[2.5rem] bg-slate-950 p-3 shadow-2xl shadow-violet-200">
      <div className="overflow-hidden rounded-[2rem] bg-white">
        <div className="bg-gradient-to-br from-violet-700 to-fuchsia-600 p-6 text-white">
          <p className="text-xs font-extrabold uppercase tracking-widest text-white/70">Actualizado</p>
          <h3 className="mt-5 text-2xl font-black">Ferretería y pintura</h3>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/15 p-3"><strong>142</strong><p className="text-xs text-white/70">prods</p></div>
            <div className="rounded-2xl bg-white/15 p-3"><strong>24h</strong><p className="text-xs text-white/70">envíos</p></div>
          </div>
        </div>
        <div className="p-5">
          <div className="mb-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-400">Buscar...</div>
          <div className="mb-4 flex gap-2 text-xs font-bold">
            <span className="rounded-full bg-violet-700 px-3 py-2 text-white">Todos</span>
            <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-600">Ferretería</span>
            <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-600">Pinturas</span>
          </div>
          <div className="space-y-3">
            {items.map(([name, detail, price]) => (
              <div key={name} className="rounded-2xl border border-slate-100 p-4">
                <p className="text-sm font-extrabold">{name}</p>
                <p className="mt-1 text-xs text-slate-400">{detail}</p>
                <p className="mt-3 text-sm font-black">{price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stats() {
  return (
    <section className="bg-[#14082f] px-5 py-20 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionIntro eyebrow="Resultados" title="Negocios que ya tienen su lista de precios online." inverted />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([value, label]) => (
            <div key={label} className="rounded-[1.5rem] border border-white/10 bg-white/10 p-7">
              <p className="text-4xl font-black">{value}</p>
              <p className="mt-3 text-sm text-indigo-100">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  const quotes = [
    ['Antes mandaba la lista por PDF cada vez que cambiaban los precios. Ahora mis clientes escanean el QR y siempre ven la versión correcta.', 'LF', 'Lucía Fernández', 'Dueña, Almacén Norte'],
    ['El control de stock cambió la forma en que reponemos mercadería. Las alertas nos avisan antes de quedar sin producto.', 'MS', 'Martín Sosa', 'Gerente, Distrimax'],
    ['Tener una lista por cliente es oro para ventas mayoristas. Cada uno ve sus precios, sin confusiones ni descuentos a mano.', 'CP', 'Carla Pérez', 'Comercial, AceroPlus'],
  ]

  return (
    <section className="px-5 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionIntro eyebrow="Testimonios" title="Lo que dicen quienes ya usan MiPrecio." />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {quotes.map(([quote, initials, name, role]) => (
            <article key={name} className="rounded-[1.5rem] border border-slate-200 p-7 shadow-sm">
              <p className="leading-7 text-slate-700">"{quote}"</p>
              <div className="mt-7 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-700 text-sm font-bold text-white">{initials}</span>
                <div>
                  <p className="font-bold">{name}</p>
                  <p className="text-sm text-slate-500">{role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing({ onAuth }: { onAuth: OpenAuth }) {
  return (
    <section id="precios" className="bg-slate-50 px-5 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionIntro eyebrow="Precios" title="Planes simples, pensados para pymes." subtitle="Probá MiPrecio gratis 14 días. Sin tarjeta de crédito." />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className={`relative rounded-[2rem] border p-8 ${plan.highlighted ? 'border-slate-950 bg-slate-950 text-white shadow-2xl shadow-slate-300' : 'border-slate-200 bg-white text-slate-950 shadow-sm'}`}>
              {plan.highlighted && <span className="absolute right-6 top-6 rounded-full bg-violet-700 px-3 py-1 text-xs font-bold text-white">Más popular</span>}
              <h3 className="text-2xl font-black">{plan.name}</h3>
              <p className={`mt-2 text-sm ${plan.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>{plan.description}</p>
              <div className="mt-8 flex items-end gap-2">
                <p className="text-5xl font-black tracking-tight">{plan.price}</p>
                <p className={`pb-2 text-sm ${plan.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>{plan.cadence}</p>
              </div>
              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className={`flex items-center gap-3 text-sm ${plan.highlighted ? 'text-slate-200' : 'text-slate-700'}`}>
                    <span className="text-violet-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={onAuth} className={`mt-8 flex rounded-full px-5 py-3 text-center text-sm font-bold ${plan.highlighted ? 'bg-violet-700 text-white hover:bg-violet-600' : 'bg-slate-100 text-slate-950 hover:bg-slate-200'}`}>
                <span className="w-full">{plan.cta}</span>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Faq() {
  const questions = [
    ['¿Necesito instalar algo en mi computadora?', 'No. MiPrecio funciona 100% en el navegador y en el celular. Solo creás tu cuenta y empezás a cargar productos.'],
    ['¿Mis clientes necesitan registrarse para ver la lista?', 'No. Tus clientes abren el link o escanean el QR y ven la lista pública sin crear cuenta.'],
    ['¿Puedo tener listas distintas por cliente o canal?', 'Sí. Podés manejar listas por cliente, mayorista, minorista o canal de venta.'],
    ['¿Cómo se actualizan los precios y el stock?', 'Actualizás desde tu panel y el cambio se refleja inmediatamente en el link compartido.'],
  ]

  return (
    <section id="faq" className="px-5 py-24 md:px-8">
      <div className="mx-auto max-w-4xl">
        <SectionIntro eyebrow="Preguntas frecuentes" title="Todo lo que necesitás saber." />
        <div className="mt-10 divide-y divide-slate-200 rounded-[1.5rem] border border-slate-200 bg-white">
          {questions.map(([question, answer]) => (
            <details key={question} className="group p-6" open={question.startsWith('¿Necesito')}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-extrabold">
                {question}
                <span className="text-violet-700 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 leading-7 text-slate-600">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCta({ onAuth }: { onAuth: OpenAuth }) {
  return (
    <section className="px-5 pb-24 md:px-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-700 to-slate-950 p-10 text-center text-white shadow-2xl shadow-violet-200 md:p-16">
        <h2 className="text-4xl font-black tracking-tight md:text-6xl">Tu lista de precios, lista en 5 minutos.</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-indigo-100">Creá tu cuenta gratis hoy y empezá a compartir tu catálogo con un link o un QR.</p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <button type="button" onClick={onAuth} className="rounded-full bg-white px-6 py-3.5 text-sm font-bold text-violet-700">Crear cuenta gratis</button>
          <a href="mailto:hola@miprecio.app" className="rounded-full border border-white/25 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10">Hablar con ventas</a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const columns = [
    ['Producto', 'Funciones', 'Precios', 'Casos de uso', 'Demo'],
    ['Empresa', 'Sobre nosotros', 'Blog', 'Clientes', 'Contacto'],
    ['Recursos', 'Centro de ayuda', 'Documentación', 'Estado del servicio', 'Guías para pymes'],
    ['Legal', 'Términos', 'Privacidad', 'Cookies', 'Seguridad'],
  ]

  return (
    <footer className="bg-slate-950 px-5 py-14 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <img src="/miprecio-logo-white-pencil.png" alt="MiPrecio" className="h-12 w-auto" />
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
              La plataforma simple para que tu negocio cargue productos, controle stock y comparta su lista de precios con un link o un QR.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map(([title, ...links]) => (
              <div key={title}>
                <h3 className="mb-4 text-sm font-bold">{title}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link}><a href="#" className="text-sm text-slate-400 hover:text-white">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-8 text-sm text-slate-500">© 2026 MiPrecio. Todos los derechos reservados.</div>
      </div>
    </footer>
  )
}

function SectionIntro({ eyebrow, title, subtitle, align = 'center', inverted = false }: { eyebrow: string; title: string; subtitle?: string; align?: 'left' | 'center'; inverted?: boolean }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className={`text-sm font-black uppercase tracking-[0.18em] ${inverted ? 'text-indigo-200' : 'text-violet-700'}`}>{eyebrow}</p>
      <h2 className={`mt-4 text-4xl font-black leading-tight tracking-[-0.04em] md:text-5xl ${inverted ? 'text-white' : 'text-slate-950'}`}>{title}</h2>
      {subtitle && <p className={`mt-4 text-base ${inverted ? 'text-indigo-100' : 'text-slate-500'}`}>{subtitle}</p>}
    </div>
  )
}

export default HomeScreen
