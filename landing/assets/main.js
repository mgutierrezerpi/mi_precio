// Static landing interactivity — mirrors the behaviour of the in-app React HomeScreen
// (mobile nav, FAQ accordion, scroll reveal, auto-advancing mobile carousels).

/* ── Mobile nav ─────────────────────────────────────────────── */
;(function mobileNav() {
  const toggle = document.querySelector('[data-nav-toggle]')
  const menu = document.querySelector('[data-nav-menu]')
  const iconOpen = document.querySelector('[data-nav-icon-open]')
  const iconClose = document.querySelector('[data-nav-icon-close]')
  if (!toggle || !menu) return

  const setOpen = (open) => {
    menu.classList.toggle('hidden', !open)
    iconOpen?.classList.toggle('hidden', open)
    iconClose?.classList.toggle('hidden', !open)
    toggle.setAttribute('aria-expanded', String(open))
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú')
    document.body.style.overflow = open ? 'hidden' : ''
  }

  toggle.addEventListener('click', () =>
    setOpen(menu.classList.contains('hidden'))
  )
  document
    .querySelectorAll('[data-nav-close]')
    .forEach((el) => el.addEventListener('click', () => setOpen(false)))
  window.addEventListener(
    'keydown',
    (e) => e.key === 'Escape' && setOpen(false)
  )
  // Close once the viewport grows to the desktop layout.
  const mql = window.matchMedia('(min-width: 1024px)')
  mql.addEventListener('change', (e) => e.matches && setOpen(false))
})()

/* ── FAQ accordion ──────────────────────────────────────────── */
;(function faq() {
  const items = document.querySelectorAll('[data-faq]')
  items.forEach((item) => {
    const btn = item.querySelector('[data-faq-btn]')
    const panel = item.querySelector('[data-faq-panel]')
    const icon = item.querySelector('[data-faq-icon]')
    if (!btn || !panel) return
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true'
      // Single-open accordion, matching the React useState(open) behaviour.
      items.forEach((other) => {
        if (other === item) return
        other
          .querySelector('[data-faq-btn]')
          ?.setAttribute('aria-expanded', 'false')
        const op = other.querySelector('[data-faq-panel]')
        op?.classList.remove('mt-3', 'grid-rows-[1fr]', 'opacity-100')
        op?.classList.add('grid-rows-[0fr]', 'opacity-0')
        other.querySelector('[data-faq-icon]')?.classList.remove('rotate-45')
      })
      btn.setAttribute('aria-expanded', String(!isOpen))
      panel.classList.toggle('mt-3', !isOpen)
      panel.classList.toggle('grid-rows-[1fr]', !isOpen)
      panel.classList.toggle('opacity-100', !isOpen)
      panel.classList.toggle('grid-rows-[0fr]', isOpen)
      panel.classList.toggle('opacity-0', isOpen)
      icon?.classList.toggle('rotate-45', !isOpen)
    })
  })
})()

/* ── Scroll reveal ──────────────────────────────────────────── */
;(function reveal() {
  const els = document.querySelectorAll('[data-reveal]')
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('revealed'))
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
          io.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  )
  els.forEach((el) => io.observe(el))
})()

/* ── Back to top ────────────────────────────────────────────── */
;(function backToTop() {
  const btn = document.querySelector('[data-to-top]')
  if (!btn) return
  const onScroll = () =>
    btn.classList.toggle('is-visible', window.scrollY > 400)
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  btn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  )
})()
