import { useEffect, useRef } from 'react'

const NOTES = ['♪', '♫', '♬', '♩', '♯', '♭']
const COLORS = ['#e07070', '#6ba3b5', '#e8b86d', '#e08a6a', '#5db8a8', '#a07ed4']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  char: string
  color: string
  size: number
  rotation: number
  rotationSpeed: number
  opacity: number
  age: number
  lifetime: number
}

export default function CursorParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)
  const lastSpawnRef = useRef<number>(0)

  // ponytail: skip on touch devices and reduced-motion — no cursor to follow, saves GPU
  const skip = typeof window !== 'undefined'
    && (window.matchMedia('(hover: none)').matches
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    if (skip) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now()
      if (now - lastSpawnRef.current < 40) return
      lastSpawnRef.current = now

      const angle = Math.random() * Math.PI * 2
      const speed = 0.5 + Math.random() * 1.5

      particlesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        vx: Math.cos(angle) * speed,
        vy: -1 - Math.random() * 1.5 + Math.sin(angle) * 0.5,
        char: NOTES[Math.floor(Math.random() * NOTES.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 12 + Math.random() * 8,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        opacity: 1,
        age: 0,
        lifetime: 1500,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)

    let lastTime = performance.now()
    const animate = (time: number) => {
      const dt = time - lastTime
      lastTime = time

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      const particles = particlesRef.current
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.age += dt
        if (p.age >= p.lifetime) {
          particles.splice(i, 1)
          continue
        }

        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed
        p.opacity = 1 - p.age / p.lifetime

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.globalAlpha = p.opacity
        ctx.font = `${p.size}px serif`
        ctx.fillStyle = p.color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(p.char, 0, 0)
        ctx.restore()
      }

      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [skip])

  if (skip) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}
