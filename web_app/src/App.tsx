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

let lastConnectionToastAt = 0

function App() {
  useEffect(() => {
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
