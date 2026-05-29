import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { store } from './store'
import { router } from './routes'
import { setAuthErrorHandler } from './services/api'
import { logout } from './store/slices/authSlice'
import { ToastContainer, toast } from './components/Toast'

function App() {
  useEffect(() => {
    setAuthErrorHandler(() => {
      store.dispatch(logout())
      router.navigate('/')
      toast.warning('Tu sesión ha expirado')
    })
    return () => setAuthErrorHandler(null)
  }, [])

  return (
    <Provider store={store}>
      <RouterProvider router={router} />
      <ToastContainer />
    </Provider>
  )
}

export default App
