import type { TFn } from '../../lib/i18n'
import { Field, inputCls } from './SettingsCrmShared'

export function InfoDetailsFields({
  canManage,
  name,
  onChange,
  setName,
  setSubdomain,
  setTaxId,
  subdomain,
  t,
  taxId,
}: {
  canManage: boolean
  name: string
  onChange: () => void
  setName: (value: string) => void
  setSubdomain: (value: string) => void
  setTaxId: (value: string) => void
  subdomain: string
  t: TFn
  taxId: string
}) {
  const fields = [
    [t('set.info.name'), name, setName, undefined],
    [t('set.info.subdomain'), subdomain, setSubdomain, undefined],
    [t('set.info.taxId'), taxId, setTaxId, '21 123456 0017'],
  ] as const
  return (
    <div className="grid grid-cols-2 gap-4">
      {fields.map(([label, value, setValue, placeholder]) => (
        <Field key={label} label={label}>
          <input
            value={value}
            onChange={(e) => {
              onChange()
              setValue(e.target.value)
            }}
            disabled={!canManage}
            placeholder={placeholder}
            className={inputCls}
          />
        </Field>
      ))}
    </div>
  )
}
