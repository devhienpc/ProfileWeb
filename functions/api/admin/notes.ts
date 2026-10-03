/**
 * GET /api/admin/notes
 * Lấy toàn bộ danh sách ghi chú (bao gồm cả note bị ẩn) cho Admin
 */
import { type Env, requireAdmin, jsonOk, jsonError } from './_auth'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const err = await requireAdmin(request, env)
  if (err) return err

  try {
    const { results } = await env.DB
      .prepare(`
        SELECT id, author_name, content, color, x_percent, y_percent, rotation, is_hidden, created_at,
               SUBSTR(ip_hash, 1, 8) || '...' || SUBSTR(ip_hash, -4) as ip_preview
        FROM notes
        ORDER BY created_at DESC
      `)
      .all()

    return jsonOk({ notes: results ?? [] })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Database error'
    return jsonError(msg, 500)
  }
}
