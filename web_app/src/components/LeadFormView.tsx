import type { CSSProperties } from 'react'

export type LeadValues = {
  name: string
  phone: string
  email: string
  message: string
}

type Translate = (key: string) => string

const FORM_SHELL_CLASS = [
  'mt-12 grid w-full gap-8 rounded-3xl px-6 py-10',
  'md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] md:gap-16 md:px-14 md:py-14',
].join(' ')
const FIELD_CLASS = 'h-[56px] rounded-2xl px-5 text-[16px] outline-none'

export function LeadFormIntro({ t }: { t: Translate }) {
  return (
    <div className="flex flex-col md:justify-center">
      <p className="max-w-[13ch] text-[30px] font-bold leading-[1.05] md:text-[46px] lg:text-[54px]">
        {t('lead.title')}
      </p>
      <p className="mt-4 max-w-[30ch] text-[16px] leading-relaxed opacity-70 md:mt-5 md:text-[18px]">
        {t('lead.subtitle')}
      </p>
    </div>
  )
}

export function LeadFormFields({
  t,
  form,
  setField,
  website,
  setWebsite,
  fieldStyle,
  error,
  sending,
  accent,
  accentInk,
}: {
  t: Translate
  form: LeadValues
  setField: (key: keyof LeadValues, value: string) => void
  website: string
  setWebsite: (value: string) => void
  fieldStyle: CSSProperties
  error: string | null
  sending: boolean
  accent: string
  accentInk: string
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <LeadInput
          required
          value={form.name}
          onChange={(value) => setField('name', value)}
          label={t('lead.name')}
          style={fieldStyle}
        />
        <LeadInput
          required
          type="tel"
          value={form.phone}
          onChange={(value) => setField('phone', value)}
          label={t('lead.phone')}
          style={fieldStyle}
        />
      </div>
      <LeadInput
        type="email"
        value={form.email}
        onChange={(value) => setField('email', value)}
        label={t('lead.email')}
        style={fieldStyle}
      />
      <textarea
        rows={3}
        value={form.message}
        onChange={(event) => setField('message', event.target.value)}
        placeholder={t('lead.message')}
        aria-label={t('lead.message')}
        className="resize-none rounded-2xl px-5 py-4 text-[16px] outline-none"
        style={fieldStyle}
      />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }}
      />
      {error && (
        <p className="text-[13px] font-semibold" style={{ color: '#DC2626' }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={sending}
        className="mt-2 h-[60px] w-full rounded-2xl text-[17px] font-bold disabled:opacity-60"
        style={{ background: accent, color: accentInk }}
      >
        {sending ? t('lead.sending') : t('lead.submit')}
      </button>
    </>
  )
}

function LeadInput({
  type = 'text',
  required,
  value,
  onChange,
  label,
  style,
}: {
  type?: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  label: string
  style: CSSProperties
}) {
  return (
    <input
      required={required}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={label}
      aria-label={label}
      className={FIELD_CLASS}
      style={style}
    />
  )
}

export { FORM_SHELL_CLASS }
