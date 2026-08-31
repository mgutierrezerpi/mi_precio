import type { TFn } from '../../lib/i18n'
import { Icon } from './crm/ui'
import { Field } from './SettingsCrmShared'

export function PublicUrlField({
  copied,
  onCopy,
  t,
  url,
}: {
  copied: boolean
  onCopy: () => void
  t: TFn
  url: string
}) {
  const buttonClass =
    'flex items-center gap-2 rounded-xl border border-[var(--dash-border)] ' +
    'bg-[var(--dash-soft)] px-3.5 py-2.5 text-left transition ' +
    'hover:border-[var(--dash-link)]'
  return (
    <Field label={t('set.info.publicUrl')}>
      <button
        type="button"
        onClick={onCopy}
        title="Copiar enlace"
        className={buttonClass}
      >
        <Icon name="link-2" size={15} className="text-[var(--dash-link)]" />
        <span className="flex-1 truncate text-sm font-semibold text-[var(--dash-link)]">
          {url}
        </span>
        <Icon
          name={copied ? 'circle-check' : 'copy'}
          size={15}
          className="text-[var(--dash-link)]"
        />
      </button>
    </Field>
  )
}
