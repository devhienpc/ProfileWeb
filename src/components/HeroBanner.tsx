import { useState } from 'react'
import { motion } from 'motion/react'
import type { Profile, Social } from '../types/api'
import { useTypewriter } from '../hooks/useTypewriter'
import { normalizeImageUrl } from '../utils/image'
import { IconDownload, IconMapPin, IconGraduationCap, IconCalendar } from './Icons'
import { FaGithub, FaLinkedin, FaFacebook } from 'react-icons/fa6'
import { Mail } from 'lucide-react'
import { IconZalo } from './Icons'
import './HeroBanner.css'
import './Skeleton.css'

/* ── Social icon + tooltip ──────────────────────────────────── */
const SOCIAL_META: Record<string, {
  icon:  React.ComponentType<{ size?: number }>
  color: string
  label: string
}> = {
  github:   { icon: FaGithub,   color: '#e6edf3', label: 'GitHub'   },
  linkedin: { icon: FaLinkedin, color: '#0A66C2', label: 'LinkedIn' },
  facebook: { icon: FaFacebook, color: '#1877F2', label: 'Facebook' },
  email:    { icon: Mail,       color: '#EA4335', label: 'Email'    },
  zalo:     { icon: (p: { size?: number }) => <IconZalo size={p.size} color="#0190F3" />, color: '#0190F3', label: 'Zalo' },
}

/* ── Skeleton ─────────────────────────────────────────────── */
function HeroSkeleton() {
  return (
    <div className="hero glass-card" style={{ gap: '1.5rem', alignItems: 'center' }}>
      <div className="skeleton skeleton-avatar" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-badge" />
        <div className="skeleton skeleton-line" style={{ width: '70%' }} />
        <div className="skeleton skeleton-line-sm" style={{ width: '55%' }} />
      </div>
    </div>
  )
}

/* ── Component ────────────────────────────────────────────── */
interface HeroBannerProps {
  profile: Profile | null
  socials: Social[]
  loading: boolean
}

export default function HeroBanner({ profile, socials, loading }: HeroBannerProps) {
  const [avatarError, setAvatarError] = useState(false)
  const name = profile?.full_name ?? ''
  const displayedName = useTypewriter(name, 60, loading ? 99999 : 400)

  if (loading || !profile) return <HeroSkeleton />

  const initials = name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()
  const avatarSrc = normalizeImageUrl(profile.avatar_url)
  const showAvatar = Boolean(avatarSrc && !avatarError)

  return (
    <motion.div
      className="hero glass-card"
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="hero-glow-overlay" aria-hidden="true" />

      {/* Avatar */}
      <div className="hero-avatar-wrap" aria-hidden="true">
        <div className="hero-avatar-ring" />
        <div className="hero-avatar">
          {showAvatar ? (
            <img
              src={avatarSrc}
              alt={profile.full_name}
              referrerPolicy="no-referrer"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <span className="hero-avatar-initials">{initials}</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="hero-info">
        <h1 className="hero-name">
          {displayedName}
          <span className="hero-name-cursor" aria-hidden="true">|</span>
        </h1>
        <p className="hero-name-en">{profile.display_name}</p>
        <span className="hero-badge">{profile.badge}</span>

        <div className="hero-meta-row">
          <span className="hero-meta-item">
            <IconMapPin size={13} />{profile.location}
          </span>
          <span className="hero-meta-item">
            <IconCalendar size={13} />{profile.age} tuổi
          </span>
          <span className="hero-meta-item">
            <IconGraduationCap size={13} />{profile.school}
          </span>
        </div>

        <blockquote className="hero-quote">"{profile.quote}"</blockquote>
      </div>

      {/* Actions */}
      <div className="hero-actions">
        {profile.cv_url && profile.cv_url !== '#' && (
          <a href={profile.cv_url} className="btn-shine" id="hero-download-cv" download>
            <IconDownload size={15} />
            Tải CV
          </a>
        )}

        {/* Social icons with tooltip */}
        <div className="hero-socials">
          {socials.map(s => {
            const meta = SOCIAL_META[s.platform]
            if (!meta) return null
            const SocialIcon = meta.icon
            return (
              <a
                key={s.id}
                href={s.url}
                className="social-btn"
                aria-label={meta.label}
                target="_blank"
                rel="noopener noreferrer"
                style={{ '--social-color': meta.color } as React.CSSProperties}
                title={meta.label}
              >
                <SocialIcon size={17} />
              </a>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
