import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { store } from './store'
import { router } from './routes'
import api, {
  setAuthErrorHandler,
  setConnectionErrorHandler,
  setPlanRequiredHandler,
} from './services/api'
import { logout, setTenant } from './store/slices/authSlice'
import { ToastContainer, toast } from './components/Toast'
import { trackEvent } from './lib/analytics'

let lastConnectionToastAt = 0

function pageDetails(pathname: string): { page_name: string; area: string } {
  if (pathname === '/') return { page_name: 'Home', area: 'public' }
  if (pathname === '/login') return { page_name: 'Login', area: 'public' }
  if (pathname.startsWith('/p/')) return { page_name: 'Public Menu', area: 'public' }
  if (pathname.startsWith('/m/')) return { page_name: 'Public Magazine', area: 'public' }
  if (pathname === '/planes') return { page_name: 'Choose Plan', area: 'onboarding' }
  if (pathname === '/admin') return { page_name: 'Admin Dashboard', area: 'admin' }
  if (pathname === '/admin/items') return { page_name: 'Products', area: 'admin' }
  if (pathname === '/admin/categories') return { page_name: 'Categories', area: 'admin' }
  if (pathname === '/admin/lists') return { page_name: 'Price Lists', area: 'admin' }
  if (pathname === '/admin/magazines') return { page_name: 'Magazines', area: 'admin' }
  if (pathname.startsWith('/admin/lists/')) return { page_name: 'Price List Editor', area: 'admin' }
  if (pathname === '/admin/qr') return { page_name: 'QR Codes', area: 'admin' }
  if (pathname === '/admin/clientes') return { page_name: 'Customers', area: 'admin' }
  if (pathname === '/admin/reportes') return { page_name: 'Reports', area: 'admin' }
  if (pathname === '/admin/equipo') return { page_name: 'Team', area: 'admin' }
  if (pathname === '/admin/soporte') return { page_name: 'Support', area: 'admin' }
  if (pathname === '/admin/settings') return { page_name: 'Settings', area: 'admin' }
  return { page_name: 'Unknown', area: pathname.startsWith('/admin') ? 'admin' : 'public' }
}

function App() {
  useEffect(() => {
    let lastPathname = ''
    const trackPageView = (pathname: string) => {
      if (pathname === lastPathname) return
      lastPathname = pathname
      trackEvent('Viewed Platform Page', pageDetails(pathname))
    }

    trackPageView(router.state.location.pathname)
    const unsubscribe = router.subscribe((state) => {
      if (state.navigation.state === 'idle') trackPageView(state.location.pathname)
    })

    setAuthErrorHandler(() => {
      store.dispatch(logout())
      router.navigate('/')
      toast.warning('Tu sesión ha expirado')
    })
    setConnectionErrorHandler(() => {
      const now = Date.now()
      if (now - lastConnectionToastAt < 4000) return
      lastConnectionToastAt = now
      toast.error(
        'No se pudo conectar con el servidor. Reintentá en unos segundos.'
      )
    })
    // The API refused a request until the account has a plan: send them to the
    // plan screen instead of leaving a half-empty panel behind. Re-read the
    // tenant first — the stored copy is what the route guard trusts, and if it
    // still says "plan active" the two would bounce the user back and forth.
    setPlanRequiredHandler(() => {
      const tenantId = store.getState().auth.tenant?.id
      if (tenantId) {
        void api.getTenant(tenantId).then((res) => {
          if (res.data) store.dispatch(setTenant(res.data))
        })
      }
      if (!window.location.pathname.startsWith('/planes'))
        router.navigate('/planes')
    })
    return () => {
      setAuthErrorHandler(null)
      setConnectionErrorHandler(null)
      setPlanRequiredHandler(null)
      unsubscribe()
    }
  }, [])

  return (
    <Provider store={store}>
      <RouterProvider router={router} />
      <ToastContainer />
    </Provider>
  )
}

export default App
