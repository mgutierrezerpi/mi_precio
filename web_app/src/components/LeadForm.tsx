import { useState } from 'react'
import api from '../services/api'
import { getT } from '../lib/i18n'
import type { Tenant } from '../types'

/** Alpha suffixes for hex colours, so the card can be built from the design's
 *  ink alone instead of every template having to hand over five more shades. */
const A = { hairline: '22', wash: '0d', placeholder: '99' }

export interface LeadFormProps {
  tenant: Tenant
  /** Which list they were reading, so the shop knows what the question is about. */
  listId?: string | null
  listName?: string | null
  /** The design's text colour; everything else is derived from it. */
  ink: string
  /** The design's accent, used for the button. */
  accent: string
  /** Ink for text sitting on `accent`. */
  accentInk?: string
  /** Set on dark templates so the card lifts off the page instead of sinking. */
  dark?: boolean
}

/** "Dejanos tus datos" at the foot of a public list.
 *
 *  Renders nothing unless the shop turned leads on. The server decides for
 *  real — a tier without the feature silently stores nothing — but there is no
 *  point showing a form whose submissions go nowhere.
 *
 *  Takes the list's palette rather than carrying its own, so it looks like the
 *  page it sits on across all nine templates. */
export function LeadForm({
  tenant,
  listId,
  listName,
  ink,
  accent,
  accentInk = '#FFFFFF',
  dark,
}: LeadFormProps) {
  const t = getT(tenant.language)
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  // Honeypot. Hidden from people, irresistible to bots.
  const [website, setWebsite] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  if (!tenant.leadsEnabled) return null

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (state === 'sending') return
    setState('sending')
    setError(null)

    const res = await api.createLead(tenant.subdomain, {
      ...form,
      listId,
      listName,
      source: 'form',
      website,
    })

    if (res.error) {
      // The API only says something back when the visitor can fix it.
      setError(res.error)
      setState('error')
      return
    }
    setState('sent')
  }

  const surface = dark ? '#FFFFFF12' : `${ink}${A.wash}`
  const field = {
    background: dark ? '#00000026' : '#FFFFFFAA',
    border: `1px solid ${ink}${A.hairline}`,
    color: ink,
  }

  const shell = {
    background: surface,
    color: ink,
    border: `1px solid ${ink}${A.hairline}`,
  }

  if (state === 'sent') {
    return (
      <section
        data-no-export
        className="mt-12 w-full rounded-3xl px-6 py-16 text-center"
        style={shell}
      >
        <p className="text-[28px] font-bold md:text-[34px]">{t('lead.thanksTitle')}</p>
        <p className="mt-3 text-[16px] opacity-70 md:text-[18px]">
          {t('lead.thanksBody')}
        </p>
      </section>
    )
  }

  return (
    /* A form is not part of the list, so it stays out of the PDF entirely —
     *  `.mp-exporting` only hides the controls, which would leave the shell. */
    <section
      data-no-export
      className="mt-12 grid w-full gap-8 rounded-3xl px-6 py-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] md:gap-16 md:px-14 md:py-14"
      style={shell}
    >
      {/* The ask on the left, the answering on the right: the button gets a
       *  column to close instead of floating in a corner. Display size, capped
       *  in `ch` so the question wraps to two lines in any of the three
       *  languages — at body size it left the column mostly empty. */}
      <div className="flex flex-col md:justify-center">
        <p className="max-w-[13ch] text-[30px] font-bold leading-[1.05] md:text-[46px] lg:text-[54px]">
          {t('lead.title')}
        </p>
        <p className="mt-4 max-w-[30ch] text-[16px] leading-relaxed opacity-70 md:mt-5 md:text-[18px]">
          {t('lead.subtitle')}
        </p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            required
            value={form.name}
            onChange={(e) => set('name')(e.target.value)}
            placeholder={t('lead.name')}
            aria-label={t('lead.name')}
            className="h-[56px] rounded-2xl px-5 text-[16px] outline-none"
            style={field}
          />
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(e) => set('phone')(e.target.value)}
            placeholder={t('lead.phone')}
            aria-label={t('lead.phone')}
            className="h-[56px] rounded-2xl px-5 text-[16px] outline-none"
            style={field}
          />
        </div>
        <input
          type="email"
          value={form.email}
          onChange={(e) => set('email')(e.target.value)}
          placeholder={t('lead.email')}
          aria-label={t('lead.email')}
          className="h-[56px] rounded-2xl px-5 text-[16px] outline-none"
          style={field}
        />
        <textarea
          rows={3}
          value={form.message}
          onChange={(e) => set('message')(e.target.value)}
          placeholder={t('lead.message')}
          aria-label={t('lead.message')}
          className="resize-none rounded-2xl px-5 py-4 text-[16px] outline-none"
          style={field}
        />

        {/* Off-screen rather than display:none — some bots skip hidden fields. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }}
        />

        {error && (
          <p className="text-[13px] font-semibold" style={{ color: '#DC2626' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={state === 'sending'}
          className="mt-2 h-[60px] w-full rounded-2xl text-[17px] font-bold disabled:opacity-60"
          style={{ background: accent, color: accentInk }}
        >
          {state === 'sending' ? t('lead.sending') : t('lead.submit')}
        </button>
      </form>
    </section>
  )
}

export default LeadForm
