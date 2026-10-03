/**
 * PUT / DELETE /api/admin/notes/[id]
 * PUT    – Ẩn/Hiện ghi chú (toggle is_hidden)
 * DELETE – Xoá vĩnh viễn ghi chú
 */
import { type Env, requireAdmin, jsonOk, jsonError } from '../_auth'

/* ── PUT /api/admin/notes/[id] ─────────────────────────────── */
export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const err = await requireAdmin(request, env)
  if (err) return err

  const id = Number(params.id)
  if (!id || isNaN(id)) return jsonError('ID không hợp lệ')

  let body: { is_hidden?: unknown }
  try {
    body = await request.json() as typeof body
  } catch {
    return jsonError('Invalid JSON')
  }

  const isHidden = body.is_hidden === 1 || body.is_hidden === true ? 1 : 0

  const { meta } = await env.DB
    .prepare('UPDATE notes SET is_hidden = ? WHERE id = ?')
    .bind(isHidden, id)
    .run()

  if (meta.changes === 0) return jsonError('Không tìm thấy ghi chú', 404)
  return jsonOk({ ok: true, id, is_hidden: isHidden })
}

/* ── DELETE /api/admin/notes/[id] ──────────────────────────── */
export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const err = await requireAdmin(request, env)
  if (err) return err

  const id = Number(params.id)
  if (!id || isNaN(id)) return jsonError('ID không hợp lệ')

  const { meta } = await env.DB
    .prepare('DELETE FROM notes WHERE id = ?')
    .bind(id)
    .run()

  if (meta.changes === 0) return jsonError('Không tìm thấy ghi chú', 404)
  return jsonOk({ ok: true, deleted_id: id })
}
