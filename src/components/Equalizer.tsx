import { useEffect, useRef } from 'react'
import { engine } from '../audio/AudioEngine'
import { CATEGORY_COLORS } from '../config/constants'
import { useStore } from '../store/useStore'

const COLORS = [
  CATEGORY_COLORS.Drums,
  CATEGORY_COLORS.Perc,
  CATEGORY_COLORS.Vocals,
  CATEGORY_COLORS.Bass,
  CATEGORY_COLORS.HiHat,
  CATEGORY_COLORS.FX,
  CATEGORY_COLORS.Guitar,
]

const BAR_COUNT = 56
const GAP = 3
const SMOOTHING = 0.3
const PEAK_FALL = 0.012

/** Interpolate through COLORS at position t in [0,1], return CSS rgb string */
function getColorAt(t: number): string {
  const idx = t * (COLORS.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.min(lo + 1, COLORS.length - 1)
  const frac = idx - lo
  const a = hexToRgb(COLORS[lo])
  const b = hexToRgb(COLORS[hi])
  const r = Math.round(a.r + (b.r - a.r) * frac)
  const g = Math.round(a.g + (b.g - a.g) * frac)
  const bl = Math.round(a.b + (b.b - a.b) * frac)
  return `rgb(${r},${g},${bl})`
}

function getColorAtRgba(t: number, alpha: number): string {
  const idx = t * (COLORS.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.min(lo + 1, COLORS.length - 1)
  const frac = idx - lo
  const a = hexToRgb(COLORS[lo])
  const b = hexToRgb(COLORS[hi])
  const r = Math.round(a.r + (b.r - a.r) * frac)
  const g = Math.round(a.g + (b.g - a.g) * frac)
  const bl = Math.round(a.b + (b.b - a.b) * frac)
  return `rgba(${r},${g},${bl},${alpha})`
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

export default function Equalizer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const eqStyle = useStore(s => s.eqStyle)
  const eqStyleRef = useRef(eqStyle)

  useEffect(() => {
    eqStyleRef.current = eqStyle
  }, [eqStyle])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // ctx is guaranteed non-null from here on; alias for nested functions
    const c = ctx

    let raf = 0
    let freqData: Uint8Array<ArrayBuffer> | null = null
    const smoothed = new Float32Array(BAR_COUNT)
    const peaks = new Float32Array(BAR_COUNT)
    let rotation = 0

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      c.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const makeGradient = (w: number) => {
      const grad = c.createLinearGradient(0, 0, w, 0)
      COLORS.forEach((col, i) => grad.addColorStop(i / (COLORS.length - 1), col))
      return grad
    }

    const roundBar = (x: number, y: number, w: number, h: number, r: number) => {
      const radius = Math.min(r, w / 2, h / 2)
      c.beginPath()
      c.moveTo(x + radius, y)
      c.arcTo(x + w, y, x + w, y + h, radius)
      c.arcTo(x + w, y + h, x, y + h, radius)
      c.arcTo(x, y + h, x, y, radius)
      c.arcTo(x, y, x + w, y, radius)
      c.closePath()
      c.fill()
    }

    // ── Style 0: Tall Glow Bars (original) ──
    function drawTallGlow(_w: number, h: number, grad: CanvasGradient, barWidth: number) {
      const baseline = 4
      for (let i = 0; i < BAR_COUNT; i++) {
        const v = smoothed[i]
        const barH = Math.max(baseline, v * v * h * 0.6)
        const x = i * (barWidth + GAP)
        const y = h - barH

        c.globalAlpha = 0.15
        c.fillStyle = grad
        c.save()
        c.filter = 'blur(8px)'
        roundBar(x - 3, y - 3, barWidth + 6, barH + 6, barWidth / 2 + 3)
        c.restore()

        c.filter = 'none'
        c.globalAlpha = 0.45
        c.fillStyle = grad
        roundBar(x, y, barWidth, barH, barWidth / 2)

        if (v > peaks[i]) {
          peaks[i] = v
        } else {
          peaks[i] = Math.max(0, peaks[i] - PEAK_FALL)
        }
        const peakY = h - Math.max(baseline, peaks[i] * peaks[i] * h * 0.6) - 4
        c.globalAlpha = 0.5
        c.fillStyle = grad
        roundBar(x, peakY, barWidth, 2.5, 1.5)
      }
    }

    function drawTallGlowIdle(h: number, grad: CanvasGradient, barWidth: number) {
      const baseline = 4
      c.globalAlpha = 0.2
      c.fillStyle = grad
      for (let i = 0; i < BAR_COUNT; i++) {
        const x = i * (barWidth + GAP)
        const y = h - baseline
        roundBar(x, y, barWidth, baseline, barWidth / 2)
      }
    }

    // ── Style 1: Circular / Radial ──
    function drawCircular(w: number, h: number) {
      const cx = w / 2
      const cy = h / 2
      const scale = Math.min(w, h) / 300
      const innerR = 35 * scale
      const maxBarLen = 80 * scale

      // Bass pulse from low-freq bars
      const bassAvg = (smoothed[0] + smoothed[1] + smoothed[2] + smoothed[3]) / 4
      const bassPulse = 0.6 + 0.4 * bassAvg
      const centerR = innerR * (0.85 + 0.15 * bassPulse)

      // Center circle glow
      const grad = c.createRadialGradient(cx, cy, centerR * 0.3, cx, cy, centerR * 1.8)
      grad.addColorStop(0, 'rgba(99, 102, 241, 0.2)')
      grad.addColorStop(1, 'rgba(99, 102, 241, 0)')
      c.globalAlpha = 0.6
      c.fillStyle = grad
      c.beginPath()
      c.arc(cx, cy, centerR * 1.8, 0, Math.PI * 2)
      c.fill()

      // Center circle
      c.globalAlpha = 0.15
      c.fillStyle = 'rgba(99, 102, 241, 0.25)'
      c.beginPath()
      c.arc(cx, cy, centerR, 0, Math.PI * 2)
      c.fill()

      c.globalAlpha = 0.3
      c.strokeStyle = 'rgba(99, 102, 241, 0.5)'
      c.lineWidth = 1.5
      c.stroke()

      // Radial bars
      for (let i = 0; i < BAR_COUNT; i++) {
        const angle = (i / BAR_COUNT) * Math.PI * 2 + rotation
        const t = i / BAR_COUNT
        const color = getColorAt(t)
        const barLen = smoothed[i] * maxBarLen
        const barW = 2.5 * scale

        const x1 = cx + Math.cos(angle) * (innerR + 4 * scale)
        const y1 = cy + Math.sin(angle) * (innerR + 4 * scale)
        const x2 = cx + Math.cos(angle) * (innerR + 4 * scale + barLen)
        const y2 = cy + Math.sin(angle) * (innerR + 4 * scale + barLen)

        // Glow on tips of longer bars
        if (smoothed[i] > 0.5) {
          c.save()
          const glowR = (4 + smoothed[i] * 6) * scale
          const tipGrad = c.createRadialGradient(x2, y2, 0, x2, y2, glowR)
          tipGrad.addColorStop(0, getColorAtRgba(t, 0.3))
          tipGrad.addColorStop(1, getColorAtRgba(t, 0))
          c.fillStyle = tipGrad
          c.globalAlpha = 1
          c.beginPath()
          c.arc(x2, y2, glowR, 0, Math.PI * 2)
          c.fill()
          c.restore()
        }

        // Bar line
        c.save()
        c.strokeStyle = color
        c.lineWidth = barW
        c.lineCap = 'round'
        c.globalAlpha = 0.5
        c.beginPath()
        c.moveTo(x1, y1)
        c.lineTo(x2, y2)
        c.stroke()
        c.restore()
      }

      rotation += 0.003
    }

    function drawCircularIdle(w: number, h: number) {
      const cx = w / 2
      const cy = h / 2
      const scale = Math.min(w, h) / 300
      const innerR = 35 * scale
      const centerR = innerR * 0.85

      // Faint glow
      const grad = c.createRadialGradient(cx, cy, centerR * 0.3, cx, cy, centerR * 1.8)
      grad.addColorStop(0, 'rgba(99, 102, 241, 0.1)')
      grad.addColorStop(1, 'rgba(99, 102, 241, 0)')
      c.globalAlpha = 0.4
      c.fillStyle = grad
      c.beginPath()
      c.arc(cx, cy, centerR * 1.8, 0, Math.PI * 2)
      c.fill()

      // Static circle
      c.globalAlpha = 0.1
      c.fillStyle = 'rgba(99, 102, 241, 0.2)'
      c.beginPath()
      c.arc(cx, cy, centerR, 0, Math.PI * 2)
      c.fill()

      c.globalAlpha = 0.2
      c.strokeStyle = 'rgba(99, 102, 241, 0.3)'
      c.lineWidth = 1.5
      c.stroke()
    }

    // ── Main draw loop ──
    const draw = () => {
      raf = requestAnimationFrame(draw)

      const w = window.innerWidth
      const h = window.innerHeight
      c.clearRect(0, 0, w, h)

      const analyser = engine.getAnalyser()
      const barWidth = (w - GAP * (BAR_COUNT - 1)) / BAR_COUNT
      const grad = makeGradient(w)
      const style = eqStyleRef.current

      if (analyser) {
        const binCount = analyser.frequencyBinCount
        if (!freqData || freqData.length !== binCount) {
          freqData = new Uint8Array(new ArrayBuffer(binCount))
        }
        analyser.getByteFrequencyData(freqData)

        const usable = Math.floor(binCount * 0.7)

        for (let i = 0; i < BAR_COUNT; i++) {
          const idx = Math.floor((i / BAR_COUNT) * usable)
          const raw = freqData[idx] / 255
          smoothed[i] += (raw - smoothed[i]) * SMOOTHING
        }

        switch (style) {
          case 1:
            drawCircular(w, h)
            break
          default:
            drawTallGlow(w, h, grad, barWidth)
            break
        }
      } else {
        switch (style) {
          case 1:
            drawCircularIdle(w, h)
            break
          default:
            drawTallGlowIdle(h, grad, barWidth)
            break
        }
      }

      c.globalAlpha = 1
      c.filter = 'none'
    }

    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  )
}
