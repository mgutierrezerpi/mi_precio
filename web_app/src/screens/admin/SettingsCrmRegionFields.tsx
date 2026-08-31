import { Field, inputClass } from './SettingsCrmShared'
import type { TFn } from '../../lib/i18n'

const CURRENCIES = ['UYU', 'ARS', 'USD', 'BRL', 'CLP', 'PYG', 'PEN', 'MXN']
const LANGUAGES = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
]
const BUSINESS_CATEGORIES = [
  ['restaurant', 'Restaurante'],
  ['bakery', 'Panadería'],
  ['cafe', 'Cafetería'],
  ['grocery', 'Almacén / minimercado'],
  ['drugstore', 'Farmacia'],
  ['hardware', 'Ferretería'],
  ['beauty', 'Belleza / salón'],
  ['clothing', 'Indumentaria'],
  ['home', 'Hogar / decoración'],
  ['pets', 'Mascotas'],
  ['services', 'Servicios'],
  ['other', 'Otro'],
] as const
const TIMEZONES = [
  'America/Montevideo',
  'America/Argentina/Buenos_Aires',
  'America/Santiago',
  'America/Sao_Paulo',
  'America/Asuncion',
  'America/Lima',
  'America/Mexico_City',
  'America/Bogota',
  'UTC',
]

type Props = {
  businessCategory: string
  canManage: boolean
  currency: string
  language: string
  onChange: () => void
  setBusinessCategory: (value: string) => void
  setCurrency: (value: string) => void
  setLanguage: (value: string) => void
  setTimezone: (value: string) => void
  t: TFn
  timezone: string
}

export function RegionFields({
  businessCategory,
  canManage,
  currency,
  language,
  onChange,
  setBusinessCategory,
  setCurrency,
  setLanguage,
  setTimezone,
  t,
  timezone,
}: Props) {
  const fields = [
    {
      label: t('set.region.currency'),
      options: CURRENCIES.map((value) => [value, value]),
      setValue: setCurrency,
      value: currency,
    },
    {
      label: t('set.region.language'),
      options: LANGUAGES.map(({ code, label }) => [code, label]),
      setValue: setLanguage,
      value: language,
    },
    {
      label: 'Categoría del negocio',
      options: [['', 'Sin categoría'], ...BUSINESS_CATEGORIES],
      setValue: setBusinessCategory,
      value: businessCategory,
    },
    {
      label: t('set.region.timezone'),
      options: TIMEZONES.map((value) => [value, value.replace(/_/g, ' ')]),
      setValue: setTimezone,
      value: timezone,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {fields.map((field) => (
        <Field key={field.label} label={field.label}>
          <select
            value={field.value}
            onChange={(event) => {
              onChange()
              field.setValue(event.target.value)
            }}
            disabled={!canManage}
            className={inputClass}
          >
            {field.options.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      ))}
    </div>
  )
}
