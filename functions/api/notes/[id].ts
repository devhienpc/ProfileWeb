/**
 * /api/notes/[id]
 * PATCH  – Cập nhật vị trí kéo thả (x_percent, y_percent), yêu cầu edit_token
 * DELETE – Xoá ghi chú của chính mình, yêu cầu edit_token
 */
import { type Env, sha256Hex, jsonOk, jsonError } from '../admin/_auth'

/* ── PATCH /api/notes/[id] ─────────────────────────────────── */
export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = Number(params.id)
  if (!id || isNaN(id)) return jsonError('ID ghi chú không hợp lệ')

  let body: { x_percent?: unknown; y_percent?: unknown; edit_token?: unknown }
  try {
    body = await request.json() as typeof body
  } catch {
    return jsonError('Dữ liệu JSON không hợp lệ')
  }

  const editToken = typeof body.edit_token === 'string' ? body.edit_token : ''
  if (!editToken) {
    return jsonError('Thiếu edit_token để chỉnh sửa ghi chú này', 401)
  }

  // Lấy ghi chú từ DB để kiểm tra quyền sở hữu
  const note = await env.DB
    .prepare('SELECT id, edit_token_hash FROM notes WHERE id = ?')
    .bind(id)
    .first<{ id: number; edit_token_hash: string }>()

  if (!note) {
    return jsonError('Không tìm thấy ghi chú', 404)
  }

  const secret = env.ADMIN_SECRET || 'portfolio_notes_salt_key'
  const providedHash = await sha256Hex(editToken, secret)

  if (providedHash !== note.edit_token_hash) {
    return jsonError('Bạn không có quyền di chuyển ghi chú này', 403)
  }

  const xPercent = typeof body.x_percent === 'number'
    ? Math.max(0, Math.min(92, body.x_percent))
    : null
  const yPercent = typeof body.y_percent === 'number'
    ? Math.max(0, Math.min(92, body.y_percent))
    : null

  if (xPercent === null || yPercent === null) {
    return jsonError('Thiếu tọa độ vị trí x_percent / y_percent')
  }

  await env.DB
    .prepare('UPDATE notes SET x_percent = ?, y_percent = ? WHERE id = ?')
    .bind(xPercent, yPercent, id)
    .run()

  return jsonOk({ ok: true, x_percent: xPercent, y_percent: yPercent })
}

/* ── DELETE /api/notes/[id] ────────────────────────────────── */
export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = Number(params.id)
  if (!id || isNaN(id)) return jsonError('ID ghi chú không hợp lệ')

  // Lấy edit_token từ URL search params hoặc header hoặc body
  const url = new URL(request.url)
  let editToken = url.searchParams.get('edit_token') ?? request.headers.get('X-Edit-Token')

  if (!editToken) {
    try {
      const body = await request.json() as { edit_token?: string }
      editToken = body.edit_token ?? null
    } catch {
      // Body có thể trống nếu dùng header/param
    }
  }

  if (!editToken) {
    return jsonError('Thiếu edit_token để xoá ghi chú', 401)
  }

  const note = await env.DB
    .prepare('SELECT id, edit_token_hash FROM notes WHERE id = ?')
    .bind(id)
    .first<{ id: number; edit_token_hash: string }>()

  if (!note) {
    return jsonError('Không tìm thấy ghi chú', 404)
  }

  const secret = env.ADMIN_SECRET || 'portfolio_notes_salt_key'
  const providedHash = await sha256Hex(editToken, secret)

  if (providedHash !== note.edit_token_hash) {
    return jsonError('Bạn không có quyền xoá ghi chú này', 403)
  }

  await env.DB
    .prepare('DELETE FROM notes WHERE id = ?')
    .bind(id)
    .run()

  return jsonOk({ ok: true, deleted_id: id })
}
