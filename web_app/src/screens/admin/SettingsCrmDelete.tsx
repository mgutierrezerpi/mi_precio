import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Tenant } from '../../types'
import api from '../../services/api'
import { useAppDispatch } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'
import type { TFn } from '../../lib/i18n'
import { Icon } from './crm/ui'
import { Field, inputClass, SectionHeader } from './SettingsCrmShared'

export function DeleteSection({
  t,
  tenant,
  isOwner,
}: {
  t: TFn
  tenant: Tenant | null
  isOwner: boolean
}) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const keyword = tenant?.subdomain || 'eliminar'

  const remove = async () => {
    if (
      !tenant?.id ||
      confirmText.trim().toLowerCase() !== keyword.toLowerCase()
    )
      return
    setDeleting(true)
    setError(null)
    const res = await api.deleteTenant(tenant.id)
    if (res.error) {
      setError(res.error)
      setDeleting(false)
      return
    }
    await dispatch(logout())
    navigate('/', { replace: true })
  }

  if (!isOwner) {
    return (
      <>
        <SectionHeader
          t={t}
          title={t('set.sec.delete')}
          subtitle={t('set.delete.subtitle')}
          canManage={false}
        />
        <div className="flex items-center gap-2 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-soft)] px-4 py-3 text-xs font-semibold text-[var(--dash-text2)]">
          <Icon name="alert-triangle" size={15} /> {t('set.delete.ownerOnly')}
        </div>
      </>
    )
  }

  return (
    <>
      <SectionHeader
        t={t}
        title={t('set.sec.delete')}
        subtitle={t('set.delete.subtitle')}
        canManage={false}
      />
      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--tone-red-fg)]/40 bg-[var(--tone-red-bg)] p-5">
        <div className="flex items-start gap-3">
          <Icon
            name="alert-triangle"
            size={20}
            className="mt-0.5 shrink-0 text-[var(--tone-red-fg)]"
          />
          <p className="text-sm font-semibold text-[var(--tone-red-fg)]">
            {t('set.delete.warning', { name: tenant?.name || '' })}
          </p>
        </div>
        {error && (
          <p className="text-xs font-bold text-[var(--tone-red-fg)]">{error}</p>
        )}
        <Field label={t('set.delete.confirm', { keyword })}>
          <input
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            className={inputClass}
            placeholder={keyword}
          />
        </Field>
        <button
          type="button"
          onClick={remove}
          disabled={
            deleting ||
            confirmText.trim().toLowerCase() !== keyword.toLowerCase()
          }
          className="flex h-11 w-fit items-center gap-2 rounded-xl bg-[#EF4444] px-5 text-sm font-bold text-white hover:bg-[#DC2626] disabled:opacity-50"
        >
          <Icon name="circle-x" size={16} />{' '}
          {deleting ? t('set.delete.deleting') : t('set.delete.button')}
        </button>
      </div>
    </>
  )
}
