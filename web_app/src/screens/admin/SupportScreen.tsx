import { useState } from 'react'
import { useAppSelector } from '../../store/hooks'
import { selectUser } from '../../store/slices/authSlice'
import api from '../../services/api'
import { CrmLayout } from './crm/CrmLayout'
import { Icon } from './crm/ui'
import { tone, gradient, type Tone } from './crm/theme'

type Priority = 'low' | 'medium' | 'high' | 'urgent'

const PRIORITIES: { id: Priority; label: string; t: Tone }[] = [
  { id: 'low', label: 'Baja', t: 'slate' },
  { id: 'medium', label: 'Media', t: 'sky' },
  { id: 'high', label: 'Alta', t: 'amber' },
  { id: 'urgent', label: 'Urgente', t: 'rose' },
]

const SUPPORT_EMAIL = 'soporte@miprecio.app'

export function SupportScreen() {
  const me = useAppSelector(selectUser)

  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ticketId, setTicketId] = useState<number | string | null>(null)

  const valid = subject.trim().length >= 3 && description.trim().length >= 10

  const submit = async () => {
    if (!valid || sending) return
    setSending(true)
    setError(null)
    const res = await api.createSupportTicket(subject.trim(), description.trim(), priority)
    setSending(false)
    if (res.error) setError(res.error)
    else {
      setTicketId(res.data?.id ?? '')
      setSubject('')
      setDescription('')
      setPriority('medium')
    }
  }

  const reset = () => { setTicketId(null); setError(null) }

  return (
    <CrmLayout active="Soporte" title="Soporte" subtitle="¿Necesitás ayuda? Abrí un ticket y te respondemos por email.">
      <div className="mx-auto flex max-w-[820px] flex-col gap-5 p-4 md:p-8">
        {/* Success */}
        {ticketId !== null ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-8 text-center shadow-[0_18px_50px_-18px_rgba(30,27,75,0.18)]">
            <span className="flex h-14 w-14 items-center justify-center rounded-full" style={tone('green')}><Icon name="circle-check" size={28} /></span>
            <h3 className="text-xl font-extrabold text-[var(--dash-text)]">¡Ticket enviado!</h3>
            <p className="max-w-[440px] text-sm font-medium text-[var(--dash-text2)]">
              {ticketId ? <>Registramos tu consulta con el número <span className="font-bold text-[var(--dash-text)]">#{ticketId}</span>. </> : null}
              Te vamos a responder al correo <span className="font-bold text-[var(--dash-text)]">{me?.email}</span>.
            </p>
            <button type="button" onClick={reset} className={`mt-2 flex h-10 items-center gap-1.5 rounded-xl px-5 text-sm font-bold text-white ${gradient}`}>
              <Icon name="plus" size={16} /> Abrir otro ticket
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-[0_18px_50px_-18px_rgba(30,27,75,0.18)]">
            {error && (
              <div className="flex items-center gap-2 rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm font-semibold text-[#B91C1C]">
                <Icon name="alert-triangle" size={16} /> {error}
              </div>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[var(--dash-text2)]">Asunto *</span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={255}
                placeholder="Resumen del problema o consulta"
                className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 py-2.5 text-sm font-medium text-[var(--dash-text)] outline-none placeholder:text-[var(--dash-muted)] focus:border-[var(--dash-link)]"
              />
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[var(--dash-text2)]">Prioridad</span>
              <div className="flex flex-wrap gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`rounded-full px-3.5 py-1.5 text-[13px] font-bold transition ${priority === p.id ? 'ring-2 ring-[var(--dash-link)] ring-offset-1 ring-offset-[var(--dash-surface)]' : 'opacity-70 hover:opacity-100'}`}
                    style={tone(p.t)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[var(--dash-text2)]">Descripción *</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={7}
                maxLength={10000}
                placeholder="Contanos qué pasó, qué esperabas y, si aplica, los pasos para reproducirlo."
                className="resize-y rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 py-2.5 text-sm font-medium leading-relaxed text-[var(--dash-text)] outline-none placeholder:text-[var(--dash-muted)] focus:border-[var(--dash-link)]"
              />
              <span className="text-[11px] font-medium text-[var(--dash-muted)]">Responderemos a {me?.email}.</span>
            </label>

            <div className="flex items-center justify-between gap-3">
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-xs font-semibold text-[var(--dash-link)] hover:underline">
                O escribinos a {SUPPORT_EMAIL}
              </a>
              <button
                type="button"
                onClick={submit}
                disabled={!valid || sending}
                className={`flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-bold text-white shadow-[0_8px_20px_-4px_rgba(124,58,237,0.4)] disabled:opacity-50 ${gradient}`}
              >
                <Icon name="send" size={16} /> {sending ? 'Enviando…' : 'Enviar ticket'}
              </button>
            </div>
          </div>
        )}
      </div>
    </CrmLayout>
  )
}

export default SupportScreen
