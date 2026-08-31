import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { trackEvent } from '../lib/analytics'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  clearAuthError,
  resetCodeFlow,
  selectAuthError,
  selectAuthLoading,
  selectCodeSent,
  selectIsAuthenticated,
  selectNeedsPlan,
  selectPendingEmail,
  sendCode,
  tenantNeedsPlan,
  verifyCode,
} from '../store/slices/authSlice'
import { AuthHeader, AuthIntro, SecurityNote } from './AuthCardChrome'
import { CodeForm, EmailForm } from './AuthCardForms'

/** Email-to-code authentication state and redirect coordinator. */
export function AuthCard({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isLoading = useAppSelector(selectAuthLoading)
  const error = useAppSelector(selectAuthError)
  const codeSent = useAppSelector(selectCodeSent)
  const pendingEmail = useAppSelector(selectPendingEmail)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const needsPlan = useAppSelector(selectNeedsPlan)
  const inviteEmail = searchParams.get('email')
  const [email, setEmail] = useState(inviteEmail ?? '')
  const [code, setCode] = useState('')
  const inviteAttempted = useRef(false)

  useEffect(() => {
    const inviteCode = searchParams.get('code')
    if (
      !inviteEmail ||
      codeSent ||
      !inviteCode ||
      isAuthenticated ||
      inviteAttempted.current
    )
      return
    inviteAttempted.current = true
    void dispatch(verifyCode({ email: inviteEmail, code: inviteCode })).then(
      (result) => {
        if (verifyCode.fulfilled.match(result)) trackEvent('Completed Login')
      }
    )
  }, [codeSent, dispatch, inviteEmail, isAuthenticated, searchParams])

  useEffect(() => {
    if (isAuthenticated)
      navigate(needsPlan ? '/plans' : '/admin', { replace: true })
  }, [isAuthenticated, needsPlan, navigate])

  const handleSendCode = (event: FormEvent) => {
    event.preventDefault()
    dispatch(clearAuthError())
    void dispatch(sendCode({ email }))
  }
  const handleVerifyCode = async (event: FormEvent) => {
    event.preventDefault()
    dispatch(clearAuthError())
    const result = await dispatch(verifyCode({ email: pendingEmail!, code }))
    if (verifyCode.fulfilled.match(result)) {
      trackEvent('Completed Login')
      navigate(tenantNeedsPlan(result.payload.tenant) ? '/plans' : '/admin')
    }
  }
  const handleChangeEmail = () => {
    dispatch(resetCodeFlow())
    setCode('')
  }

  return (
    <div className="flex w-full max-w-[440px] flex-col gap-5 rounded-[24px] bg-white p-9 shadow-[0_30px_80px_-20px_rgba(30,27,75,0.45)] sm:p-10">
      <AuthHeader onClose={onClose} />
      <AuthIntro codeSent={codeSent} pendingEmail={pendingEmail} />
      {codeSent ? (
        <CodeForm
          code={code}
          error={error}
          isLoading={isLoading}
          onChangeEmail={handleChangeEmail}
          onCodeChange={setCode}
          onSubmit={handleVerifyCode}
        />
      ) : (
        <EmailForm
          email={email}
          error={error}
          isLoading={isLoading}
          onEmailChange={setEmail}
          onSubmit={handleSendCode}
        />
      )}
      <SecurityNote />
    </div>
  )
}

export default AuthCard
