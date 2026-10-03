import { useEffect, useRef, useCallback } from 'react'
import './AnimatedBackground.css'

/* ─── Types ─────────────────────────────────────────────────── */
interface Star {
  x: number; y: number
  r: number
  alpha: number
  alphaSpeed: number
  twinklePhase: number
  layer: 0 | 1 | 2   // 0=far/small, 1=mid, 2=near/big
  hue: number         // slight color variation
}

interface Meteor {
  x: number; y: number
  vx: number; vy: number
  len: number
  alpha: number; life: number; maxLife: number
  active: boolean
  width: number
  angleOffset: number
}

interface Particle {
  x: number; y: number; baseX: number; baseY: number
  r: number
  vx: number; vy: number
  alpha: number
  parallaxStrength: number
}

/* ─── Helpers ───────────────────────────────────────────────── */
function rand(min: number, max: number) { return Math.random() * (max - min) + min }

/* ─── Component ─────────────────────────────────────────────── */
export default function AnimatedBackground() {
  const starsCanvasRef  = useRef<HTMLCanvasElement>(null)
  const floatCanvasRef  = useRef<HTMLCanvasElement>(null)
  const moonRef         = useRef<HTMLDivElement>(null)
  const rafRef          = useRef<number>(0)
  const mouseRef        = useRef({ x: 0.5, y: 0.5 })
  const isTouchDevice   = useRef(false)
  const reducedMotion   = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  function isDark() {
    return document.documentElement.getAttribute('data-theme') !== 'light'
  }

  /* ─── Star color by layer & hue ─────────────────────────────── */
  function starColor(alpha: number, layer: number, hue: number) {
    if (!isDark()) return `rgba(30,80,180,${alpha * 0.7})`
    // layer 0 = far, blue-white; layer 1 = mid, slight warm; layer 2 = near, slightly yellow/blue
    if (layer === 0) return `hsla(${210 + hue},70%,85%,${alpha * 0.6})`
    if (layer === 1) return `hsla(${200 + hue},80%,90%,${alpha * 0.8})`
    return `hsla(${180 + hue},60%,95%,${alpha})`
  }

  /* ─── Init 3-layer stars ──────────────────────────────────── */
  const initStars = useCallback((canvas: HTMLCanvasElement): Star[] => {
    const isMobile = window.innerWidth < 768
    // layer 0: 60% (far, tiny), layer 1: 30% (mid), layer 2: 10% (near, larger)
    const totalCount = isMobile ? 120 : 300
    return Array.from({ length: totalCount }, (_, i): Star => {
      const layerRoll = Math.random()
      const layer: 0 | 1 | 2 = layerRoll < 0.6 ? 0 : layerRoll < 0.9 ? 1 : 2
      const rMin = layer === 0 ? 0.25 : layer === 1 ? 0.5 : 1.0
      const rMax = layer === 0 ? 0.7  : layer === 1 ? 1.2 : 2.2
      return {
        x: rand(0, canvas.width),
        y: rand(0, canvas.height),
        r: rand(rMin, rMax),
        alpha: rand(layer === 0 ? 0.15 : 0.3, layer === 0 ? 0.55 : 1.0),
        alphaSpeed: rand(layer === 0 ? 0.002 : 0.004, layer === 0 ? 0.006 : 0.015),
        twinklePhase: rand(0, Math.PI * 2),
        layer,
        hue: rand(-20, 40),
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      void i
    })
  }, [])

  /* ─── Init meteors (max 8 desktop, 4 mobile) ─────────────── */
  const initMeteors = useCallback((): Meteor[] => {
    const isMobile = window.innerWidth < 768
    return Array.from({ length: isMobile ? 4 : 8 }, (): Meteor => ({
      x: 0, y: 0, vx: 0, vy: 0, len: 0,
      alpha: 0, life: 0, maxLife: 0, active: false,
      width: 0, angleOffset: 0,
    }))
  }, [])

  /* ─── Init particles ────────────────────────────────────────── */
  const initParticles = useCallback((canvas: HTMLCanvasElement): Particle[] => {
    const isMobile = window.innerWidth < 768
    const count = isMobile ? 20 : 45
    return Array.from({ length: count }, (): Particle => {
      const x = rand(0, canvas.width)
      const y = rand(0, canvas.height)
      return {
        x, y, baseX: x, baseY: y,
        r: rand(0.8, 2.0),
        vx: rand(-0.06, 0.06),
        vy: rand(-0.22, -0.06),
        alpha: rand(0.1, 0.45),
        parallaxStrength: rand(0.008, 0.035),
      }
    })
  }, [])

  /* ─── Spawn meteor ──────────────────────────────────────────── */
  function spawnMeteor(m: Meteor, canvasW: number) {
    const angleBase = rand(22, 48)
    m.angleOffset = rand(-5, 5)
    const angle = (angleBase + m.angleOffset) * (Math.PI / 180)
    const speed = rand(10, 20)
    m.x = rand(canvasW * 0.05, canvasW * 0.85)
    m.y = rand(-20, 80)
    m.vx = Math.cos(angle) * speed
    m.vy = Math.sin(angle) * speed
    m.len = rand(100, 250)
    m.maxLife = rand(35, 75)
    m.life = 0
    m.alpha = 0
    m.width = rand(1.0, 2.5)
    m.active = true
  }

  /* ─── Moon parallax ──────────────────────────────────────────── */
  function updateMoonParallax(mx: number, my: number) {
    const moon = moonRef.current
    if (!moon || isTouchDevice.current) return
    const dx = (mx - 0.5) * 12   // ±6px
    const dy = (my - 0.5) * 8    // ±4px
    moon.style.transform = `translate(${dx}px, ${dy}px)`
  }

  /* ─── Main RAF loop ─────────────────────────────────────────── */
  useEffect(() => {
    const starsCanvas = starsCanvasRef.current
    const floatCanvas = floatCanvasRef.current
    if (!starsCanvas || !floatCanvas) return

    const sCtx = starsCanvas.getContext('2d')!
    const fCtx = floatCanvas.getContext('2d')!

    function resize() {
      starsCanvas!.width  = window.innerWidth
      starsCanvas!.height = window.innerHeight
      floatCanvas!.width  = window.innerWidth
      floatCanvas!.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let stars:     Star[]     = initStars(starsCanvas)
    let meteors:   Meteor[]   = initMeteors()
    let particles: Particle[] = initParticles(floatCanvas)

    const resizeObs = new ResizeObserver(() => {
      resize()
      stars     = initStars(starsCanvas)
      meteors   = initMeteors()
      particles = initParticles(floatCanvas)
    })
    resizeObs.observe(document.documentElement)

    let running = true
    function onVisibility() { running = !document.hidden }
    document.addEventListener('visibilitychange', onVisibility)

    function onMouseMove(e: MouseEvent) {
      if (isTouchDevice.current) return
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
      updateMoonParallax(mouseRef.current.x, mouseRef.current.y)
    }
    function onTouchStart() { isTouchDevice.current = true }
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { once: true, passive: true })

    /* meteor schedule: 0.8-2.5s interval */
    let nextMeteorTime = performance.now() + rand(800, 2500)
    let lastTime = performance.now()

    /* ── draw loop ── */
    function draw(now: number) {
      rafRef.current = requestAnimationFrame(draw)
      if (!running) return

      const dt = Math.min(now - lastTime, 50)
      lastTime = now

      /* ── STARS CANVAS ── */
      const W = starsCanvas!.width
      const H = starsCanvas!.height
      sCtx.clearRect(0, 0, W, H)

      /* milky way: subtle diagonal gradient band */
      if (isDark()) {
        const mwGrad = sCtx.createLinearGradient(W * 0.1, 0, W * 0.9, H)
        mwGrad.addColorStop(0,    'rgba(120,140,200,0.00)')
        mwGrad.addColorStop(0.3,  'rgba(140,160,220,0.03)')
        mwGrad.addColorStop(0.5,  'rgba(160,180,240,0.05)')
        mwGrad.addColorStop(0.7,  'rgba(140,160,220,0.03)')
        mwGrad.addColorStop(1.0,  'rgba(120,140,200,0.00)')
        sCtx.fillStyle = mwGrad
        sCtx.fillRect(0, 0, W, H)
      }

      /* animate stars — draw far layers first, near last */
      for (const s of stars) {
        s.twinklePhase += s.alphaSpeed
        const base = s.layer === 0 ? 0.15 : s.layer === 1 ? 0.3 : 0.4
        const amp  = s.layer === 0 ? 0.35 : s.layer === 1 ? 0.5 : 0.55
        s.alpha = base + amp * (0.5 + 0.5 * Math.sin(s.twinklePhase))

        sCtx.beginPath()
        sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        sCtx.fillStyle = starColor(s.alpha, s.layer, s.hue)
        sCtx.fill()

        /* glow for near-layer stars */
        if (s.layer === 2 && s.alpha > 0.6) {
          sCtx.beginPath()
          sCtx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2)
          sCtx.fillStyle = starColor(s.alpha * 0.15, s.layer, s.hue)
          sCtx.fill()
        }
      }

      /* meteors */
      if (!reducedMotion.current) {
        /* spawn: every 0.8-2.5s; 15% chance burst 2-3 together */
        if (now >= nextMeteorTime) {
          const burst = Math.random() < 0.15 ? Math.floor(rand(2, 4)) : 1
          let spawned = 0
          for (const m of meteors) {
            if (!m.active && spawned < burst) {
              spawnMeteor(m, W)
              spawned++
            }
          }
          nextMeteorTime = now + rand(800, 2500)
        }

        for (const m of meteors) {
          if (!m.active) continue
          m.life++
          const progress = m.life / m.maxLife
          m.alpha = progress < 0.15
            ? progress / 0.15
            : progress > 0.65 ? 1 - (progress - 0.65) / 0.35 : 1

          const tailX = m.x - m.vx * (m.len / 12)
          const tailY = m.y - m.vy * (m.len / 12)

          /* glow head */
          const headGlow = sCtx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.width * 3)
          headGlow.addColorStop(0, `rgba(255,255,255,${m.alpha * 0.95})`)
          headGlow.addColorStop(1, `rgba(180,210,255,0)`)
          sCtx.beginPath()
          sCtx.arc(m.x, m.y, m.width * 3, 0, Math.PI * 2)
          sCtx.fillStyle = headGlow
          sCtx.fill()

          /* tail gradient */
          const grad = sCtx.createLinearGradient(tailX, tailY, m.x, m.y)
          grad.addColorStop(0, `rgba(200,220,255,0)`)
          grad.addColorStop(0.6, `rgba(220,235,255,${m.alpha * 0.5})`)
          grad.addColorStop(1, `rgba(255,255,255,${m.alpha * 0.9})`)

          sCtx.beginPath()
          sCtx.moveTo(tailX, tailY)
          sCtx.lineTo(m.x, m.y)
          sCtx.strokeStyle = grad
          sCtx.lineWidth = m.width
          sCtx.lineCap = 'round'
          sCtx.stroke()

          m.x += m.vx * (dt / 16)
          m.y += m.vy * (dt / 16)
          if (m.life >= m.maxLife || m.y > H + 50) m.active = false
        }
      }

      /* ── FLOAT CANVAS ── */
      const FW = floatCanvas!.width
      const FH = floatCanvas!.height
      fCtx.clearRect(0, 0, FW, FH)

      if (!reducedMotion.current) {
        const mx = mouseRef.current.x - 0.5
        const my = mouseRef.current.y - 0.5

        for (const p of particles) {
          p.baseY += p.vy * (dt / 16)
          p.baseX += p.vx * (dt / 16)
          if (p.baseY < -4)    { p.baseY = FH + 4; p.baseX = rand(0, FW) }
          if (p.baseX < -4)    p.baseX = FW + 4
          if (p.baseX > FW+4)  p.baseX = -4

          const px = isTouchDevice.current ? p.baseX : p.baseX + mx * FW * p.parallaxStrength * 20
          const py = isTouchDevice.current ? p.baseY : p.baseY + my * FH * p.parallaxStrength * 20

          const particleColor = isDark()
            ? `rgba(100,180,255,${p.alpha})`
            : `rgba(30,90,200,${p.alpha * 0.5})`

          fCtx.beginPath()
          fCtx.arc(px, py, p.r, 0, Math.PI * 2)
          fCtx.fillStyle = particleColor
          fCtx.fill()
        }
      }
    }

    if (!reducedMotion.current) {
      rafRef.current = requestAnimationFrame(draw)
    } else {
      /* static: draw stars + moon visible once */
      resize()
      sCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height)
      for (const s of stars) {
        sCtx.beginPath()
        sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        sCtx.fillStyle = starColor(s.alpha, s.layer, s.hue)
        sCtx.fill()
      }
    }

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('visibilitychange', onVisibility)
      resizeObs.disconnect()
    }
  }, [initStars, initMeteors, initParticles])

  return (
    <div className="ab-root" aria-hidden="true">
      {/* Layer 1: gradient sky */}
      <div className="ab-gradient" />

      {/* Layer 2: aurora blobs */}
      <div className="ab-blobs">
        <div className="ab-blob ab-blob--blue" />
        <div className="ab-blob ab-blob--amber" />
        <div className="ab-blob ab-blob--violet" />
      </div>

      {/* Layer 3: Milky way + stars + meteors canvas */}
      <canvas ref={starsCanvasRef} className="ab-canvas ab-canvas--stars" />

      {/* Layer 4: Moon with craters, glow, breathing, clouds */}
      <div ref={moonRef} className="ab-moon-wrap">
        <div className="ab-moon-glow ab-moon-glow--outer" />
        <div className="ab-moon-glow ab-moon-glow--mid" />
        <div className="ab-moon-glow ab-moon-glow--inner" />
        <div className="ab-moon">
          {/* Craters */}
          <div className="ab-crater ab-crater--1" />
          <div className="ab-crater ab-crater--2" />
          <div className="ab-crater ab-crater--3" />
          <div className="ab-crater ab-crater--4" />
          <div className="ab-crater ab-crater--5" />
          {/* Highlight */}
          <div className="ab-moon-highlight" />
        </div>
        {/* Clouds floating across moon */}
        <div className="ab-cloud ab-cloud--1" />
        <div className="ab-cloud ab-cloud--2" />
        <div className="ab-cloud ab-cloud--3" />
      </div>

      {/* Layer 5: floating particles */}
      <canvas ref={floatCanvasRef} className="ab-canvas ab-canvas--float" />
    </div>
  )
}
