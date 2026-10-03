/**
 * Admin CRUD for skills
 * GET  /api/admin/skills        – list all
 * POST /api/admin/skills        – thêm
 * PUT  /api/admin/skills/[id]   – cập nhật
 * DELETE /api/admin/skills/[id] – xoá
 */
import { type Env, requireAdmin, jsonOk, jsonError } from './_auth'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const err = await requireAdmin(request, env)
  if (err) return err
  const { results } = await env.DB
    .prepare('SELECT * FROM skills ORDER BY category, sort_order').all()
  return jsonOk(results ?? [])
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const err = await requireAdmin(request, env)
  if (err) return err

  let body: Record<string, unknown>
  try { body = await request.json() as Record<string, unknown> }
  catch { return jsonError('Invalid JSON') }

  const category = String(body.category ?? '').slice(0, 20)
  const name     = String(body.name     ?? '').slice(0, 100)
  const icon_key = String(body.icon_key ?? '').slice(0, 50)
  const color    = String(body.color    ?? '').slice(0, 20)

  if (!category) return jsonError('Thiếu category')
  if (!name)     return jsonError('Thiếu tên kỹ năng')

  const maxRow = await env.DB
    .prepare('SELECT MAX(sort_order) as m FROM skills WHERE category = ?')
    .bind(category).first<{ m: number | null }>()
  const sort_order = (maxRow?.m ?? 0) + 1

  const { meta } = await env.DB
    .prepare('INSERT INTO skills (category, name, icon_key, color, sort_order) VALUES (?,?,?,?,?)')
    .bind(category, name, icon_key, color, sort_order).run()

  return jsonOk({ ok: true, id: meta.last_row_id })
}
