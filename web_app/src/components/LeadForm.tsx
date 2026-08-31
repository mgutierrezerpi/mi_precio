import { useState } from 'react'
import api from '../services/api'
import { getT } from '../lib/i18n'
import type { Tenant } from '../types'
import {
  FORM_SHELL_CLASS,
  LeadFormFields,
  LeadFormIntro,
  type LeadValues,
} from './LeadFormView'
import { LeadFormThanks } from './LeadFormThanks'

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
  const [form, setForm] = useState<LeadValues>({
    name: '',
    phone: '',
    email: '',
    message: '',
  })
  // Honeypot. Hidden from people, irresistible to bots.
  const [website, setWebsite] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle'
  )
  const [error, setError] = useState<string | null>(null)

  if (!tenant.leadsEnabled) return null

  const setField = (key: keyof LeadValues, value: string) =>
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
    return <LeadFormThanks t={t} shell={shell} />
  }

  return (
    /* A form is not part of the list, so it stays out of the PDF entirely —
     *  `.mp-exporting` only hides the controls, which would leave the shell. */
    <section data-no-export className={FORM_SHELL_CLASS} style={shell}>
      {/* The ask on the left, the answering on the right: the button gets a
       *  column to close instead of floating in a corner. Display size, capped
       *  in `ch` so the question wraps to two lines in any of the three
       *  languages — at body size it left the column mostly empty. */}
      <LeadFormIntro t={t} />

      <form onSubmit={submit} className="flex flex-col gap-4">
        <LeadFormFields
          t={t}
          form={form}
          setField={setField}
          website={website}
          setWebsite={setWebsite}
          fieldStyle={field}
          error={error}
          sending={state === 'sending'}
          accent={accent}
          accentInk={accentInk}
        />
      </form>
    </section>
  )
}

export default LeadForm
