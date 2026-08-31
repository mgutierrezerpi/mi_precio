import { useState } from 'react'
import type { Customer } from '../../../types'
import api from '../../../services/api'
import { gradient } from '../crm/theme'
import { useOperationsT } from '../customerUtils'
import { CustomerFormFields } from './customer_form_fields'
import { Overlay } from './shared'

export function CustomerModal({
  tenantId,
  customer,
  onClose,
  onSaved,
}: {
  tenantId?: string
  customer?: Customer
  onClose: () => void
  onSaved: (id: string) => void
}) {
  const t = useOperationsT()
  const isEdit = !!customer
  const [name, setName] = useState(customer?.name ?? '')
  const [rut, setRut] = useState(customer?.rut ?? '')
  const [email, setEmail] = useState(customer?.email ?? '')
  const [phone, setPhone] = useState(customer?.phone ?? '')
  const [notes, setNotes] = useState(customer?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const emailError =
    email.trim() !== '' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())
  const valid = name.trim() !== '' && !emailError

  const save = async () => {
    if (!valid || saving) return
    setSaving(true)
    const body = {
      name: name.trim(),
      rut: rut.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      notes: notes.trim() || null,
    }
    const res = isEdit
      ? await api.updateCustomer(customer.id, body)
      : await api.createCustomer(tenantId!, body)
    setSaving(false)
    if (res.data) onSaved(res.data.id)
  }

  return (
    <Overlay onClose={onClose}>
      <div
        className={[
          'w-full max-w-[440px] rounded-3xl border border-[var(--dash-border)]',
          'bg-[var(--dash-surface)] p-6 shadow-2xl',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-extrabold text-[var(--dash-text)]">
          {isEdit ? t('customers.editCustomer') : t('customers.new')}
        </h3>
        <CustomerFormFields
          email={email}
          emailError={emailError}
          name={name}
          notes={notes}
          onEmailChange={setEmail}
          onNameChange={setName}
          onNotesChange={setNotes}
          onPhoneChange={setPhone}
          onRutChange={setRut}
          phone={phone}
          rut={rut}
        />
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl px-4 text-sm font-bold text-[var(--dash-text2)] hover:bg-[var(--dash-soft)]"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!valid || saving}
            className={`h-10 rounded-xl px-5 text-sm font-bold text-white disabled:opacity-50 ${gradient}`}
          >
            {saving
              ? t('common.saving')
              : isEdit
                ? t('common.saveChanges')
                : t('customers.create')}
          </button>
        </div>
      </div>
    </Overlay>
  )
}
