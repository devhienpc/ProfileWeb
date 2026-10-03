import { motion } from 'motion/react'
import type { Profile, Skill } from '../types/api'
import { IconUser, IconLayers } from './Icons'
import { SKILL_META } from './Icons'
import { User, Cake, Clock3, MapPin, GraduationCap, Monitor, Calendar } from 'lucide-react'
import './LeftColumn.css'
import './Skeleton.css'

/* ── Info icon map ─────────────────────────────────────────── */
const ICON_MAP: Record<string, React.ComponentType<{size?:number}>> = {
  full_name:  User,
  birthday:   Cake,
  age:        Clock3,
  location:   MapPin,
  school:     GraduationCap,
  major:      Monitor,
  year_level: Calendar,
}

/* ── Stagger variants ─────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}
const rowVariants = {
  hidden:  { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

/* ── Skeleton ────────────────────────────────────────────────── */
function LeftSkeleton() {
  return (
    <div className="left-col">
      <div className="glass-card lc-card">
        <div className="lc-card-header">
          <div className="skeleton" style={{ width: 26, height: 26, borderRadius: 6 }} />
          <div className="skeleton skeleton-text" style={{ width: 140, height: 14 }} />
        </div>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="lc-info-row" style={{ marginBottom: 8 }}>
            <div className="skeleton" style={{ width: 16, height: 16, borderRadius: 4 }} />
            <div className="skeleton skeleton-line" style={{ width: 80 }} />
            <div className="skeleton skeleton-line" style={{ width: 100 }} />
          </div>
        ))}
      </div>
      <div className="glass-card lc-card">
        <div className="lc-card-header">
          <div className="skeleton" style={{ width: 26, height: 26, borderRadius: 6 }} />
          <div className="skeleton skeleton-text" style={{ width: 120, height: 14 }} />
        </div>
        <div className="lc-skill-tags" style={{ marginBottom: 12 }}>
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="skeleton skeleton-chip" />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Component ──────────────────────────────────────────────── */
interface LeftColumnProps {
  profile: Profile | null
  skills:  Skill[]
  loading: boolean
}

export default function LeftColumn({ profile, skills, loading }: LeftColumnProps) {
  if (loading || !profile) return <LeftSkeleton />

  const infoRows: { key: keyof typeof ICON_MAP; label: string; value: string }[] = [
    { key: 'full_name',  label: 'Họ và tên',  value: profile.full_name  },
    { key: 'birthday',   label: 'Ngày sinh',  value: profile.birthday || '–' },
    { key: 'age',        label: 'Tuổi',       value: String(profile.age) },
    { key: 'location',   label: 'Quê quán',   value: profile.location   },
    { key: 'school',     label: 'Trường học', value: profile.school     },
    { key: 'major',      label: 'Ngành học',  value: profile.major      },
    { key: 'year_level', label: 'Năm học',    value: profile.year_level },
  ]

  // Group skills by category
  const languageSkills = skills.filter(s => s.category === 'language')
  const toolSkills     = skills.filter(s => s.category === 'tool')

  const skillGroups = [
    { label: 'Ngôn ngữ lập trình', symbol: '</>', skills: languageSkills },
    { label: 'Công cụ & Nền tảng', symbol: '⚙',  skills: toolSkills     },
  ]

  return (
    <div className="left-col">

      {/* Personal info */}
      <motion.div
        className="glass-card lc-card"
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="lc-card-header">
          <span className="lc-card-icon-wrap" aria-hidden="true"><IconUser size={13} /></span>
          <h2 className="lc-card-title">Thông tin cá nhân</h2>
        </div>

        <motion.dl
          className="lc-info-list"
          variants={containerVariants} initial="hidden"
          whileInView="visible" viewport={{ once: true, amount: 0.1 }}
        >
          {infoRows.map(row => {
            const LucideIcon = ICON_MAP[row.key] ?? User
            return (
              <motion.div key={row.key} className="lc-info-row" variants={rowVariants}>
                <dt className="lc-info-icon" aria-hidden="true"><LucideIcon size={13} /></dt>
                <dt className="lc-info-label">{row.label}</dt>
                <dd className="lc-info-value">{row.value}</dd>
              </motion.div>
            )
          })}
        </motion.dl>
      </motion.div>

      {/* Skills */}
      <motion.div
        className="glass-card lc-card"
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="lc-card-header">
          <span className="lc-card-icon-wrap" aria-hidden="true"><IconLayers size={13} /></span>
          <h2 className="lc-card-title">Kỹ năng &amp; Công nghệ</h2>
        </div>

        {skillGroups.map(group => (
          <div key={group.label} className="lc-skill-group">
            <p className="lc-skill-category">
              <span className="lc-skill-category-symbol" aria-hidden="true">{group.symbol}</span>
              {group.label}
            </p>
            <div className="lc-skill-tags">
              {group.skills.map(s => {
                const meta  = SKILL_META[s.name]
                const color = s.color || meta?.color || 'var(--accent)'
                const SkillIcon = meta?.icon
                return (
                  <motion.span
                    key={s.id}
                    className="skill-chip"
                    style={{ '--chip-color': color } as React.CSSProperties}
                    whileHover={{ scale: 1.08, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {SkillIcon && <SkillIcon size={12} color={color} />}
                    {s.name}
                  </motion.span>
                )
              })}
            </div>
          </div>
        ))}
      </motion.div>

    </div>
  )
}
