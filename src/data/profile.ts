/* ────────────────────────────────────────────────────────────
   src/data/profile.ts
   Tập trung toàn bộ dữ liệu portfolio – chỉnh sửa tại đây.
───────────────────────────────────────────────────────────── */

export const profile = {
  name:      'Trương Văn Hiền',
  nameEn:    'Truong Van Hien',
  badge:     'Third Year • Information Technology',
  location:  'Khánh Hòa, Việt Nam',
  age:       20,
  school:    'Đại học Giao Thông Vận Tải TP.HCM (UTH)',
  major:     'Công nghệ Thông tin',
  yearLevel: 'Năm 3',
  born:      '–',          // để '–' nếu không muốn hiển thị
  quote:     'Học hỏi mỗi ngày, tiến gần hơn tới mục tiêu!',
  cvUrl:     '#',           // thay bằng link CV thật
  avatar:    '',            // để trống → hiện initials fallback
}

/* ── Mạng xã hội ─────────────────────────────────────────── */
export type SocialLink = { label: string; href: string; icon: string }

export const socials: SocialLink[] = [
  { label: 'GitHub',   href: 'https://github.com/devhienpc',    icon: 'gh'   },
  { label: 'LinkedIn', href: '#',                                icon: 'li'   },
  { label: 'Facebook', href: '#',                                icon: 'fb'   },
  { label: 'Email',    href: 'mailto:hienpc@example.com',        icon: 'mail' },
]

/* ── Thông tin cá nhân ───────────────────────────────────── */
export type PersonalField = { label: string; value: string; icon: string }

export const personalInfo: PersonalField[] = [
  { label: 'Họ và tên',  value: 'Trương Văn Hiền',                          icon: '👤' },
  { label: 'Ngày sinh',  value: '–',                                        icon: '🎂' },
  { label: 'Tuổi',       value: '20',                                       icon: '⏳' },
  { label: 'Quê quán',   value: 'Khánh Hòa, Việt Nam',                      icon: '📍' },
  { label: 'Trường học', value: 'Đại học Giao Thông Vận Tải TP.HCM (UTH)', icon: '🎓' },
  { label: 'Ngành học',  value: 'Công nghệ Thông tin',                      icon: '💻' },
  { label: 'Năm học',    value: 'Năm 3',                                    icon: '📅' },
]

/* ── Kỹ năng ─────────────────────────────────────────────── */
export type SkillTag = { name: string; color?: string }

export const skillGroups: { category: string; icon: string; skills: SkillTag[] }[] = [
  {
    category: 'Ngôn ngữ lập trình',
    icon: '</>',
    skills: [
      { name: 'C++',        color: '#00599C' },
      { name: 'Python',     color: '#3776AB' },
      { name: 'PHP',        color: '#777BB4' },
      { name: 'JavaScript', color: '#F7DF1E' },
      { name: 'SQL',        color: '#336791' },
    ],
  },
  {
    category: 'Công cụ & Nền tảng',
    icon: '⚙',
    skills: [
      { name: 'Git'     },
      { name: 'GitHub'  },
      { name: 'VS Code' },
      { name: 'Linux'   },
      { name: 'Docker'  },
    ],
  },
]

/* ── Dự án ───────────────────────────────────────────────── */
export type Project = {
  id: string
  name: string
  description: string
  tags: string[]
  href: string
  iconBg: string   // màu nền icon
  emoji: string    // emoji đại diện
}

export const projects: Project[] = [
  {
    id: 'manga',
    name: 'Manga-Creation-Workflow-and-Publishing-Management-System',
    description: 'Hệ thống quản lý quy trình tạo và xuất bản truyện tranh.',
    tags: ['PHP', 'MySQL', 'JavaScript', 'Git'],
    href: '#',
    iconBg: '#1a3a5c',
    emoji: '📚',
  },
  {
    id: 'room',
    name: 'Room Rental Management (Zalo Bot)',
    description: 'Bot hỗ trợ tìm phòng trọ qua Zalo, tích hợp Google Sheets.',
    tags: ['Google Apps Script', 'Zalo Bot', 'Google Sheets'],
    href: '#',
    iconBg: '#1a4020',
    emoji: '🏠',
  },
  {
    id: 'telegram',
    name: 'Telegram Room Bot',
    description: 'Bot quản lý phòng, tìm kiếm và xử lý dữ liệu qua Telegram.',
    tags: ['Python', 'Telegram Bot', 'Google Sheets'],
    href: '#',
    iconBg: '#1a2a5c',
    emoji: '✈️',
  },
  {
    id: 'portfolio',
    name: 'Website Profile (Personal Portfolio)',
    description: 'Website cá nhân giới thiệu bản thân, kỹ năng và dự án.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    href: '#',
    iconBg: '#2a1a5c',
    emoji: '🌐',
  },
  {
    id: 'cpp',
    name: 'Bài tập & Đồ án C++',
    description: 'Các bài tập OOP, cấu trúc dữ liệu và thuật toán.',
    tags: ['C++', 'OOP', 'DSA'],
    href: '#',
    iconBg: '#3a1a1a',
    emoji: '⚡',
  },
]

/* ── Hoạt động gần đây ───────────────────────────────────── */
export type Activity = { title: string; detail: string; time: string }

export const activities: Activity[] = [
  { title: 'Cập nhật dự án Manga System', detail: 'Sửa conflict và tối ưu code',     time: '2 ngày trước' },
  { title: 'Làm việc với STAR HOUSE',     detail: 'Hỗ trợ đăng bài và tư vấn phòng', time: '4 ngày trước' },
  { title: 'Học thêm về Python & AI',     detail: 'Làm bài tập và nghiên cứu',        time: '5 ngày trước' },
  { title: 'Sửa lỗi bot Zalo',           detail: 'Xử lý webhook và command',          time: '6 ngày trước' },
  { title: 'Viết CV & chuẩn bị ứng tuyển', detail: 'Hoàn thiện hồ sơ xin việc',     time: '1 tuần trước' },
]

/* ── Liên hệ nhanh ───────────────────────────────────────── */
export type ContactItem = { label: string; value: string; href: string; icon: string; color: string }

export const contacts: ContactItem[] = [
  { label: 'Zalo',   value: '0325.855.3034',    href: 'https://zalo.me/0325855034', icon: 'zalo', color: '#0190F3' },
  { label: 'GitHub', value: 'devhienpc',         href: 'https://github.com/devhienpc', icon: 'gh',  color: '#6e40c9' },
  { label: 'Email',  value: 'hienpc@example.com', href: 'mailto:hienpc@example.com',  icon: 'mail', color: '#EA4335' },
]
