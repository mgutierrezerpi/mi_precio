import { useState } from 'react'
import api from '../../services/api'
import { useAppSelector } from '../../store/hooks'
import { selectUser } from '../../store/slices/authSlice'
import { SupportHeader, TicketSuccess } from './SupportFeedback'
import { SupportTicketForm } from './SupportTicketForm'
import { CrmLayout } from './crm/CrmLayout'
import { type Priority, useOperationsT } from './supportTranslation'

export function SupportScreen() {
  const t = useOperationsT()
  const email = useAppSelector(selectUser)?.email
  const form = useSupportForm()
  return <CrmLayout active={t('support.title')} title={t('support.title')} subtitle={t('support.subtitle')} hideContext>
    <main className="mx-auto flex min-h-full w-full max-w-[820px] flex-col gap-4 px-4 py-6 md:px-10 md:py-8">
      <SupportHeader />
      {form.ticketId !== null ? (
        <TicketSuccess email={email} ticketId={form.ticketId} onReset={form.reset} />
      ) : <SupportTicketForm {...form} email={email} />}
    </main>
  </CrmLayout>
}

function useSupportForm() {
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
    const result = await api.createSupportTicket(subject.trim(), description.trim(), priority)
    setSending(false)
    if (result.error) return setError(result.error)
    setTicketId(result.data?.id ?? '')
    setSubject('')
    setDescription('')
    setPriority('medium')
  }
  const reset = () => {
    setTicketId(null)
    setError(null)
  }
  return {
    subject, setSubject, description, setDescription, priority, setPriority,
    sending, error, valid, ticketId, submit, reset,
  }
}

export default SupportScreen
