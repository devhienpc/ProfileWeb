/**
 * RightColumn – Bảng ghi chú (Corkboard / Sticky notes)
 * Khách ghé thăm có thể dán tờ giấy note pastel, kéo thả vị trí note của mình,
 * và quản lý / xoá note qua edit_token lưu trong localStorage.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { Note, NoteColor } from '../types/api'
import {
  Pin, Plus, Maximize2, Minimize2, Trash2,
  X, MessageSquare, Check, AlertCircle, RefreshCw
} from 'lucide-react'
import './RightColumn.css'

/* ── Helpers: LocalStorage token store ────────────────────────────── */
const TOKEN_STORAGE_KEY = 'portfolio_notes_tokens'

function getSavedTokens(): Record<number, string> {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveToken(noteId: number, token: string) {
  try {
    const current = getSavedTokens()
    current[noteId] = token
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(current))
  } catch {
    // LocalStorage quota/private mode fallback
  }
}

function removeToken(noteId: number) {
  try {
    const current = getSavedTokens()
    delete current[noteId]
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(current))
  } catch {
    // Ignore
  }
}

/* ── Relative time formatter (tiếng Việt) ────────────────────────── */
function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffSec < 45) return 'Vừa xong'
    if (diffSec < 3600) return `${Math.max(1, Math.floor(diffSec / 60))} phút trước`
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`
    if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)} ngày trước`
    return `${Math.floor(diffSec / 2592000)} tháng trước`
  } catch {
    return 'Gần đây'
  }
}

interface RightColumnProps {
  profile?: unknown
  skills?: unknown
  loading?: boolean
}

export default function RightColumn(_props: RightColumnProps = {}) {
  const [notes, setNotes]           = useState<Note[]>([])
  const [loading, setLoading]       = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [tokens, setTokens]         = useState<Record<number, string>>(getSavedTokens)
  const [draggingId, setDraggingId] = useState<number | null>(null)

  // Form states
  const [authorName, setAuthorName] = useState('')
  const [content, setContent]       = useState('')
  const [color, setColor]           = useState<NoteColor>('yellow')
  const [honeypot, setHoneypot]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError]   = useState('')

  const boardRef = useRef<HTMLDivElement>(null)

  // 1. Fetch notes
  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/notes')
      if (!res.ok) throw new Error('Không thể tải ghi chú')
      const data = await res.json() as { notes: Note[] }
      setNotes(data.notes ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  // ESC to close modal or un-expand
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (isFormOpen) setIsFormOpen(false)
        else if (isExpanded) setIsExpanded(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFormOpen, isExpanded])

  // 2. Handle note drag end
  async function handleDragEnd(note: Note, offset: { x: number; y: number }) {
    setDraggingId(null)
    const token = tokens[note.id]
    if (!token || !boardRef.current) return

    const boardWidth  = boardRef.current.clientWidth
    const boardHeight = boardRef.current.clientHeight
    if (boardWidth === 0 || boardHeight === 0) return

    // Convert starting percent to px, add offset, then re-convert to percent
    const startPxX = (note.x_percent / 100) * boardWidth
    const startPxY = (note.y_percent / 100) * boardHeight

    const newPxX = startPxX + offset.x
    const newPxY = startPxY + offset.y

    const newXPercent = Number(Math.max(2, Math.min(84, (newPxX / boardWidth) * 100)).toFixed(1))
    const newYPercent = Number(Math.max(2, Math.min(82, (newPxY / boardHeight) * 100)).toFixed(1))

    // Optimistic local update
    setNotes(prev =>
      prev.map(n => n.id === note.id ? { ...n, x_percent: newXPercent, y_percent: newYPercent } : n)
    )

    // Call API PATCH
    try {
      await fetch(`/api/notes/${note.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          x_percent: newXPercent,
          y_percent: newYPercent,
          edit_token: token,
        }),
      })
    } catch (err) {
      console.error('Failed to save note position:', err)
    }
  }

  // 3. Delete own note
  async function handleDeleteNote(e: React.MouseEvent, note: Note) {
    e.stopPropagation()
    const token = tokens[note.id]
    if (!token) return

    if (!confirm(`Xác nhận gỡ ghi chú của bạn?`)) return

    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ edit_token: token }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        alert(data.error ?? 'Không thể gỡ ghi chú')
        return
      }

      // Xóa thành công
      removeToken(note.id)
      setTokens(getSavedTokens())
      setNotes(prev => prev.filter(n => n.id !== note.id))
    } catch (err) {
      alert('Lỗi kết nối khi gỡ ghi chú')
    }
  }

  // 4. Create note submit
  async function handleCreateNote(e: React.FormEvent) {
    e.preventDefault()
    if (!authorName.trim() || !content.trim()) {
      setFormError('Vui lòng nhập đầy đủ tên và nội dung')
      return
    }

    setSubmitting(true)
    setFormError('')

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: authorName.trim(),
          content: content.trim(),
          color,
          honeypot, // Honeypot field
        }),
      })

      const data = await res.json() as {
        ok?: boolean
        note?: Note
        edit_token?: string
        error?: string
      }

      if (!res.ok || !data.ok || !data.note) {
        setFormError(data.error ?? 'Không thể gửi ghi chú. Vui lòng thử lại.')
        return
      }

      // Lưu token vào localStorage để có quyền kéo/xoá
      if (data.edit_token && data.note.id) {
        saveToken(data.note.id, data.edit_token)
        setTokens(getSavedTokens())
      }

      // Thêm note vào bảng
      setNotes(prev => [...prev, data.note!])

      // Reset form & đóng
      setAuthorName('')
      setContent('')
      setColor('yellow')
      setIsFormOpen(false)
    } catch (err) {
      setFormError('Lỗi kết nối tới máy chủ. Vui lòng kiểm tra mạng.')
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Render Board Content ───────────────────────────────────────── */
  const boardContent = (
    <div className={`corkboard-card ${isExpanded ? 'corkboard-expanded' : ''}`}>
      {/* Top Header */}
      <div className="corkboard-header">
        <div className="corkboard-title-group">
          <div className="corkboard-pin-icon" aria-hidden="true">
            <Pin size={14} />
          </div>
          <h2 className="corkboard-title">Bảng ghi chú</h2>
          <span className="corkboard-badge" title="Tổng số ghi chú">{notes.length}</span>
        </div>

        <div className="corkboard-actions">
          <button
            type="button"
            className="corkboard-btn corkboard-btn-ghost"
            onClick={fetchNotes}
            title="Làm mới bảng"
            aria-label="Tải lại ghi chú"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            className="corkboard-btn corkboard-btn-ghost"
            onClick={() => setIsExpanded(prev => !prev)}
            title={isExpanded ? 'Thu nhỏ bảng' : 'Phóng to toàn màn hình'}
            aria-label={isExpanded ? 'Thu nhỏ' : 'Phóng to'}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          <button
            type="button"
            className="corkboard-btn corkboard-btn-primary"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus size={13} />
            <span>Gửi note</span>
          </button>
        </div>
      </div>

      {/* Dotted Starry Canvas */}
      <div className="corkboard-canvas" ref={boardRef}>
        {notes.length === 0 && !loading && (
          <div className="corkboard-empty">
            <MessageSquare size={28} style={{ opacity: 0.4 }} />
            <p>Bảng ghi chú đang trống.<br />Hãy là người đầu tiên để lại lời nhắn!</p>
          </div>
        )}

        <AnimatePresence>
          {notes.map(note => {
            const isOwned = Boolean(tokens[note.id])
            const isDragging = draggingId === note.id

            return (
              <motion.div
                key={note.id}
                className={`sticky-note note-${note.color} ${isOwned ? 'can-drag' : ''} ${isDragging ? 'is-dragging' : ''}`}
                style={{
                  left: `${note.x_percent}%`,
                  top: `${note.y_percent}%`,
                  rotate: `${note.rotation}deg`,
                }}
                initial={{ opacity: 0, scale: 1.3, y: -25 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.6 }}
                whileHover={{
                  y: -5,
                  rotate: 0,
                  scale: 1.02,
                  zIndex: 40,
                }}
                whileDrag={{
                  scale: 1.06,
                  rotate: 0,
                  zIndex: 100,
                }}
                drag={isOwned}
                dragConstraints={boardRef}
                dragElastic={0.06}
                dragMomentum={false}
                onDragStart={() => setDraggingId(note.id)}
                onDragEnd={(_, info) => handleDragEnd(note, info.offset)}
                title={isOwned ? 'Ghi chú của bạn (Nhấp giữ để kéo di chuyển vị trí)' : 'Ghi chú của khách ghé thăm'}
              >
                {/* 3D Pushpin */}
                <div className="sticky-pin" aria-hidden="true" />

                {/* Delete button (only for owned note) */}
                {isOwned && (
                  <button
                    type="button"
                    className="note-del-btn"
                    onClick={e => handleDeleteNote(e, note)}
                    title="Gỡ ghi chú này"
                    aria-label="Xoá ghi chú"
                  >
                    <Trash2 size={12} />
                  </button>
                )}

                {/* Content */}
                <p className="note-content">{note.content}</p>

                {/* Footer: Author & Relative time */}
                <div className="note-footer">
                  <span className="note-author">~ {note.author_name}</span>
                  <div className="note-meta-right">
                    <span className="note-time">{formatRelativeTime(note.created_at)}</span>
                    {isOwned && <span className="note-mine-badge">Của bạn ✋</span>}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Bottom subtle hint */}
        <div className="corkboard-hint">
          {Object.keys(tokens).length > 0
            ? '💡 Bạn có thể kéo thả để đổi vị trí ghi chú của mình'
            : '💡 Bấm "+ Gửi note" để dán lời chúc lên bảng'}
        </div>
      </div>
    </div>
  )

  return (
    <div className="corkboard-wrapper">
      {/* Normal in-column view */}
      {!isExpanded && boardContent}

      {/* Fullscreen expanded modal */}
      {isExpanded && (
        <div className="corkboard-overlay" onClick={() => setIsExpanded(false)}>
          <div className="corkboard-modal-box" onClick={e => e.stopPropagation()}>
            {boardContent}
          </div>
        </div>
      )}

      {/* Note Creation Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="note-form-overlay" onClick={() => !submitting && setIsFormOpen(false)}>
            <motion.div
              className="note-form-card"
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="note-form-header">
                <h3 className="note-form-title">
                  <Pin size={18} style={{ color: 'var(--accent)' }} />
                  Để lại ghi chú
                </h3>
                <button
                  type="button"
                  className="note-form-close"
                  onClick={() => setIsFormOpen(false)}
                  disabled={submitting}
                  aria-label="Đóng"
                >
                  <X size={18} />
                </button>
              </div>

              {formError && (
                <div className="note-form-error">
                  <AlertCircle size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateNote}>
                {/* Honeypot hidden input (Chống bot spam) */}
                <input
                  type="text"
                  name="website_url_hp"
                  value={honeypot}
                  onChange={e => setHoneypot(e.target.value)}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                {/* Author Name */}
                <div className="note-field">
                  <div className="note-label">
                    <span>Tên hoặc biệt danh của bạn *</span>
                    <span className="note-char-count">{authorName.length}/30</span>
                  </div>
                  <input
                    type="text"
                    className="note-input"
                    placeholder="VD: Minh Tuấn, Bạn cùng lớp, UTH K21..."
                    maxLength={30}
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                {/* Content */}
                <div className="note-field">
                  <div className="note-label">
                    <span>Lời nhắn / Cảm nghĩ / Đánh giá *</span>
                    <span className="note-char-count">{content.length}/140</span>
                  </div>
                  <textarea
                    className="note-textarea"
                    placeholder="Để lại một lời chúc hoặc cảm nghĩ về trang web của Hiền nhé..."
                    maxLength={140}
                    rows={3}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    required
                  />
                </div>

                {/* Color Picker */}
                <div className="note-field">
                  <div className="note-label">
                    <span>Chọn màu giấy note</span>
                  </div>
                  <div className="color-picker">
                    {(['yellow', 'pink', 'blue', 'purple'] as NoteColor[]).map(c => (
                      <button
                        key={c}
                        type="button"
                        className={`color-option color-opt-${c} ${color === c ? 'active' : ''}`}
                        onClick={() => setColor(c)}
                        aria-label={`Màu ${c}`}
                      >
                        {color === c && <Check size={14} color="#1e293b" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cloudflare Turnstile Placeholder Guide */}
                <div className="turnstile-box">
                  🛡️ Hệ thống bảo vệ chống spam tự động bằng mã hóa IP và giới hạn tần suất.
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="note-submit-btn"
                  disabled={submitting || !authorName.trim() || !content.trim()}
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Đang dán lên bảng…</span>
                    </>
                  ) : (
                    <>
                      <Pin size={15} />
                      <span>Dán ghi chú lên bảng</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
