import { useEffect, useRef, useCallback } from 'react'
import './AnimatedBackground.css'

/* ─── Types ─────────────────────────────────────────────────── */
interface Star {
  x: number
  y: number
  r: number
  alpha: number
  alphaSpeed: number
  twinklePhase: number
  layer: 0 | 1 | 2       // 0=far (0.8px), 1=mid (1.5px), 2=near (2.5px)
  speed: number
  colorType: 'blue' | 'gold' | 'rose' | 'white'
}

interface Meteor {
  x: number
  y: number
  vx: number
  vy: number
  len: number
  alpha: number
  life: number
  maxLife: number
  active: boolean
  width: number
  isLarge: boolean
  flareAngle: number
}

interface Firefly {
  x: number
  y: number
  baseX: number
  r: number
  vy: number
  alpha: number
  baseAlpha: number
  blinkSpeed: number
  blinkPhase: number
  swayFreq: number
  swayAmp: number
  color: 'gold' | 'mint'
}

/* ─── Helpers ───────────────────────────────────────────────── */
function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

/* ─── Component ─────────────────────────────────────────────── */
export default function AnimatedBackground() {
  const canvasRef        = useRef<HTMLCanvasElement>(null)
  const moonRef          = useRef<HTMLDivElement>(null)
  const mouseGlowRef     = useRef<HTMLDivElement>(null)
  const nebulasRef       = useRef<HTMLDivElement>(null)
  const auroraRef        = useRef<HTMLDivElement>(null)
  const horizonRef       = useRef<HTMLDivElement>(null)
  const cloudsRef        = useRef<HTMLDivElement>(null)

  const rafRef           = useRef<number>(0)
  const mousePos         = useRef({ x: 0.5, y: 0.5, px: 0, py: 0 })
  const lerpedMouse      = useRef({ x: 0.5, y: 0.5, px: 0, py: 0 })
  const scrollYRef       = useRef(0)
  const isTouchDevice    = useRef(false)
  const isDarkTheme      = useRef(true)
  const reducedMotion    = useRef(false)
  const fpsRef           = useRef({ count: 0, lastCheck: performance.now(), currentFps: 60, lowCount: 0 })
  const lowPerfMode      = useRef(false)

  /* Check theme */
  const checkTheme = useCallback(() => {
    isDarkTheme.current = document.documentElement.getAttribute('data-theme') !== 'light'
  }, [])

  /* ─── Star Initialization (Requirement 2) ───────────────────── */
  const initStars = useCallback((width: number, height: number): Star[] => {
    const isMobile = window.innerWidth < 768
    const totalCount = isMobile ? 90 : 220

    return Array.from({ length: totalCount }, (): Star => {
      const layerRoll = Math.random()
      // ~52% layer 0 (far), ~33% layer 1 (mid), ~15% layer 2 (near)
      const layer: 0 | 1 | 2 = layerRoll < 0.52 ? 0 : layerRoll < 0.85 ? 1 : 2

      let r = 0.8
      let speed = 0.04
      if (layer === 1) {
        r = 1.5
        speed = 0.09
      } else if (layer === 2) {
        r = 2.5
        speed = 0.18
      }

      // Color variation
      const colorRoll = Math.random()
      let colorType: Star['colorType'] = 'white'
      if (layer === 2) {
        if (colorRoll < 0.35) colorType = 'blue'
        else if (colorRoll < 0.65) colorType = 'gold'
        else if (colorRoll < 0.85) colorType = 'rose'
      } else if (layer === 1) {
        if (colorRoll < 0.30) colorType = 'blue'
        else if (colorRoll < 0.50) colorType = 'gold'
      }

      return {
        x: rand(0, width),
        y: rand(0, height),
        r: rand(r * 0.85, r * 1.15),
        alpha: rand(0.3, 1.0),
        alphaSpeed: rand(0.008, 0.024),
        twinklePhase: rand(0, Math.PI * 2),
        layer,
        speed,
        colorType,
      }
    })
  }, [])

  /* ─── Meteor Initialization (Requirement 3) ─────────────────── */
  const initMeteors = useCallback((): Meteor[] => {
    const isMobile = window.innerWidth < 768
    const maxMeteors = isMobile ? 4 : 8
    return Array.from({ length: maxMeteors }, (): Meteor => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      len: 0,
      alpha: 0,
      life: 0,
      maxLife: 0,
      active: false,
      width: 0,
      isLarge: false,
      flareAngle: 0,
    }))
  }, [])

  /* ─── Fireflies / Hạt sáng bay lên (Requirement 6) ──────────── */
  const initFireflies = useCallback((width: number, height: number): Firefly[] => {
    const isMobile = window.innerWidth < 768
    let count = isMobile ? 22 : 45
    if (lowPerfMode.current) count = Math.floor(count / 2)

    return Array.from({ length: count }, (): Firefly => {
      const x = rand(0, width)
      const y = rand(height * 0.35, height + 40)
      const baseAlpha = rand(0.35, 0.85)
      return {
        x,
        y,
        baseX: x,
        r: rand(1.1, 2.7),
        vy: rand(-0.35, -0.75),
        alpha: baseAlpha,
        baseAlpha,
        blinkSpeed: rand(0.015, 0.04),
        blinkPhase: rand(0, Math.PI * 2),
        swayFreq: rand(0.001, 0.003),
        swayAmp: rand(15, 35),
        color: Math.random() < 0.65 ? 'gold' : 'mint',
      }
    })
  }, [])

  /* ─── Spawn a Meteor ────────────────────────────────────────── */
  function spawnMeteor(m: Meteor, canvasW: number, isLargeMeteor = false) {
    const angleDeg = rand(24, 38)
    const angleRad = angleDeg * (Math.PI / 180)
    const speed = isLargeMeteor ? rand(18, 26) : rand(12, 19)

    m.x = rand(canvasW * 0.05, canvasW * 0.88)
    m.y = rand(-20, window.innerHeight * 0.4)
    m.vx = Math.cos(angleRad) * speed
    m.vy = Math.sin(angleRad) * speed
    m.len = isLargeMeteor ? rand(280, 420) : rand(120, 260)
    m.maxLife = isLargeMeteor ? rand(55, 80) : rand(35, 60)
    m.life = 0
    m.alpha = 0
    m.width = isLargeMeteor ? rand(2.8, 3.8) : rand(1.3, 2.3)
    m.isLarge = isLargeMeteor
    m.flareAngle = rand(0, Math.PI)
    m.active = true
  }

  /* ─── Main Animation Loop ───────────────────────────────────── */
  useEffect(() => {
    checkTheme()

    // Motion preference
    const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion.current = motionMedia.matches
    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion.current = e.matches
    }
    motionMedia.addEventListener('change', onMotionChange)

    // Mutation observer for data-theme on html
    const themeObserver = new MutationObserver(() => {
      checkTheme()
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    const canvas = canvasRef.current
    if (!canvas) return
    const rawCtx = canvas.getContext('2d', { alpha: true })
    if (!rawCtx) return
    const ctx: CanvasRenderingContext2D = rawCtx

    let width = window.innerWidth
    let height = window.innerHeight

    function handleResize() {
      if (!canvas) return
      width = window.innerWidth
      height = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    let stars = initStars(width, height)
    let meteors = initMeteors()
    let fireflies = initFireflies(width, height)

    // Mouse tracking for parallax & mouse glow
    function onMouseMove(e: MouseEvent) {
      if (isTouchDevice.current) return
      mousePos.current.x = e.clientX / window.innerWidth
      mousePos.current.y = e.clientY / window.innerHeight
      mousePos.current.px = e.clientX
      mousePos.current.py = e.clientY
    }

    function onTouchStart() {
      isTouchDevice.current = true
      if (mouseGlowRef.current) {
        mouseGlowRef.current.style.display = 'none'
      }
    }

    function onScroll() {
      scrollYRef.current = window.scrollY || window.pageYOffset || 0
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { once: true, passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })

    // Visibility change
    let isRunning = true
    function onVisibilityChange() {
      isRunning = !document.hidden
      if (isRunning) {
        fpsRef.current.lastCheck = performance.now()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    // Meteor timers
    let nextMeteorTime = performance.now() + rand(800, 2000)
    let nextLargeMeteorTime = performance.now() + rand(10000, 15000)
    let lastTime = performance.now()

    /* ── Drawing Routine ── */
    function render(now: number) {
      rafRef.current = requestAnimationFrame(render)
      if (!isRunning) return

      const dt = Math.min(now - lastTime, 50)
      lastTime = now

      // Measure FPS for auto-degradation
      fpsRef.current.count++
      if (now - fpsRef.current.lastCheck >= 1000) {
        const measuredFps = Math.round((fpsRef.current.count * 1000) / (now - fpsRef.current.lastCheck))
        fpsRef.current.currentFps = measuredFps
        if (typeof window !== 'undefined') {
          (window as unknown as { __BACKGROUND_FPS__?: number }).__BACKGROUND_FPS__ = measuredFps
        }
        fpsRef.current.count = 0
        fpsRef.current.lastCheck = now

        if (measuredFps < 40) {
          fpsRef.current.lowCount++
          if (fpsRef.current.lowCount >= 2 && !lowPerfMode.current) {
            lowPerfMode.current = true
            fireflies.splice(Math.floor(fireflies.length / 2))
          }
        } else {
          fpsRef.current.lowCount = 0
        }
      }

      // Parallax lerping for mouse glow
      const lerpSpeed = 0.08
      lerpedMouse.current.px += (mousePos.current.px - lerpedMouse.current.px) * lerpSpeed
      lerpedMouse.current.py += (mousePos.current.py - lerpedMouse.current.py) * lerpSpeed
      lerpedMouse.current.x += (mousePos.current.x - lerpedMouse.current.x) * lerpSpeed
      lerpedMouse.current.y += (mousePos.current.y - lerpedMouse.current.y) * lerpSpeed

      // Update interactive mouse glow behind card
      if (mouseGlowRef.current && !isTouchDevice.current) {
        mouseGlowRef.current.style.transform = `translate3d(${lerpedMouse.current.px - 150}px, ${lerpedMouse.current.py - 150}px, 0)`
      }

      // Parallax on DOM layers with scroll
      const sy = scrollYRef.current
      if (moonRef.current) {
        const mx = isTouchDevice.current ? 0 : (lerpedMouse.current.x - 0.5) * 16
        const my = isTouchDevice.current ? 0 : (lerpedMouse.current.y - 0.5) * 12
        moonRef.current.style.transform = `translate3d(${mx}px, ${my + sy * 0.08}px, 0)`
      }

      if (nebulasRef.current) {
        nebulasRef.current.style.transform = `translate3d(0, ${-sy * 0.12}px, 0)`
      }
      if (auroraRef.current) {
        auroraRef.current.style.transform = `translate3d(0, ${-sy * 0.18}px, 0)`
      }
      if (cloudsRef.current) {
        cloudsRef.current.style.transform = `translate3d(0, ${-sy * 0.06}px, 0)`
      }
      if (horizonRef.current) {
        horizonRef.current.style.transform = `translate3d(0, ${sy * 0.02}px, 0)`
      }

      // Clear Canvas
      ctx.clearRect(0, 0, width, height)

      // Light mode: skip stars & meteors, or render minimal warm dust motes
      const isDark = isDarkTheme.current
      if (!isDark) {
        // Light mode is soft sunset, skip heavy night stars and meteors
        return
      }

      if (reducedMotion.current) {
        // Draw static stars once without motion
        for (const s of stars) {
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
          ctx.fillStyle = s.colorType === 'blue'
            ? 'rgba(165, 205, 255, 0.75)'
            : s.colorType === 'gold'
            ? 'rgba(254, 240, 138, 0.75)'
            : 'rgba(240, 245, 255, 0.75)'
          ctx.fill()
        }
        return
      }

      /* ── 1. RENDER STARS (3 Layers with Drift & Mouse Parallax) ── */
      const mx = isTouchDevice.current ? 0 : (lerpedMouse.current.x - 0.5)
      const my = isTouchDevice.current ? 0 : (lerpedMouse.current.y - 0.5)
      const timeScale = dt / 16.67

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]

        // Diagonal slow drift (vx ~ speed * 0.7, vy ~ speed * 0.4)
        s.x += s.speed * 0.75 * timeScale
        s.y += s.speed * 0.42 * timeScale

        // Wrap around bounds
        if (s.x > width + 10) s.x = -10
        if (s.y > height + 10) s.y = -10

        // Twinkle oscillation
        s.twinklePhase += s.alphaSpeed * timeScale
        // Opacity 0.3 -> 1.0
        const sinVal = 0.5 + 0.5 * Math.sin(s.twinklePhase)
        s.alpha = 0.3 + 0.7 * sinVal

        // Parallax offset by layer
        const pFactor = s.layer === 0 ? 5 : s.layer === 1 ? 12 : 22
        const drawX = s.x + mx * pFactor
        const drawY = s.y + my * pFactor

        // Star colors
        let fillStyle = ''
        if (s.colorType === 'blue') {
          fillStyle = `hsla(210, 85%, 82%, ${s.alpha})`
        } else if (s.colorType === 'gold') {
          fillStyle = `hsla(48, 95%, 82%, ${s.alpha})`
        } else if (s.colorType === 'rose') {
          fillStyle = `hsla(335, 80%, 86%, ${s.alpha})`
        } else {
          // White with layer nuance
          fillStyle = s.layer === 0
            ? `hsla(218, 50%, 88%, ${s.alpha * 0.85})`
            : `rgba(255, 255, 255, ${s.alpha})`
        }

        // Draw star core
        ctx.beginPath()
        ctx.arc(drawX, drawY, s.r, 0, Math.PI * 2)
        ctx.fillStyle = fillStyle
        ctx.fill()

        // Near-layer starlight glow aura (only for layer 2 and not in low perf)
        if (s.layer === 2 && s.alpha > 0.55 && !lowPerfMode.current) {
          ctx.beginPath()
          ctx.arc(drawX, drawY, s.r * 2.8, 0, Math.PI * 2)
          ctx.fillStyle = s.colorType === 'gold'
            ? `rgba(254, 240, 138, ${s.alpha * 0.16})`
            : s.colorType === 'blue'
            ? `rgba(147, 197, 253, ${s.alpha * 0.18})`
            : `rgba(255, 255, 255, ${s.alpha * 0.15})`
          ctx.fill()
        }
      }

      /* ── 2. RENDER METEORS (Regular, Bursts, Large Flare) ── */
      // Normal / Burst spawn check (0.8 - 2.0s)
      if (now >= nextMeteorTime) {
        // 20% chance to burst 2-3 meteors together
        const isBurst = Math.random() < 0.20
        const spawnCount = isBurst ? Math.floor(rand(2, 3.99)) : 1
        let spawned = 0

        for (const m of meteors) {
          if (!m.active && spawned < spawnCount) {
            spawnMeteor(m, width, false)
            spawned++
          }
        }
        nextMeteorTime = now + rand(800, 2000)
      }

      // Large Meteor spawn check (10 - 15s)
      if (now >= nextLargeMeteorTime) {
        for (const m of meteors) {
          if (!m.active) {
            spawnMeteor(m, width, true)
            break
          }
        }
        nextLargeMeteorTime = now + rand(10000, 15000)
      }

      // Update & Draw Meteors
      for (const m of meteors) {
        if (!m.active) continue

        m.life += timeScale
        const progress = m.life / m.maxLife

        // Smooth fade-in and long fade-out
        if (progress < 0.12) {
          m.alpha = progress / 0.12
        } else if (progress > 0.60) {
          m.alpha = Math.max(0, 1 - (progress - 0.60) / 0.40)
        } else {
          m.alpha = 1
        }

        const tailX = m.x - m.vx * (m.len / 14)
        const tailY = m.y - m.vy * (m.len / 14)

        // Meteor Trail Gradient (white -> blue -> transparent)
        const trailGrad = ctx.createLinearGradient(tailX, tailY, m.x, m.y)
        trailGrad.addColorStop(0, 'rgba(160, 215, 255, 0)')
        trailGrad.addColorStop(0.45, `rgba(56, 175, 255, ${m.alpha * (m.isLarge ? 0.85 : 0.65)})`)
        trailGrad.addColorStop(0.80, `rgba(215, 240, 255, ${m.alpha * 0.95})`)
        trailGrad.addColorStop(1, `rgba(255, 255, 255, ${m.alpha})`)

        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(m.x, m.y)
        ctx.strokeStyle = trailGrad
        ctx.lineWidth = m.width
        ctx.lineCap = 'round'
        ctx.stroke()

        // Meteor Head Glow
        const headRadius = m.width * (m.isLarge ? 4.8 : 3.4)
        const headGlow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, headRadius)
        headGlow.addColorStop(0, `rgba(255, 255, 255, ${m.alpha})`)
        headGlow.addColorStop(0.35, `rgba(190, 230, 255, ${m.alpha * 0.85})`)
        headGlow.addColorStop(1, 'rgba(30, 140, 255, 0)')

        ctx.beginPath()
        ctx.arc(m.x, m.y, headRadius, 0, Math.PI * 2)
        ctx.fillStyle = headGlow
        ctx.fill()

        // 4-point Flare Star on Large Meteors
        if (m.isLarge && m.alpha > 0.3) {
          const flareLen = m.width * 6.0
          ctx.save()
          ctx.translate(m.x, m.y)
          ctx.rotate(m.flareAngle)
          ctx.strokeStyle = `rgba(255, 255, 255, ${m.alpha * 0.95})`
          ctx.lineWidth = 1.4
          ctx.beginPath()
          ctx.moveTo(-flareLen, 0)
          ctx.lineTo(flareLen, 0)
          ctx.moveTo(0, -flareLen)
          ctx.lineTo(0, flareLen)
          ctx.stroke()
          // diagonal mini flare
          ctx.rotate(Math.PI / 4)
          ctx.strokeStyle = `rgba(180, 225, 255, ${m.alpha * 0.65})`
          ctx.lineWidth = 1.0
          ctx.beginPath()
          ctx.moveTo(-flareLen * 0.55, 0)
          ctx.lineTo(flareLen * 0.55, 0)
          ctx.moveTo(0, -flareLen * 0.55)
          ctx.lineTo(0, flareLen * 0.55)
          ctx.stroke()
          ctx.restore()
        }

        // Step meteor position
        m.x += m.vx * timeScale
        m.y += m.vy * timeScale

        if (m.life >= m.maxLife || m.y > height + 80 || m.x > width + 100) {
          m.active = false
        }
      }

      /* ── 3. RENDER FIREFLIES / HẠT SÁNG BAY LÊN (Requirement 6) ── */
      const timeMs = now
      for (let i = 0; i < fireflies.length; i++) {
        const f = fireflies[i]

        // Upward movement with sway
        f.y += f.vy * timeScale
        f.x = f.baseX + Math.sin(timeMs * f.swayFreq + f.blinkPhase) * f.swayAmp

        // Pulsing twinkle
        f.blinkPhase += f.blinkSpeed * timeScale
        const pulse = 0.5 + 0.5 * Math.sin(f.blinkPhase)

        // Fade out smoothly towards the top (y < height * 0.38)
        let heightFade = 1.0
        const fadeThreshold = height * 0.38
        if (f.y < fadeThreshold) {
          heightFade = Math.max(0, f.y / fadeThreshold)
        }

        const renderAlpha = f.baseAlpha * pulse * heightFade

        // Respawn at bottom if passed top
        if (f.y < -15 || heightFade <= 0.02) {
          f.y = height + rand(15, 60)
          f.baseX = rand(0, width)
          f.x = f.baseX
          f.baseAlpha = rand(0.35, 0.85)
        }

        if (renderAlpha > 0.05) {
          const colorCore = f.color === 'gold'
            ? `rgba(255, 225, 120, ${renderAlpha})`
            : `rgba(130, 245, 220, ${renderAlpha})`

          const colorGlow = f.color === 'gold'
            ? `rgba(255, 195, 60, ${renderAlpha * 0.25})`
            : `rgba(80, 230, 200, ${renderAlpha * 0.25})`

          // Glow aura
          ctx.beginPath()
          ctx.arc(f.x, f.y, f.r * 2.2, 0, Math.PI * 2)
          ctx.fillStyle = colorGlow
          ctx.fill()

          // Core dot
          ctx.beginPath()
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
          ctx.fillStyle = colorCore
          ctx.fill()
        }
      }
    }

    rafRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      motionMedia.removeEventListener('change', onMotionChange)
      themeObserver.disconnect()
    }
  }, [checkTheme, initStars, initMeteors, initFireflies])

  return (
    <div className="ab-root" aria-hidden="true">
      {/* ── Layer 1: Sky Gradient ── */}
      <div className="ab-gradient" />

      {/* ── Layer 2: 4 Nebulas (Tinh vân) ── */}
      <div ref={nebulasRef} className="ab-nebulas">
        <div className="ab-nebula ab-nebula--purple" />
        <div className="ab-nebula ab-nebula--blue" />
        <div className="ab-nebula ab-nebula--pink" />
        <div className="ab-nebula ab-nebula--indigo" />
      </div>

      {/* ── Layer 3: Aurora Ribbons (Dải cực quang mềm) ── */}
      <div ref={auroraRef} className="ab-aurora-wrap">
        <div className="ab-aurora ab-aurora--1" />
        <div className="ab-aurora ab-aurora--2" />
      </div>

      {/* ── Layer 4: Moon with 3-Layer Glow (Mặt trăng) ── */}
      <div ref={moonRef} className="ab-moon-wrap">
        {/* Glow Layer 3: Faint ray halo */}
        <div className="ab-moon-glow ab-moon-glow--rays" />
        {/* Glow Layer 2: Outer wide ambient glow */}
        <div className="ab-moon-glow ab-moon-glow--outer" />
        {/* Glow Layer 1: Inner intense moonlight */}
        <div className="ab-moon-glow ab-moon-glow--inner" />

        {/* Realistic Moon Disc */}
        <div className="ab-moon">
          {/* Maria (dark patches) */}
          <div className="ab-moon-mare ab-moon-mare--1" />
          <div className="ab-moon-mare ab-moon-mare--2" />
          {/* Craters */}
          <div className="ab-crater ab-crater--1" />
          <div className="ab-crater ab-crater--2" />
          <div className="ab-crater ab-crater--3" />
          <div className="ab-crater ab-crater--4" />
          <div className="ab-crater ab-crater--5" />
          {/* Rim light highlight */}
          <div className="ab-moon-highlight" />
        </div>
      </div>

      {/* ── Layer 5: Night Clouds (Mây đêm trôi ngang) ── */}
      <div ref={cloudsRef} className="ab-clouds-wrap">
        {/* Cloud 1 & 2 glide right across the moon altitude with illuminated rim */}
        <div className="ab-cloud ab-cloud--moon1" />
        <div className="ab-cloud ab-cloud--moon2" />
        <div className="ab-cloud ab-cloud--mid1" />
        <div className="ab-cloud ab-cloud--mid2" />
        <div className="ab-cloud ab-cloud--low" />
      </div>

      {/* ── Layer 6: Unified Canvas (Stars + Meteors + Fireflies) ── */}
      <canvas ref={canvasRef} className="ab-canvas" />

      {/* ── Layer 7: Mouse Glow behind cards (Vầng sáng theo con trỏ) ── */}
      <div ref={mouseGlowRef} className="ab-mouse-glow" />

      {/* ── Layer 8: Horizon & Mountain Skyline (Đường chân trời) ── */}
      <div ref={horizonRef} className="ab-horizon">
        <svg
          className="ab-horizon-svg"
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Far mountain ridge */}
          <path
            d="M0 160 Q 180 90, 360 140 T 720 100 T 1080 135 T 1440 115 L 1440 220 L 0 220 Z"
            fill="var(--ab-mountain-far, #070e22)"
            opacity="0.85"
          />
          {/* Near mountain ridge & city silhouettes */}
          <path
            d="M0 180 Q 140 135, 290 165 T 580 130 T 920 155 T 1200 135 T 1440 150 L 1440 220 L 0 220 Z"
            fill="var(--ab-mountain-near, #040816)"
          />

          {/* Distant city / beacon twinkling lights */}
          <circle cx="360" cy="140" r="1.8" className="ab-beacon ab-beacon--gold" />
          <circle cx="370" cy="142" r="1.2" className="ab-beacon ab-beacon--amber" />
          <circle cx="580" cy="130" r="2.0" className="ab-beacon ab-beacon--red" />
          <circle cx="720" cy="100" r="1.5" className="ab-beacon ab-beacon--gold2" />
          <circle cx="860" cy="148" r="1.4" className="ab-beacon ab-beacon--gold" />
          <circle cx="1080" cy="136" r="1.8" className="ab-beacon ab-beacon--amber2" />
          <circle cx="1200" cy="136" r="1.5" className="ab-beacon ab-beacon--red" />
        </svg>

        {/* Soft fog / mist gradient at the horizon */}
        <div className="ab-horizon-mist" />
      </div>
    </div>
  )
}
