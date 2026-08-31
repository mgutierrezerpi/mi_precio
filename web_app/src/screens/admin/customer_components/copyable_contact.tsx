import { useState, type MouseEvent } from 'react'
import { Icon } from '../crm/ui'
import { useOperationsT, copyText } from '../customerUtils'

export function CopyableContact({
  value,
  kind,
}: {
  value: string
  kind: 'email' | 'phone'
}) {
  const t = useOperationsT()
  const [copied, setCopied] = useState(false)
  const copy = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (await copyText(value)) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    }
  }
  const label =
    kind === 'email' ? t('contacts.copyEmail') : t('contacts.copyPhone')
  return (
    <button
      type="button"
      onClick={(event) => void copy(event)}
      title={copied ? t('contacts.copied') : label}
      aria-label={copied ? t('contacts.copied') : label}
      className={[
        'group flex min-w-0 max-w-full items-center gap-1 text-left text-xs font-medium',
        'text-[var(--dash-text2)] transition hover:text-[var(--dash-link)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-link)]/30',
      ].join(' ')}
    >
      <span className="truncate">{value}</span>
      <span className="shrink-0 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
        <Icon name={copied ? 'circle-check' : 'copy'} size={12} />
      </span>
    </button>
  )
}
