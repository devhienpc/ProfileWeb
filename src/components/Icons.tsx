/**
 * Icons.tsx – Tổng hợp icon: lucide-react + react-icons (SI/FA brands)
 * Không dùng emoji ở bất kỳ đâu.
 */

/* ── lucide-react (UI icons) ─────────────────────────────── */
export {
  Edit3       as IconEdit,
  MapPin      as IconMapPin,
  GraduationCap as IconGraduationCap,
  Calendar    as IconCalendar,
  Clock       as IconClock,
  Send        as IconSend,
  Download    as IconDownload,
  ArrowRight  as IconArrowRight,
  Mail        as IconMail,
  User        as IconUser,
  Settings    as IconSettings,
  FolderOpen  as IconFolderOpen,
  BookOpen    as IconBookOpen,
  Building2   as IconBuilding,
  Globe       as IconGlobe,
  Code2       as IconCode,
  Zap         as IconZap,
  Layers      as IconLayers,
  Terminal    as IconTerminal,
  Activity    as IconActivity,
  ExternalLink as IconExternalLink,
} from 'lucide-react'

/* ── react-icons/si – Brand/tech logos ───────────────────── */
export {
  SiPhp,
  SiMysql,
  SiJavascript,
  SiPython,
  SiCplusplus,
  SiGit,
  SiGithub,
  SiDocker,
  SiLinux,
  SiTelegram,
  SiGooglesheets,
  SiHtml5,
  SiCss,
  SiReact,
  SiTypescript,
  SiGoogleappsscript,
} from 'react-icons/si'

/* ── react-icons/fa6 – Social brands ────────────────────── */
export {
  FaGithub,
  FaLinkedin,
  FaFacebook,
  FaTelegram,
} from 'react-icons/fa6'

/* ── Custom SVG: Zalo (no react-icons entry) ─────────────── */
type IconProps = { size?: number; className?: string; color?: string }

export function IconZalo({ size = 16, color = '#0190F3', className }: IconProps) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 48 48"
      fill={color}
      className={className}
      aria-hidden="true"
    >
      <path d="M24 4C13 4 4 13 4 24c0 5.3 2 10.1 5.3 13.8L4 44l6.5-1.7C13.9 44.7 18.8 46 24 46c11 0 20-9 20-20S35 4 24 4zm-7.7 15.5c.4 0 .8.1 1 .4l1.2 1.5-.4.7c-.3.5-.7.9-1 1.3l-.1.1c.4.7.9 1.4 1.5 2 .6.6 1.3 1.1 2 1.5l.1-.1c.4-.3.8-.7 1.3-1l.7-.4 1.5 1.2c.3.3.4.6.4 1 0 .5-.4 1.6-1.7 2-1.1.3-3.2-.5-5.6-2.8-2.4-2.4-3.2-4.5-2.8-5.6.4-1.3 1.5-1.8 1.9-1.8zm10 0h3.1c.4 0 .7.3.7.7v.7h-2v.4h2v.7h-2v.4h2v.7h-2.7c-.4 0-.7-.3-.7-.7v-2.2c-.1-.4.2-.7.6-.7z" />
    </svg>
  )
}

/* ── Skill icon mapping ───────────────────────────────────── */
import {
  SiPhp as _SiPhp,
  SiMysql as _SiMysql,
  SiJavascript as _SiJs,
  SiPython as _SiPy,
  SiCplusplus as _SiCpp,
  SiGit as _SiGit,
  SiGithub as _SiGitHub,
  SiDocker as _SiDocker,
  SiLinux as _SiLinux,
  SiHtml5 as _SiHtml,
  SiCss as _SiCss,
  SiReact as _SiReact,
  SiTypescript as _SiTs,
  SiGoogleappsscript as _SiGAS,
  SiGooglesheets as _SiSheets,
  SiTelegram as _SiTelegram,
} from 'react-icons/si'
import { Terminal as _Terminal, Code2 } from 'lucide-react'

/* Brand colors */
export const SKILL_META: Record<string, { icon: React.ComponentType<{size?:number;color?:string;className?:string}>; color: string }> = {
  'PHP':                { icon: _SiPhp,      color: '#777BB4' },
  'MySQL':              { icon: _SiMysql,    color: '#4479A1' },
  'JavaScript':         { icon: _SiJs,       color: '#F7DF1E' },
  'Python':             { icon: _SiPy,       color: '#3776AB' },
  'C++':                { icon: _SiCpp,      color: '#00599C' },
  'SQL':                { icon: _SiMysql,    color: '#4479A1' },
  'Git':                { icon: _SiGit,      color: '#F05032' },
  'GitHub':             { icon: _SiGitHub,   color: '#E6EDF3' },
  'VS Code':            { icon: Code2,      color: '#007ACC' },
  'Linux':              { icon: _SiLinux,    color: '#FCC624' },
  'Docker':             { icon: _SiDocker,   color: '#2496ED' },
  'HTML':               { icon: _SiHtml,     color: '#E34F26' },
  'CSS':                { icon: _SiCss,      color: '#1572B6' },
  'React':              { icon: _SiReact,    color: '#61DAFB' },
  'TypeScript':         { icon: _SiTs,       color: '#3178C6' },
  'Google Apps Script': { icon: _SiGAS,      color: '#4285F4' },
  'Google Sheets':      { icon: _SiSheets,   color: '#34A853' },
  'Telegram Bot':       { icon: _SiTelegram, color: '#26A5E4' },
  'Zalo Bot':           { icon: _Terminal,   color: '#0190F3' },
  'OOP':                { icon: _Terminal,   color: '#6e40c9' },
  'DSA':                { icon: _Terminal,   color: '#e05c2a' },
}
