import { useState, useEffect, useCallback } from 'react'
import type { Project, Skill, Social, Profile, Note } from '../types/api'
import { normalizeImageUrl } from '../utils/image'
import {
  LogOut, Plus, Pencil, Trash2, Eye, EyeOff,
  Save, X, ChevronUp, ChevronDown, RefreshCw,
  User, Globe, Layers, FolderOpen, Lock, Pin,
} from 'lucide-react'
import '../index.css'
import './Admin.css'

/* ── Auth state ────────────────────────────────────────────── */
type AuthState = 'checking' | 'authenticated' | 'unauthenticated'

/* ── Tabs ──────────────────────────────────────────────────── */
type Tab = 'profile' | 'socials' | 'skills' | 'projects' | 'notes'

/* ═══════════════════════════════════════════════════════════ */
/*  LOGIN FORM                                                  */
/* ═══════════════════════════════════════════════════════════ */
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password }),
        credentials: 'include',
      })
      const json = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok) { setError(json.error ?? 'Lỗi đăng nhập'); return }
      onSuccess()
    } catch { setError('Không thể kết nối máy chủ') }
    finally  { setLoading(false) }
  }

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card glass-card">
        <div className="admin-login-logo">
          <Lock size={28} />
        </div>
        <h1 className="admin-login-title">Admin Panel</h1>
        <p className="admin-login-sub">Nhập mật khẩu để tiếp tục</p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <input
            type="password"
            className="admin-input"
            placeholder="Mật khẩu"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
            autoComplete="current-password"
          />
          {error && <p className="admin-error-msg">{error}</p>}
          <button type="submit" className="admin-btn-primary" disabled={loading}>
            {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/*  PROJECT FORM MODAL                                          */
/* ═══════════════════════════════════════════════════════════ */
interface ProjectFormProps {
  initial?: Partial<Project>
  onSave:  (data: Partial<Project>) => Promise<void>
  onClose: () => void
}
function ProjectForm({ initial, onSave, onClose }: ProjectFormProps) {
  const [title,       setTitle]       = useState(initial?.title       ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [techTags,    setTechTags]    = useState((initial?.tech_tags  ?? []).join(', '))
  const [iconKey,     setIconKey]     = useState(initial?.icon_key    ?? '')
  const [repoUrl,     setRepoUrl]     = useState(initial?.repo_url    ?? '')
  const [demoUrl,     setDemoUrl]     = useState(initial?.demo_url    ?? '')
  const [isVisible,   setIsVisible]   = useState(initial?.is_visible  !== 0)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Tên dự án không được trống'); return }
    setSaving(true)
    setError('')
    try {
      await onSave({
        title:       title.trim(),
        description: description.trim(),
        tech_tags:   techTags.split(',').map(t => t.trim()).filter(Boolean),
        icon_key:    iconKey.trim(),
        repo_url:    repoUrl.trim(),
        demo_url:    demoUrl.trim(),
        is_visible:  isVisible ? 1 : 0,
      })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi lưu dữ liệu')
    } finally { setSaving(false) }
  }

  return (
    <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal glass-card">
        <div className="admin-modal-header">
          <h3>{initial?.id ? 'Chỉnh sửa dự án' : 'Thêm dự án mới'}</h3>
          <button className="admin-icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <label className="admin-label">
            Tên dự án *
            <input className="admin-input" value={title} onChange={e => setTitle(e.target.value)} maxLength={200} />
          </label>
          <label className="admin-label">
            Mô tả
            <textarea className="admin-input admin-textarea" value={description} onChange={e => setDescription(e.target.value)} maxLength={500} rows={3} />
          </label>
          <label className="admin-label">
            Tags công nghệ (phân cách bằng dấu phẩy)
            <input className="admin-input" value={techTags} onChange={e => setTechTags(e.target.value)} placeholder="PHP, MySQL, JavaScript" />
          </label>
          <div className="admin-form-row">
            <label className="admin-label" style={{ flex: 1 }}>
              Icon key
              <input className="admin-input" value={iconKey} onChange={e => setIconKey(e.target.value)} placeholder="manga, room, cpp…" maxLength={50} />
            </label>
            <label className="admin-label admin-label-check">
              <input type="checkbox" checked={isVisible} onChange={e => setIsVisible(e.target.checked)} />
              Hiển thị
            </label>
          </div>
          <label className="admin-label">
            Link Repo (GitHub/Drive…)
            <input className="admin-input" value={repoUrl} onChange={e => setRepoUrl(e.target.value)} type="url" placeholder="https://github.com/…" />
          </label>
          <label className="admin-label">
            Link Demo (tuỳ chọn)
            <input className="admin-input" value={demoUrl} onChange={e => setDemoUrl(e.target.value)} type="url" placeholder="https://…" />
          </label>

          {error && <p className="admin-error-msg">{error}</p>}

          <div className="admin-form-actions">
            <button type="button" className="admin-btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="admin-btn-primary" disabled={saving}>
              <Save size={14} />
              {saving ? 'Đang lưu…' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/*  PROJECTS TAB                                                */
/* ═══════════════════════════════════════════════════════════ */
function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState<{ type: 'add' | 'edit'; data?: Project } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/projects', { credentials: 'include' })
      const json = await res.json() as Project[]
      setProjects(json)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  async function saveProject(data: Partial<Project>) {
    if (modal?.type === 'edit' && modal.data?.id) {
      const res = await fetch(`/api/admin/projects/${modal.data.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), credentials: 'include',
      })
      if (!res.ok) throw new Error((await res.json() as { error: string }).error)
    } else {
      const res = await fetch('/api/admin/projects', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), credentials: 'include',
      })
      if (!res.ok) throw new Error((await res.json() as { error: string }).error)
    }
    await load()
  }

  async function toggleVisible(proj: Project) {
    await fetch(`/api/admin/projects/${proj.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_visible: proj.is_visible ? 0 : 1 }),
      credentials: 'include',
    })
    await load()
  }

  async function deleteProject(id: number) {
    if (!confirm('Xác nhận xoá dự án này?')) return
    await fetch(`/api/admin/projects/${id}`, { method: 'DELETE', credentials: 'include' })
    await load()
  }

  async function reorder(id: number, direction: 'up' | 'down') {
    const idx  = projects.findIndex(p => p.id === id)
    if (idx < 0) return
    const swap = direction === 'up' ? idx - 1 : idx + 1
    if (swap < 0 || swap >= projects.length) return

    const [a, b] = [projects[idx], projects[swap]]
    await Promise.all([
      fetch(`/api/admin/projects/${a.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: b.sort_order }), credentials: 'include',
      }),
      fetch(`/api/admin/projects/${b.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: a.sort_order }), credentials: 'include',
      }),
    ])
    await load()
  }

  return (
    <div className="admin-tab-content">
      <div className="admin-tab-toolbar">
        <h2 className="admin-tab-title"><FolderOpen size={16} /> Dự án</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="admin-btn-ghost" onClick={load}><RefreshCw size={14} /></button>
          <button className="admin-btn-primary" onClick={() => setModal({ type: 'add' })}>
            <Plus size={14} /> Thêm dự án
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">Đang tải…</div>
      ) : (
        <div className="admin-project-list">
          {projects.map((proj, i) => (
            <div key={proj.id} className={`admin-project-row glass-card ${!proj.is_visible ? 'admin-project-hidden' : ''}`}>
              <div className="admin-proj-info">
                <span className="admin-proj-title">{proj.title}</span>
                <span className="admin-proj-desc">{proj.description}</span>
                <div className="admin-proj-tags">
                  {(Array.isArray(proj.tech_tags) ? proj.tech_tags : []).map((t: string) => (
                    <span key={t} className="admin-tag">{t}</span>
                  ))}
                </div>
              </div>
              <div className="admin-proj-actions">
                <button className="admin-icon-btn" onClick={() => reorder(proj.id, 'up')} disabled={i === 0} title="Lên"><ChevronUp size={14} /></button>
                <button className="admin-icon-btn" onClick={() => reorder(proj.id, 'down')} disabled={i === projects.length - 1} title="Xuống"><ChevronDown size={14} /></button>
                <button className="admin-icon-btn" onClick={() => toggleVisible(proj)} title={proj.is_visible ? 'Ẩn' : 'Hiện'}>
                  {proj.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button className="admin-icon-btn" onClick={() => setModal({ type: 'edit', data: proj })} title="Chỉnh sửa"><Pencil size={14} /></button>
                <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => deleteProject(proj.id)} title="Xoá"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ProjectForm
          initial={modal.data}
          onSave={saveProject}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/*  PROFILE TAB                                                 */
/* ═══════════════════════════════════════════════════════════ */
function ProfileTab() {
  const [data, setData]     = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    fetch('/api/admin/profile', { credentials: 'include' })
      .then(r => r.json() as Promise<Profile>)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (!data) return
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), credentials: 'include',
      })
      if (!res.ok) throw new Error((await res.json() as { error: string }).error)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi lưu')
    } finally { setSaving(false) }
  }

  const fields: { key: keyof Profile; label: string; type?: string }[] = [
    { key: 'full_name',    label: 'Họ và tên' },
    { key: 'display_name', label: 'Tên hiển thị (tiếng Anh)' },
    { key: 'badge',        label: 'Badge' },
    { key: 'location',     label: 'Địa điểm' },
    { key: 'age',          label: 'Tuổi', type: 'number' },
    { key: 'school',       label: 'Trường học' },
    { key: 'major',        label: 'Ngành học' },
    { key: 'year_level',   label: 'Năm học' },
    { key: 'birthday',     label: 'Ngày sinh' },
    { key: 'quote',        label: 'Câu quote' },
    { key: 'avatar_url',   label: 'Avatar URL' },
    { key: 'cv_url',       label: 'CV URL' },
  ]

  if (loading) return <div className="admin-loading">Đang tải…</div>

  return (
    <div className="admin-tab-content">
      <div className="admin-tab-toolbar">
        <h2 className="admin-tab-title"><User size={16} /> Hồ sơ</h2>
        <button className="admin-btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={14} /> {saving ? 'Đang lưu…' : saved ? 'Đã lưu!' : 'Lưu'}
        </button>
      </div>
      <div className="admin-form admin-form-grid">
        {data && fields.map(f => (
          <label key={f.key} className="admin-label">
            {f.label}
            <input
              className="admin-input"
              type={f.type ?? 'text'}
              value={String(data[f.key] ?? '')}
              onChange={e => setData(d => d ? { ...d, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value } : d)}
            />
            {f.key === 'avatar_url' && data.avatar_url && (
              <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src={normalizeImageUrl(data.avatar_url)}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent-border)' }}
                  onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none' }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {data.avatar_url.includes('drive.google.com') ? '✨ Đã tự động nhận diện & chuyển đổi link Google Drive' : 'Xem trước ảnh'}
                </span>
              </div>
            )}
          </label>
        ))}
      </div>
      {error && <p className="admin-error-msg">{error}</p>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/*  SOCIALS TAB                                                 */
/* ═══════════════════════════════════════════════════════════ */
function SocialsTab() {
  const [socials, setSocials] = useState<Social[]>([])
  const [loading, setLoading] = useState(true)
  const [addMode, setAddMode] = useState(false)
  const [newPlatform, setNewPlatform] = useState('')
  const [newUrl, setNewUrl]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res  = await fetch('/api/admin/socials', { credentials: 'include' })
    const json = await res.json() as Social[]
    setSocials(json)
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  async function addSocial() {
    if (!newPlatform || !newUrl) return
    await fetch('/api/admin/socials', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: newPlatform, url: newUrl }),
      credentials: 'include',
    })
    setNewPlatform(''); setNewUrl(''); setAddMode(false)
    await load()
  }

  async function deleteSocial(id: number) {
    if (!confirm('Xoá mạng xã hội này?')) return
    await fetch(`/api/admin/socials/${id}`, { method: 'DELETE', credentials: 'include' })
    await load()
  }

  return (
    <div className="admin-tab-content">
      <div className="admin-tab-toolbar">
        <h2 className="admin-tab-title"><Globe size={16} /> Mạng xã hội</h2>
        <button className="admin-btn-primary" onClick={() => setAddMode(a => !a)}>
          <Plus size={14} /> Thêm
        </button>
      </div>

      {addMode && (
        <div className="admin-add-row glass-card">
          <input className="admin-input" placeholder="Platform (github, email…)" value={newPlatform} onChange={e => setNewPlatform(e.target.value)} />
          <input className="admin-input" placeholder="URL" value={newUrl} type="url" onChange={e => setNewUrl(e.target.value)} />
          <button className="admin-btn-primary" onClick={addSocial}><Save size={13} /> Lưu</button>
          <button className="admin-btn-ghost" onClick={() => setAddMode(false)}><X size={13} /></button>
        </div>
      )}

      {loading ? <div className="admin-loading">Đang tải…</div> : (
        <div className="admin-simple-list">
          {socials.map(s => (
            <div key={s.id} className="admin-simple-row glass-card">
              <span className="admin-social-platform">{s.platform}</span>
              <span className="admin-social-url">{s.url}</span>
              <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => deleteSocial(s.id)}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/*  SKILLS TAB                                                  */
/* ═══════════════════════════════════════════════════════════ */
function SkillsTab() {
  const [skills, setSkills]   = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [addMode, setAddMode] = useState(false)
  const [form, setForm]       = useState({ category: 'language', name: '', icon_key: '', color: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const res  = await fetch('/api/admin/skills', { credentials: 'include' })
    const json = await res.json() as Skill[]
    setSkills(json)
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  async function addSkill() {
    if (!form.name) return
    await fetch('/api/admin/skills', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form), credentials: 'include',
    })
    setForm({ category: 'language', name: '', icon_key: '', color: '' })
    setAddMode(false)
    await load()
  }

  async function deleteSkill(id: number) {
    if (!confirm('Xoá kỹ năng này?')) return
    await fetch(`/api/admin/skills/${id}`, { method: 'DELETE', credentials: 'include' })
    await load()
  }

  const languages = skills.filter(s => s.category === 'language')
  const tools     = skills.filter(s => s.category === 'tool')

  return (
    <div className="admin-tab-content">
      <div className="admin-tab-toolbar">
        <h2 className="admin-tab-title"><Layers size={16} /> Kỹ năng</h2>
        <button className="admin-btn-primary" onClick={() => setAddMode(a => !a)}>
          <Plus size={14} /> Thêm
        </button>
      </div>

      {addMode && (
        <div className="admin-add-row glass-card">
          <select className="admin-input admin-select" value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            <option value="language">Ngôn ngữ</option>
            <option value="tool">Công cụ</option>
          </select>
          <input className="admin-input" placeholder="Tên kỹ năng" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input className="admin-input" placeholder="Icon key" value={form.icon_key}
            onChange={e => setForm(f => ({ ...f, icon_key: e.target.value }))} />
          <input className="admin-input" placeholder="#color" value={form.color} type="color"
            onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: 48, padding: 2 }} />
          <button className="admin-btn-primary" onClick={addSkill}><Save size={13} /></button>
          <button className="admin-btn-ghost" onClick={() => setAddMode(false)}><X size={13} /></button>
        </div>
      )}

      {loading ? <div className="admin-loading">Đang tải…</div> : (
        <>
          {[['language', 'Ngôn ngữ lập trình', languages], ['tool', 'Công cụ & Nền tảng', tools]].map(([, label, list]) => (
            <div key={label as string} className="admin-skill-group">
              <h3 className="admin-skill-cat-title">{label as string}</h3>
              <div className="admin-simple-list">
                {(list as Skill[]).map(s => (
                  <div key={s.id} className="admin-simple-row glass-card">
                    {s.color && (
                      <span style={{
                        width: 12, height: 12, borderRadius: '50%',
                        background: s.color, display: 'inline-block', flexShrink: 0,
                      }} />
                    )}
                    <span className="admin-skill-name">{s.name}</span>
                    <span className="admin-skill-icon-key">{s.icon_key}</span>
                    <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => deleteSkill(s.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/*  NOTES TAB                                                  */
/* ═══════════════════════════════════════════════════════════ */
function NotesTab() {
  const [notes, setNotes]     = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/notes', { credentials: 'include' })
      const data = await res.json() as { notes?: Note[] }
      setNotes(data.notes ?? [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleHide(note: Note) {
    const nextHidden = note.is_hidden ? 0 : 1
    await fetch(`/api/admin/notes/${note.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_hidden: nextHidden }),
      credentials: 'include',
    })
    await load()
  }

  async function deleteNote(id: number) {
    if (!confirm('Xoá vĩnh viễn ghi chú này?')) return
    await fetch(`/api/admin/notes/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    await load()
  }

  return (
    <div className="admin-tab-content">
      <div className="admin-tab-toolbar">
        <h2 className="admin-tab-title"><Pin size={16} /> Quản lý Ghi chú</h2>
        <button className="admin-btn-ghost" onClick={load} title="Làm mới"><RefreshCw size={14} /></button>
      </div>

      {loading ? (
        <div className="admin-loading">Đang tải…</div>
      ) : notes.length === 0 ? (
        <p className="admin-empty">Chưa có ghi chú nào.</p>
      ) : (
        <div className="admin-project-list">
          {notes.map(n => (
            <div key={n.id} className={`admin-project-row glass-card ${n.is_hidden ? 'admin-project-hidden' : ''}`}>
              <div className="admin-proj-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className={`admin-note-color-badge ${n.color}`}>{n.color}</span>
                  <span className="admin-proj-title">{n.author_name}</span>
                  <span className={`admin-badge-status ${n.is_hidden ? 'hidden' : 'visible'}`}>
                    {n.is_hidden ? 'Đã ẩn' : 'Hiển thị'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {new Date(n.created_at).toLocaleString('vi-VN')}
                  </span>
                </div>
                <p style={{ margin: '0.4rem 0', fontSize: '0.875rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>
                  "{n.content}"
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.72rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span>Vị trí: ({n.x_percent}%, {n.y_percent}%)</span>
                  <span>Góc nghiêng: {n.rotation}°</span>
                  {n.ip_hash && <span>IP Hash: {n.ip_hash}</span>}
                </div>
              </div>

              <div className="admin-proj-actions">
                <button
                  className="admin-icon-btn"
                  onClick={() => toggleHide(n)}
                  title={n.is_hidden ? 'Hiện ghi chú' : 'Ẩn ghi chú'}
                >
                  {n.is_hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  className="admin-icon-btn admin-icon-btn--danger"
                  onClick={() => deleteNote(n.id)}
                  title="Xoá vĩnh viễn"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/*  ADMIN DASHBOARD                                             */
/* ═══════════════════════════════════════════════════════════ */
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('projects')

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'profile',  label: 'Hồ sơ',      icon: <User      size={15} /> },
    { key: 'socials',  label: 'Mạng xã hội', icon: <Globe     size={15} /> },
    { key: 'skills',   label: 'Kỹ năng',     icon: <Layers    size={15} /> },
    { key: 'projects', label: 'Dự án',       icon: <FolderOpen size={15} /> },
    { key: 'notes',    label: 'Ghi chú',     icon: <Pin        size={15} /> },
  ]

  async function handleLogout() {
    await fetch('/api/admin/login', { method: 'DELETE', credentials: 'include' })
    onLogout()
  }

  return (
    <div className="admin-root">
      {/* Sidebar */}
      <nav className="admin-sidebar glass-card">
        <div className="admin-sidebar-logo">
          <span className="admin-sidebar-brand">&lt;/&gt; Admin</span>
          <a href="/" className="admin-sidebar-back" title="Về trang chủ">
            <Globe size={15} />
          </a>
        </div>

        <ul className="admin-nav-list">
          {tabs.map(t => (
            <li key={t.key}>
              <button
                className={`admin-nav-btn ${tab === t.key ? 'active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.icon}
                {t.label}
              </button>
            </li>
          ))}
        </ul>

        <button className="admin-logout-btn" onClick={handleLogout}>
          <LogOut size={14} /> Đăng xuất
        </button>
      </nav>

      {/* Main */}
      <main className="admin-main">
        {tab === 'profile'  && <ProfileTab />}
        {tab === 'socials'  && <SocialsTab />}
        {tab === 'skills'   && <SkillsTab  />}
        {tab === 'projects' && <ProjectsTab />}
        {tab === 'notes'    && <NotesTab />}
      </main>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/*  ROOT ADMIN PAGE                                             */
/* ═══════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const [authState, setAuthState] = useState<AuthState>('checking')

  useEffect(() => {
    fetch('/api/admin/me', { credentials: 'include' })
      .then(res => setAuthState(res.ok ? 'authenticated' : 'unauthenticated'))
      .catch(() => setAuthState('unauthenticated'))
  }, [])

  if (authState === 'checking') {
    return (
      <div className="admin-checking">
        <div className="admin-checking-spinner" />
      </div>
    )
  }

  if (authState === 'unauthenticated') {
    return <LoginForm onSuccess={() => setAuthState('authenticated')} />
  }

  return <AdminDashboard onLogout={() => setAuthState('unauthenticated')} />
}
