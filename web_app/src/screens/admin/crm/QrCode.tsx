import { useEffect, useRef } from 'react'
import { drawQrToCanvas } from '../../../lib/qrRender'
import type { Ecc } from '../../../lib/qrcode'

interface QrCodeProps {
  value: string
  size?: number
  fg?: string
  bg?: string
  logoUrl?: string | null
  ecc?: Ecc
  className?: string
}

/** Renders a real, scannable QR code (canvas) for the given value. */
export function QrCode({ value, size = 240, fg, bg, logoUrl, ecc, className }: QrCodeProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    drawQrToCanvas(canvas, value, size, { fg, bg, logoUrl, ecc }).catch(() => {})
  }, [value, size, fg, bg, logoUrl, ecc])

  return <canvas ref={ref} className={className} aria-label={`Código QR de ${value}`} role="img" />
}

export default QrCode
