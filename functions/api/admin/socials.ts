/**
 * Admin CRUD for socials
 * GET  /api/admin/socials        – list all
 * POST /api/admin/socials        – thêm mới
 * PUT  /api/admin/socials/[id]   – cập nhật
 * DELETE /api/admin/socials/[id] – xoá
 */
import { type Env, requireAdmin, jsonOk, jsonError } from './_auth'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const err = await requireAdmin(request, env)
  if (err) return err
  const { results } = await env.DB
    .prepare('SELECT * FROM socials ORDER BY sort_order ASC').all()
  return jsonOk(results ?? [])
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const err = await requireAdmin(request, env)
  if (err) return err

  let body: Record<string, unknown>
  try { body = await request.json() as Record<string, unknown> }
  catch { return jsonError('Invalid JSON') }

  const platform = String(body.platform ?? '').slice(0, 50)
  const url      = String(body.url ?? '').slice(0, 500)
  if (!platform) return jsonError('Thiếu platform')
  if (!url)      return jsonError('Thiếu URL')

  const maxRow = await env.DB
    .prepare('SELECT MAX(sort_order) as m FROM socials').first<{ m: number | null }>()
  const sort_order = (maxRow?.m ?? 0) + 1

  const { meta } = await env.DB
    .prepare('INSERT INTO socials (platform, url, sort_order) VALUES (?, ?, ?)')
    .bind(platform, url, sort_order).run()

  return jsonOk({ ok: true, id: meta.last_row_id })
}
