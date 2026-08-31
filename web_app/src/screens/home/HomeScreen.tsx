import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthModal } from '../../components/AuthModal'
import { useTheme } from '../../hooks/useTheme'
import { localeForHostname } from '../../lib/domainLocale'
import { useAppSelector } from '../../store/hooks'
import {
  selectIsAuthenticated,
  selectNeedsPlan,
} from '../../store/slices/authSlice'
import { HomeFaq } from './HomeFaq'
import { HomeFeatures } from './HomeFeatures'
import { HomeFooter, HomeFinalCta } from './HomeFooter'
import { HomeHero } from './HomeHero'
import { HomeHowItWorks } from './HomeHowItWorks'
import { HomeNavbar } from './HomeNavbar'
import { HomePricing } from './HomePricing'
import { HomeProductPreview } from './HomeProductPreview'
import { BackToTop } from './homeShared'
import type { OpenAuth } from './homeTypes'

export function HomeScreen() {
  useTheme()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const needsPlan = useAppSelector(selectNeedsPlan)
  const navigate = useNavigate()
  const location = useLocation()
  const [authOpen, setAuthOpen] = useState(
    location.pathname === '/login' && !isAuthenticated
  )

  const openAuth: OpenAuth = () => {
    if (isAuthenticated) {
      navigate(needsPlan ? '/plans' : '/admin')
      return
    }
    setAuthOpen(true)
  }

  useLandingDocument()

  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to={needsPlan ? '/plans' : '/admin'} replace />
  }

  return (
    <main className="dash landing-page min-h-screen overflow-x-clip bg-white font-sans text-slate-900">
      <HomeNavbar onAuth={openAuth} isAuthenticated={isAuthenticated} />
      <HomeHero onAuth={openAuth} />
      <HomeFeatures />
      <HomeHowItWorks />
      <HomeProductPreview />
      <HomePricing onAuth={openAuth} />
      <HomeFaq />
      <HomeFinalCta onAuth={openAuth} />
      <HomeFooter />
      <BackToTop />
      <AuthModal
        open={authOpen}
        onClose={() => {
          setAuthOpen(false)
          if (location.pathname === '/login') navigate('/', { replace: true })
        }}
      />
    </main>
  )
}

function useLandingDocument() {
  useEffect(() => {
    const root = document.documentElement
    const previousScroll = root.style.scrollBehavior
    const previousLanguage = root.lang
    root.style.scrollBehavior = 'smooth'
    root.lang = localeForHostname()
    return () => {
      root.style.scrollBehavior = previousScroll
      root.lang = previousLanguage
    }
  }, [])
}

export default HomeScreen
