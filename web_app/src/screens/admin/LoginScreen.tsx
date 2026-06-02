import { useNavigate } from 'react-router-dom'
import { AuthCard } from '../../components/AuthCard'

export function LoginScreen() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1E1B4B] to-[#4C1D95] p-4 font-sans">
      <AuthCard onClose={() => navigate('/')} />
    </div>
  )
}

export default LoginScreen
