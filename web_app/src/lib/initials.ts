/** Up to two initials for a business or person: one per word, «Café Ñandú»
 *  → «CÑ». The account button and the business list used different rules
 *  (initials vs. first two letters) and showed «CÑ» and «CA» for the same
 *  business. */
export function initialsOf(name: string, fallback = 'U'): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || fallback
  )
}
