/**
 * PUT    /api/admin/projects/[id]   – cập nhật project
 * DELETE /api/admin/projects/[id]   – xoá project
 */
import { type Env, requireAdmin, jsonOk, jsonError } from '../_auth'

function sanitize(val: unknown, maxLen = 1000): string {
  return String(val ?? '').slice(0, maxLen)
}

/* ── PUT ──────────────────────────────────────────────────── */
export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const err = await requireAdmin(request, env)
  if (err) return err

  const id = Number(params.id)
  if (!id || isNaN(id)) return jsonError('ID không hợp lệ')

  let body: Record<string, unknown>
  try { body = await request.json() as Record<string, unknown> }
  catch { return jsonError('Invalid JSON') }

  const fields: Record<string, unknown> = {}
  const stringFields = ['title','description','icon_key','repo_url','demo_url'] as const
  for (const key of stringFields) {
    if (key in body) {
      const max = key === 'title' ? 200
                : key === 'description' ? 500
                : key.endsWith('url') ? 500 : 100
      fields[key] = sanitize(body[key], max)
    }
  }
  if ('tech_tags' in body) {
    const tags = Array.isArray(body.tech_tags) ? body.tech_tags : []
    fields['tech_tags'] = JSON.stringify(
      tags.map((t: unknown) => sanitize(t, 50)).slice(0, 20)
    )
  }
  if ('is_visible' in body) {
    fields['is_visible'] = body.is_visible === false || body.is_visible === 0 ? 0 : 1
  }
  if ('sort_order' in body) {
    fields['sort_order'] = Math.max(0, Math.min(9999, Number(body.sort_order) || 0))
  }

  if (Object.keys(fields).length === 0) return jsonError('Không có trường nào để cập nhật')

  const sets = Object.keys(fields).map(k => `${k} = ?`).join(', ')
  const vals = [...Object.values(fields), id]
  const { meta } = await env.DB
    .prepare(`UPDATE projects SET ${sets} WHERE id = ?`)
    .bind(...vals)
    .run()

  if (meta.changes === 0) return jsonError('Không tìm thấy dự án', 404)
  return jsonOk({ ok: true })
}

/* ── DELETE ───────────────────────────────────────────────── */
export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const err = await requireAdmin(request, env)
  if (err) return err

  const id = Number(params.id)
  if (!id || isNaN(id)) return jsonError('ID không hợp lệ')

  const { meta } = await env.DB
    .prepare('DELETE FROM projects WHERE id = ?')
    .bind(id)
    .run()

  if (meta.changes === 0) return jsonError('Không tìm thấy dự án', 404)
  return jsonOk({ ok: true })
}
