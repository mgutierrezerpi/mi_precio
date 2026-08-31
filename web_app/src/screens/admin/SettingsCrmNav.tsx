import type { TFn } from '../../lib/i18n'
import { Icon, type IconName } from './crm/ui'
import { gradient } from './crm/theme'

const sections: { key: string; tKey: string; icon: IconName; danger?: boolean }[] = [
  { key: 'info', tKey: 'set.sec.info', icon: 'package' },
  { key: 'brand', tKey: 'set.sec.brand', icon: 'paintbrush' },
  { key: 'notifications', tKey: 'set.sec.notifications', icon: 'bell' },
  { key: 'region', tKey: 'set.sec.region', icon: 'settings' },
  { key: 'security', tKey: 'set.sec.security', icon: 'user' },
  { key: 'billing', tKey: 'set.sec.billing', icon: 'tags' },
  { key: 'delete', tKey: 'set.sec.delete', icon: 'circle-x', danger: true },
]

export function settingsSections() {
  return sections
}

export function SettingsNav({
  active,
  onSelect,
  simple,
  t,
}: {
  active: string
  onSelect: (key: string) => void
  simple: boolean
  t: TFn
}) {
  const className = simple
    ? 'flex w-full shrink-0 flex-col gap-1 self-start rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3 md:w-[240px]'
    : 'flex w-full shrink-0 flex-col gap-1 self-start rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3 lg:w-[240px]'
  return (
    <div className={className}>
      {sections.map((section) => (
        <button
          key={section.key}
          type="button"
          onClick={() => onSelect(section.key)}
          className={`flex h-10 items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 text-left text-[13px] font-semibold ${section.key === active ? `text-white ${gradient}` : section.danger ? 'text-[#EF4444] hover:bg-[var(--dash-soft)]' : 'text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]'}`}
        >
          <Icon name={section.icon} size={16} /> {t(section.tKey)}
        </button>
      ))}
    </div>
  )
}
