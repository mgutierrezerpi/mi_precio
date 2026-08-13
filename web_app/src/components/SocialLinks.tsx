import { getT } from '../lib/i18n'
import { activeSocials } from '../lib/socials'
import { SocialIcon } from './SocialIcon'
import type { Tenant } from '../types'

/** The shop's social icons, for the footer of every public list design.
 *
 *  Renders nothing when the shop filled in none of them: a row of placeholder
 *  icons would advertise that this business has no presence anywhere.
 *
 *  Deliberately has no chip or pill behind each icon — the nine list designs
 *  range from near-black to off-white footers, and any fixed overlay colour is
 *  invisible on half of them. Bare glyphs take the colour the design passes in,
 *  so each footer stays its own.
 *
 *  Links open in a new tab so a customer reading the catalogue never loses it,
 *  and carry `noopener` because these are URLs the shop typed. */
export function SocialLinks({
  tenant,
  color,
  /** Only for designs with a distinct hover ink; by default hovering just
   *  brings the icon to full opacity, which reads on every palette. */
  hoverColor,
  align = 'start',
  size = 19,
}: {
  tenant: Tenant
  color: string
  hoverColor?: string
  align?: 'start' | 'center'
  size?: number
}) {
  const t = getT(tenant.language)
  const socials = activeSocials(tenant)
  if (!socials.length) return null

  return (
    <div
      className={`flex flex-wrap items-center gap-4 ${align === 'center' ? 'justify-center' : ''}`}
    >
      {socials.map((social) => (
        <a
          key={social.id}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          title={t(social.tKey)}
          aria-label={t(social.tKey)}
          className="transition-opacity hover:opacity-100"
          style={{ color, opacity: 0.85 }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = hoverColor ?? color
            e.currentTarget.style.opacity = '1'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = color
            e.currentTarget.style.opacity = '0.85'
          }}
        >
          <SocialIcon id={social.id} size={size} />
        </a>
      ))}
    </div>
  )
}

export default SocialLinks
