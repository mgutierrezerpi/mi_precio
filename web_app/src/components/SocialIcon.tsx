import type { SocialId } from '../lib/socials'
import { SOCIAL_ICON_PATHS } from './SocialIconPaths'

/** Brand glyphs for the shop's social links.
 *
 *  Drawn as filled paths rather than the stroked `Icon` set used inside the
 *  CRM: these are recognisable logos, and a stroked outline of the Instagram
 *  or TikTok mark reads as a different brand. Website is the odd one out — a
 *  generic globe, since there is no logo for "their own site". */
export function SocialIcon({
  id,
  className,
  size = 20,
}: {
  id: SocialId
  className?: string
  size?: number
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d={SOCIAL_ICON_PATHS[id]} />
    </svg>
  )
}

export default SocialIcon
