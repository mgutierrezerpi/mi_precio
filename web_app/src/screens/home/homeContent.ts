import { localeForHostname } from '../../lib/domainLocale'
import { DollarSign, Link2, Package, QrCode } from './homeIcons'

export const landingText = (spanish: string, english: string) =>
  localeForHostname() === 'en' ? english : spanish
/* ── Data ─────────────────────────────────────────────────────── */
export const features = [
  {
    Icon: Package,
    color: '#7C3AED',
    bg: '#EDE9FE',
    title: landingText('Catálogo de productos', 'Product catalog'),
    desc: landingText(
      'Cargá productos, variantes, fotos y precios. Organizalos por categorías en minutos.',
      'Add products, variants, photos, and prices. Organize everything by category in minutes.'
    ),
  },
  {
    Icon: Link2,
    color: '#7C3AED',
    bg: '#EDE9FE',
    title: landingText('Lista de precios compartible', 'Shareable price list'),
    desc: landingText(
      'Generá un link público o un QR para que tus clientes vean siempre la última versión.',
      'Create a public link or QR code so customers always see the latest version.'
    ),
  },
  {
    Icon: QrCode,
    color: '#0EA5E9',
    bg: '#BAE6FD',
    title: landingText('Códigos QR personalizados', 'Custom QR codes'),
    desc: landingText(
      'Imprimí el QR para tu mostrador, catálogo impreso o redes sociales. Sin apps adicionales.',
      'Print your QR code for your counter, printed catalog, or social media. No extra apps needed.'
    ),
  },
  {
    Icon: DollarSign,
    color: '#F59E0B',
    bg: '#FEF3C7',
    title: landingText(
      'Multimoneda y listas por cliente',
      'Multiple currencies and customer lists'
    ),
    desc: landingText(
      'Mostrá precios en pesos, dólares o por canal de venta. Una lista distinta por cliente.',
      'Show prices in different currencies or sales channels. Use a separate list for each customer.'
    ),
  },
]

export const steps = [
  [
    '1',
    landingText('Cargá tus productos', 'Add your products'),
    landingText(
      'Importá tu lista o creala desde cero en pocos clics.',
      'Import your list or create one from scratch in a few clicks.'
    ),
  ],
  [
    '2',
    landingText('Generá tu link o QR', 'Create your link or QR code'),
    landingText(
      'Activá el link público y descargá el QR para compartirlo.',
      'Publish your link and download the QR code to share it.'
    ),
  ],
  [
    '3',
    landingText('Compartí con tus clientes', 'Share with your customers'),
    landingText(
      'Tus precios y stock siempre actualizados, sin reimprimir nada.',
      'Keep prices and stock current without reprinting anything.'
    ),
  ],
]

// Plan content is shared with the in-app billing cards (see lib/plans).
export const PLAN_CTA = landingText(
  'Probar 14 días gratis',
  'Start 14-day free trial'
)

export const faqs = [
  [
    landingText(
      '¿Necesito instalar algo en mi computadora?',
      'Do I need to install anything?'
    ),
    landingText(
      'No. MiPrecio funciona 100% en el navegador y en el celular. Solo creás tu cuenta y empezás a cargar productos.',
      'No. PricePanel runs entirely in your browser and on your phone. Create an account and start adding products.'
    ),
  ],
  [
    landingText(
      '¿Mis clientes necesitan registrarse para ver la lista?',
      'Do my customers need to register?'
    ),
    landingText(
      'No. Tus clientes abren el link o escanean el QR y ven la lista pública sin crear cuenta.',
      'No. They open the link or scan the QR code and see the public list without an account.'
    ),
  ],
  [
    landingText(
      '¿Puedo tener listas distintas por cliente o canal?',
      'Can I create different lists for customers or channels?'
    ),
    landingText(
      'Sí. Podés manejar listas por cliente, mayorista, minorista o canal de venta, cada una con sus precios.',
      'Yes. Create lists by customer, wholesale, retail, or sales channel, each with its own prices.'
    ),
  ],
  [
    landingText(
      '¿Cómo se actualizan los precios y el stock?',
      'How do I update prices and stock?'
    ),
    landingText(
      'Actualizás desde tu panel y el cambio se refleja inmediatamente en el link y el QR que ya compartiste.',
      'Update them in your dashboard and the shared link and QR code reflect the changes immediately.'
    ),
  ],
  [
    landingText(
      '¿Hay límite de productos o usuarios?',
      'Are there limits on products or users?'
    ),
    landingText(
      'Depende de tu plan. Micro incluye lo básico para empezar; Plus y Pro agregan más capacidad para operar con más listas, productos y equipo.',
      'It depends on your plan. Micro has the essentials, while Plus and Pro add capacity for more lists, products, and teammates.'
    ),
  ],
]

export const navLinks = [
  ['#funciones', landingText('Funciones', 'Features')],
  ['#precios', landingText('Precios', 'Pricing')],
  ['#faq', landingText('Recursos', 'Resources')],
  ['/l/cafecitos', 'Demo'],
]
