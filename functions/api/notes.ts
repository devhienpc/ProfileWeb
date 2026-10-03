/**
 * /api/notes
 * GET  – Lấy danh sách ghi chú hiển thị (is_hidden = 0)
 * POST – Tạo ghi chú mới (kèm rate limiting, honeypot, bộ lọc spam/URL/từ tục)
 */
import { type Env, sha256Hex, jsonOk, jsonError } from './admin/_auth'

function stripHtml(input: unknown): string {
  return String(input ?? '').replace(/<[^>]*>/g, '').trim()
}

const URL_REGEX = /(https?:\/\/|www\.[a-z0-9]|t\.me\/|zalo\.me\/|[a-z0-9-]+\.(com|vn|net|org|io|xyz|top|me|info|biz|co|app|edu))/i
const PROFANITY_REGEX = /(dcm|dkm|đcm|vcl|vlon|lồn|cặc|địt|đụ|buồi|đéo|chó đẻ|óc chó|fuck|bitch|asshole)/i
const VALID_COLORS = ['yellow', 'pink', 'blue', 'purple'] as const

/* ── GET /api/notes ────────────────────────────────────────── */
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const { results } = await env.DB
      .prepare(`
        SELECT id, author_name, content, color, x_percent, y_percent, rotation, created_at
        FROM notes
        WHERE is_hidden = 0
        ORDER BY created_at ASC
      `)
      .all()

    return jsonOk({ notes: results ?? [] })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi cơ sở dữ liệu'
    return jsonError(msg, 500)
  }
}

/* ── POST /api/notes ───────────────────────────────────────── */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // 1. IP & Rate Limiting
  const ip = request.headers.get('CF-Connecting-IP')
    ?? request.headers.get('X-Forwarded-For')
    ?? '127.0.0.1'

  const secret = env.ADMIN_SECRET || 'portfolio_notes_salt_key'
  const ipHash = await sha256Hex(ip, secret)

  // Kiểm tra 1 giờ: tối đa 3 ghi chú
  const hourCheck = await env.DB
    .prepare("SELECT COUNT(*) as count FROM notes WHERE ip_hash = ? AND created_at > datetime('now', '-1 hour')")
    .bind(ipHash)
    .first<{ count: number }>()

  if ((hourCheck?.count ?? 0) >= 3) {
    return jsonError('Bạn đã gửi tối đa 3 ghi chú trong 1 giờ qua. Vui lòng thử lại sau!', 429)
  }

  // Kiểm tra 1 ngày: tối đa 10 ghi chú
  const dayCheck = await env.DB
    .prepare("SELECT COUNT(*) as count FROM notes WHERE ip_hash = ? AND created_at > datetime('now', '-1 day')")
    .bind(ipHash)
    .first<{ count: number }>()

  if ((dayCheck?.count ?? 0) >= 10) {
    return jsonError('Bạn đã đạt giới hạn 10 ghi chú trong ngày. Vui lòng quay lại vào ngày mai!', 429)
  }

  // 2. Parse request body
  let body: Record<string, unknown>
  try {
    body = await request.json() as Record<string, unknown>
  } catch {
    return jsonError('Dữ liệu JSON không hợp lệ')
  }

  // 3. Honeypot check (đối phó bot)
  if (body.website || body.honeypot) {
    // Trả về ok giả để bot tưởng thành công nhưng không lưu
    return jsonOk({ ok: true, note: { id: 0, author_name: 'Bot' }, edit_token: 'fake_token' })
  }

  // 4. Cloudflare Turnstile verify (nếu cấu hình)
  // Để bật: thêm TURNSTILE_SECRET_KEY vào .dev.vars / Cloudflare Environment Variables
  const turnstileSecret = (env as unknown as { TURNSTILE_SECRET_KEY?: string }).TURNSTILE_SECRET_KEY
  if (turnstileSecret && body.turnstile_token) {
    try {
      const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: turnstileSecret,
          response: body.turnstile_token,
          remoteip: ip,
        }),
      })
      const turnstileData = await turnstileRes.json() as { success?: boolean }
      if (!turnstileData.success) {
        return jsonError('Xác thực Turnstile không thành công. Vui lòng thử lại.', 403)
      }
    } catch {
      // Pass-through nếu lỗi network
    }
  }

  // 5. Làm sạch và kiểm tra dữ liệu
  const authorName = stripHtml(body.author_name).slice(0, 30)
  if (!authorName) {
    return jsonError('Vui lòng nhập tên của bạn (tối đa 30 ký tự)')
  }

  const content = stripHtml(body.content).slice(0, 140)
  if (content.length < 2) {
    return jsonError('Nội dung ghi chú phải có ít nhất 2 ký tự')
  }

  // Chặn liên kết / URL
  if (URL_REGEX.test(content) || URL_REGEX.test(authorName)) {
    return jsonError('Ghi chú không được chứa liên kết hoặc địa chỉ website')
  }

  // Lọc từ ngữ thô tục cơ bản
  if (PROFANITY_REGEX.test(content) || PROFANITY_REGEX.test(authorName)) {
    return jsonError('Nội dung chứa từ ngữ không phù hợp')
  }

  // Màu sắc pastel
  const rawColor = String(body.color ?? 'yellow').toLowerCase()
  const color = (VALID_COLORS as readonly string[]).includes(rawColor) ? rawColor : 'yellow'

  // Góc nghiêng ngẫu nhiên (-5° đến 5°)
  const randomRot = Number((Math.random() * 10 - 5).toFixed(1))
  const rotation = typeof body.rotation === 'number'
    ? Math.max(-6, Math.min(6, body.rotation))
    : randomRot

  // Vị trí (phần trăm)
  const defaultX = Number((10 + Math.random() * 55).toFixed(1))
  const defaultY = Number((10 + Math.random() * 60).toFixed(1))
  const xPercent = typeof body.x_percent === 'number'
    ? Math.max(2, Math.min(85, body.x_percent))
    : defaultX
  const yPercent = typeof body.y_percent === 'number'
    ? Math.max(2, Math.min(85, body.y_percent))
    : defaultY

  // 6. Tạo edit_token cho khách
  const editToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
  const editTokenHash = await sha256Hex(editToken, secret)

  // 7. Lưu vào D1
  const result = await env.DB
    .prepare(`
      INSERT INTO notes (
        author_name, content, color, x_percent, y_percent, rotation,
        edit_token_hash, ip_hash, is_hidden
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `)
    .bind(authorName, content, color, xPercent, yPercent, rotation, editTokenHash, ipHash)
    .run()

  const newId = result.meta.last_row_id

  return jsonOk({
    ok: true,
    note: {
      id: newId,
      author_name: authorName,
      content,
      color,
      x_percent: xPercent,
      y_percent: yPercent,
      rotation,
      created_at: new Date().toISOString(),
    },
    edit_token: editToken,
  })
}
