import { motion } from 'motion/react'
import type { Project } from '../types/api'
import { IconArrowRight, IconFolderOpen } from './Icons'
import { SKILL_META } from './Icons'
import { BookOpen, Building2, Send, Globe, Code2, Zap, ExternalLink } from 'lucide-react'
import './CenterColumn.css'
import './Skeleton.css'

/* ── Project icon by key ─────────────────────────────────── */
const PROJECT_ICONS: Record<string, React.ComponentType<{size?:number;color?:string}>> = {
  manga:     BookOpen,
  room:      Building2,
  telegram:  Send,
  portfolio: Globe,
  cpp:       Code2,
}
const PROJECT_BG: Record<string, string> = {
  manga:     '#1a3a5c',
  room:      '#1a4020',
  telegram:  '#1a2a5c',
  portfolio: '#2a1a5c',
  cpp:       '#3a1a1a',
}
const PROJECT_COLOR: Record<string, string> = {
  manga:     '#59b3ff',
  room:      '#5ecf88',
  telegram:  '#26A5E4',
  portfolio: '#c586ff',
  cpp:       '#ff7a4d',
}

const cardVariants = {
  hidden:  { opacity: 0, y: 22 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.42, delay: i * 0.08, ease: 'easeOut' as const },
  }),
}

/* ── Skeleton ────────────────────────────────────────────── */
function CenterSkeleton() {
  return (
    <div className="glass-card cc-card">
      <div className="cc-header">
        <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 6 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton skeleton-text" style={{ width: 120, height: 14, marginBottom: 6 }} />
          <div className="skeleton skeleton-line-sm" style={{ width: '80%' }} />
        </div>
      </div>
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="cc-project" style={{ opacity: 1 - i * 0.2 }}>
          <div className="skeleton skeleton-icon" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="skeleton skeleton-line" style={{ width: '85%' }} />
            <div className="skeleton skeleton-line-sm" style={{ width: '65%' }} />
            <div style={{ display: 'flex', gap: 6 }}>
              {[50, 60, 40].map((w, j) => (
                <div key={j} className="skeleton skeleton-chip" style={{ width: w }} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Component ──────────────────────────────────────────── */
interface CenterColumnProps {
  projects: Project[]
  loading:  boolean
}

export default function CenterColumn({ projects, loading }: CenterColumnProps) {
  if (loading) return <CenterSkeleton />

  return (
    <div className="glass-card cc-card">
      <div className="cc-header">
        <span className="cc-header-icon-wrap" aria-hidden="true">
          <IconFolderOpen size={14} />
        </span>
        <div>
          <h2 className="cc-title">Dự án của tôi</h2>
          <p className="cc-subtitle">
            Một số dự án tiêu biểu và bài tập thực hành trong quá trình học tập và phát triển kỹ năng.
          </p>
        </div>
      </div>

      <ul className="cc-list" role="list">
        {projects.map((proj, i) => {
          const ProjIcon = PROJECT_ICONS[proj.icon_key] ?? Zap
          const iconBg   = PROJECT_BG[proj.icon_key]    ?? '#1a2a3a'
          const iconClr  = PROJECT_COLOR[proj.icon_key] ?? '#59b3ff'
          const hasRepo  = proj.repo_url && proj.repo_url !== ''
          const hasDemo  = proj.demo_url && proj.demo_url !== ''

          return (
            <motion.li
              key={proj.id}
              className="cc-project"
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              <div className="cc-proj-icon" style={{ background: iconBg }} aria-hidden="true">
                <ProjIcon size={18} color={iconClr} />
              </div>

              <div className="cc-proj-body">
                <span className="cc-proj-name">{proj.title}</span>
                <p className="cc-proj-desc">{proj.description}</p>
                <div className="cc-proj-tags">
                  {proj.tech_tags.map(tag => {
                    const meta     = SKILL_META[tag]
                    const TagIcon  = meta?.icon
                    const tagColor = meta?.color ?? '#59b3ff'
                    return (
                      <span
                        key={tag}
                        className="cc-tag"
                        style={{ '--tag-color': tagColor } as React.CSSProperties}
                      >
                        {TagIcon && <TagIcon size={10} color={tagColor} />}
                        {tag}
                      </span>
                    )
                  })}
                </div>

                {/* Action buttons */}
                <div className="cc-proj-actions">
                  {hasRepo && (
                    <motion.a
                      href={proj.repo_url}
                      className="cc-proj-link"
                      aria-label={`Xem chi tiết ${proj.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ x: 2, transition: { duration: 0.15 } }}
                    >
                      Xem chi tiết
                      <IconArrowRight size={13} />
                    </motion.a>
                  )}
                  {hasDemo && (
                    <motion.a
                      href={proj.demo_url}
                      className="cc-proj-demo"
                      aria-label={`Demo ${proj.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ x: 2, transition: { duration: 0.15 } }}
                    >
                      Demo
                      <ExternalLink size={11} />
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}
