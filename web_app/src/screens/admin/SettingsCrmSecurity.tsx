import type { Role } from '../../types'
import type { TFn } from '../../lib/i18n'
import { Icon } from './crm/ui'
import { tone } from './crm/theme'
import { Row, SectionHeader } from './SettingsCrmShared'

export function SecuritySection({
  t,
  user,
  onLogout,
}: {
  t: TFn
  user: { email: string; role: Role; name: string } | null
  onLogout: () => void
}) {
  return (
    <>
      <SectionHeader
        t={t}
        title={t('set.sec.security')}
        subtitle={t('set.security.subtitle')}
        canManage={false}
      />
      <div className="flex items-center gap-2 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-4 py-3 text-xs font-semibold text-[var(--dash-text2)]">
        <Icon
          name="circle-check"
          size={15}
          className="text-[var(--tone-green-fg)]"
        />{' '}
        {t('set.security.passwordless')}
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--dash-border)] p-4">
        <Row label={t('set.security.email')} value={user?.email ?? '—'} />
        <Row
          label={t('set.security.role')}
          value={user ? t(`role.${user.role}`) : '—'}
        />
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold"
        style={tone('red')}
      >
        <Icon name="log-out" size={16} /> {t('set.security.logout')}
      </button>
    </>
  )
}
