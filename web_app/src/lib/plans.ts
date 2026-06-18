import type { PlanId } from '../types'

/** Marketing content for each plan — the single source shared by the landing and
 *  the in-app billing cards so they always say the same thing. Ordered cheapest → top. */
/** Limits a plan advertises (`null` = unlimited). Drives the in-app usage bars so
 *  the graph matches what the cards promise. */
export interface PlanLimits {
  products: number | null
  lists: number | null
  members: number | null
}

export interface PlanContent {
  id: PlanId
  name: string
  description: string
  price: string
  cadence: string
  features: string[]
  limits: PlanLimits
  popular?: boolean
}

const FREE_PLAN: PlanContent = {
  id: 'free',
  name: 'Sin plan',
  description: 'Cuenta sin suscripción activa.',
  price: '$U 0',
  cadence: 'sin suscripción',
  features: ['Hasta 10 productos', '1 lista pública', '1 usuario'],
  limits: { products: 10, lists: 1, members: 1 },
}

export const PLANS: PlanContent[] = [
  {
    id: 'micro',
    name: 'Micro',
    description: 'Para empezar con una lista simple y compartirla por link o QR.',
    price: '$U 200',
    cadence: 'por mes',
    features: ['14 días gratis', 'Hasta 25 productos', '3 listas públicas', 'QR personalizado'],
    limits: { products: 25, lists: 3, members: 1 },
  },
  {
    id: 'plus',
    name: 'Plus',
    description: 'Más productos, más listas y herramientas para operar mejor.',
    price: '$U 790',
    cadence: 'por mes',
    features: ['Prueba gratis', 'Hasta 300 productos', '15 listas públicas', 'Equipo de hasta 5 usuarios'],
    limits: { products: 300, lists: 15, members: 5 },
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Límites altos, equipo completo y funciones avanzadas.',
    price: '$U 1.390',
    cadence: 'por mes',
    features: ['Prueba gratis', 'Productos ilimitados', 'Listas ilimitadas', 'Usuarios ilimitados'],
    limits: { products: null, lists: null, members: null },
  },
]

export const planById = (id: PlanId): PlanContent => id === 'free' ? FREE_PLAN : (PLANS.find((p) => p.id === id) || FREE_PLAN)
