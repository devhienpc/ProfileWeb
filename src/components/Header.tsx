import { useState, useEffect } from 'react'
import { motion } from 'motion/react'

type Theme = 'dark' | 'light'

export default function Header() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('portfolio-theme') as Theme | null
    return saved ?? 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('portfolio-theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        height: '3.5rem',
        background: 'rgba(11, 17, 32, 0.80)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Logo + name */}
      <a
        href="/"
        aria-label="Trang chủ"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '1.125rem',
            color: 'var(--accent)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            padding: '0.25rem 0.5rem',
            border: '1.5px solid var(--accent-border)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-dim)',
          }}
        >
          {'</>'}
        </span>
        <span
          style={{
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          Trương Văn Hiền
        </span>
      </a>

      {/* Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <a
          href="/admin.html"
          title="Admin Panel"
          aria-label="Trang quản trị"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.25rem',
            height: '2.25rem',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border-subtle)',
            background: 'rgba(255, 255, 255, 0.04)',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--accent)'
            e.currentTarget.style.borderColor = 'var(--accent-border)'
            e.currentTarget.style.background = 'var(--accent-dim)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-muted)'
            e.currentTarget.style.borderColor = 'var(--border-subtle)'
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
          }}
        >
          ⚙️
        </a>

        {/* Theme toggle */}
        <button
          id="theme-toggle"
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.25rem',
            height: '2.25rem',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border-accent)',
            background: 'var(--accent-dim)',
            color: 'var(--accent)',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'background 0.2s, transform 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-glow)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent-dim)')}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </motion.header>
  )
}
