/**
 * The small set of values new CRM pages should compose from. Keep these
 * examples aligned with the CSS variables in index.css so the portal stays a
 * useful, executable reference instead of becoming a second design system.
 */
export const DESIGN_TOKENS = {
  spacing: [
    { name: '1 · micro', value: '4px', utility: 'gap-1 / p-1' },
    { name: '2 · control', value: '8px', utility: 'gap-2 / p-2' },
    { name: '3 · compact', value: '12px', utility: 'gap-3 / p-3' },
    { name: '4 · standard', value: '16px', utility: 'gap-4 / p-4' },
    { name: '6 · section', value: '24px', utility: 'gap-6 / p-6' },
    { name: '8 · page', value: '32px', utility: 'gap-8 / p-8' },
  ],
  type: [
    { name: 'Display', value: '32 / 38', utility: 'text-3xl font-extrabold' },
    { name: 'Heading', value: '20 / 28', utility: 'text-xl font-bold' },
    { name: 'Body', value: '14 / 22', utility: 'text-sm' },
    { name: 'Meta', value: '12 / 16', utility: 'text-xs font-semibold' },
  ],
  radii: [
    { name: 'Control', value: '8px', utility: 'rounded-lg' },
    { name: 'Card', value: '12px', utility: 'rounded-xl' },
    { name: 'Pill', value: '999px', utility: 'rounded-full' },
  ],
  containers: [
    { name: 'Page gutter', value: '24px desktop · 16px mobile' },
    { name: 'Content max', value: '1200px' },
    { name: 'Reading measure', value: '680px' },
  ],
} as const

