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

export const PLANS: PlanContent[] = [
  {
    id: 'free',
    name: 'Inicial',
    description: 'Para empezar a tener tu lista online.',
    price: '$ 5',
    cadence: 'USD por mes',
    features: ['Hasta 10 productos', '1 lista pública', 'QR personalizado', 'Soporte por email'],
    limits: { products: 10, lists: 1, members: 1 },
  },
  {
    id: 'pyme',
    name: 'Pyme',
    description: 'Para negocios que ya están creciendo.',
    price: '$ 20',
    cadence: 'USD por mes',
    features: ['Productos ilimitados', 'Listas por cliente', 'Multiusuario (5)', 'Soporte prioritario'],
    limits: { products: null, lists: null, members: 5 },
    popular: true,
  },
  {
    id: 'pro',
    name: 'Negocio Pro',
    description: 'Para equipos comerciales y mayoristas.',
    price: '$ 35',
    cadence: 'USD por mes',
    features: ['Todo lo de Pyme', 'Multimoneda', 'Importación masiva', 'Usuarios ilimitados', 'Integración con WhatsApp'],
    limits: { products: null, lists: null, members: null },
  },
]

export const planById = (id: PlanId): PlanContent => PLANS.find((p) => p.id === id)!
