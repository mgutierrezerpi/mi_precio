import { useEffect } from 'react'
import { useLocation, useRouteError } from 'react-router-dom'
import { useT } from '../lib/i18n'

/** What a screen shows when it throws while rendering.
 *
 *  Without it React Router printed its developer page («Unexpected Application
 *  Error!» and a stack trace) to whoever was using the app. The error still
 *  goes to the console so it can be debugged. */
export function RouteErrorScreen() {
  const error = useRouteError()
  const { pathname } = useLocation()
  const t = useT()
  const home = pathname.startsWith('/admin') ? '/admin' : '/'

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f6f8] px-4 font-sans text-[#18181b]">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold">{t('error.route.title')}</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#52525b]">
          {t('error.route.body')}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="h-11 rounded-xl bg-[#6D28D9] px-5 text-sm font-semibold text-white"
          >
            {t('error.route.retry')}
          </button>
          <a
            href={home}
            className="flex h-11 items-center justify-center rounded-xl border border-[#e4e4e7] px-5 text-sm font-semibold"
          >
            {t('error.route.home')}
          </a>
        </div>
      </section>
    </main>
  )
}
