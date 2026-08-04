/** Theme-aware tinted surface (background + matching foreground) for CRM screens. */
export type Tone = 'violet' | 'sky' | 'blue' | 'green' | 'amber' | 'orange' | 'red' | 'pink' | 'rose' | 'slate' | 'purple'

export const tone = (t: Tone) => ({ backgroundColor: `var(--tone-${t}-bg)`, color: `var(--tone-${t}-fg)` })

// Accent treatment from the Stripe Dashboard Dark POC: cool violet into a
// slightly warmer magenta, used for active navigation and primary actions.
export const gradient = 'bg-[linear-gradient(135deg,#7C3AED_0%,#C026D3_100%)]'
