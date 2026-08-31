/* Mobile carousel behavior for static landing cards. */
document.querySelectorAll('[data-carousel]').forEach(setupCarousel)

function setupCarousel(root) {
  const track = root.querySelector('[data-carousel-track]')
  const dotsWrap = root.querySelector('[data-carousel-dots]')
  if (!track || !dotsWrap) return
  const cards = Array.from(track.children)
  let active = 0
  const dots = createCarouselDots(cards, dotsWrap, (index) => goTo(index))
  const paint = () => paintCarouselDots(dots, active)
  const goTo = (index) => {
    scrollToCard(track, cards[index])
    active = index
    paint()
  }
  track.addEventListener('scroll', () => {
    active = Math.max(
      0,
      Math.min(
        cards.length - 1,
        Math.round(track.scrollLeft / track.clientWidth)
      )
    )
    paint()
  })
  setupCarouselTimer(() => (active + 1) % cards.length, goTo)
}

function createCarouselDots(cards, wrapper, onSelect) {
  return cards.map((_, index) => {
    const dot = document.createElement('button')
    dot.type = 'button'
    dot.setAttribute('aria-label', `Ir a la tarjeta ${index + 1}`)
    dot.addEventListener('click', () => onSelect(index))
    wrapper.appendChild(dot)
    return dot
  })
}

function paintCarouselDots(dots, active) {
  dots.forEach((dot, index) => {
    dot.className = `h-2 rounded-full transition-all ${index === active ? 'w-6 bg-[#7C3AED]' : 'w-2 bg-[#C4B5FD]'}`
  })
}

function scrollToCard(track, card) {
  if (card) track.scrollTo({ left: card.offsetLeft, behavior: 'smooth' })
}

function setupCarouselTimer(nextIndex, goTo) {
  const media = window.matchMedia('(min-width: 768px)')
  let timer
  const start = () => {
    if (!timer && !media.matches) {
      timer = setInterval(() => goTo(nextIndex()), 3500)
    }
  }
  const stop = () => {
    if (timer) clearInterval(timer)
    timer = undefined
  }
  const sync = () => (media.matches ? stop() : start())
  sync()
  media.addEventListener('change', sync)
}
