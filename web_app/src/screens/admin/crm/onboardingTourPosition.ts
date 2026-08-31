import { useLayoutEffect, useState, type RefObject } from 'react'

export const TOUR_CARD_WIDTH = 400
export const TOUR_GUTTER = 16
export const TOUR_HALO = 6

export function useAnchorRect(anchor: string | undefined, index: number) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  useLayoutEffect(() => {
    if (!anchor) {
      const frame = requestAnimationFrame(() => setRect(null))
      return () => cancelAnimationFrame(frame)
    }
    const measure = () => {
      const box = document
        .querySelector<HTMLElement>(`[data-tour="${anchor}"]`)
        ?.getBoundingClientRect()
      const visible =
        box &&
        box.width > 0 &&
        box.height > 0 &&
        box.right > 0 &&
        box.bottom > 0 &&
        box.left < window.innerWidth &&
        box.top < window.innerHeight
      setRect(visible ? box : null)
    }
    const frame = requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [anchor, index])
  return rect
}

export function useCardPosition(
  cardRef: RefObject<HTMLDivElement | null>,
  rect: DOMRect | null,
  index: number
) {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  useLayoutEffect(() => {
    const place = () => {
      const card = cardRef.current
      if (!card) return
      const width = card.offsetWidth || TOUR_CARD_WIDTH
      const height = card.offsetHeight || 200
      const vw = window.innerWidth
      const vh = window.innerHeight
      if (!rect)
        return setPosition({
          top: Math.max(TOUR_GUTTER, (vh - height) / 2),
          left: Math.max(TOUR_GUTTER, (vw - width) / 2),
        })
      const fitsRight =
        rect.right + TOUR_HALO + TOUR_GUTTER + width <= vw - TOUR_GUTTER
      const left = fitsRight
        ? rect.right + TOUR_HALO + TOUR_GUTTER
        : Math.min(rect.left, vw - width - TOUR_GUTTER)
      const top = fitsRight
        ? rect.top + rect.height / 2 - height / 2
        : rect.bottom + TOUR_HALO + TOUR_GUTTER
      setPosition({
        top: clamp(
          top,
          TOUR_GUTTER,
          Math.max(TOUR_GUTTER, vh - height - TOUR_GUTTER)
        ),
        left: clamp(
          left,
          TOUR_GUTTER,
          Math.max(TOUR_GUTTER, vw - width - TOUR_GUTTER)
        ),
      })
    }
    place()
    const frame = requestAnimationFrame(place)
    window.addEventListener('resize', place)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', place)
    }
  }, [cardRef, index, rect])
  return position
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)
