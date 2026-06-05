/** Theme-aware tinted surface (background + matching foreground) for CRM screens. */
export type Tone = 'violet' | 'sky' | 'blue' | 'green' | 'amber' | 'orange' | 'red' | 'pink' | 'rose' | 'slate' | 'purple'

export const tone = (t: Tone) => ({ backgroundColor: `var(--tone-${t}-bg)`, color: `var(--tone-${t}-fg)` })

export const gradient = 'bg-[linear-gradient(45deg,#7C3AED_0%,#A855F7_100%)]'
