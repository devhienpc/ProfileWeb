/**
 * PUT    /api/admin/socials/[id]
 * DELETE /api/admin/socials/[id]
 */
import { type Env, requireAdmin, jsonOk, jsonError } from '../_auth'

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const err = await requireAdmin(request, env)
  if (err) return err

  const id = Number(params.id)
  if (!id || isNaN(id)) return jsonError('ID không hợp lệ')

  let body: Record<string, unknown>
  try { body = await request.json() as Record<string, unknown> }
  catch { return jsonError('Invalid JSON') }

  const fields: Record<string, unknown> = {}
  if ('platform'   in body) fields['platform']   = String(body.platform   ?? '').slice(0, 50)
  if ('url'        in body) fields['url']         = String(body.url        ?? '').slice(0, 500)
  if ('sort_order' in body) fields['sort_order']  = Math.max(0, Number(body.sort_order) || 0)

  if (Object.keys(fields).length === 0) return jsonError('Không có trường nào')

  const sets = Object.keys(fields).map(k => `${k} = ?`).join(', ')
  await env.DB
    .prepare(`UPDATE socials SET ${sets} WHERE id = ?`)
    .bind(...Object.values(fields), id).run()

  return jsonOk({ ok: true })
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const err = await requireAdmin(request, env)
  if (err) return err
  const id = Number(params.id)
  if (!id || isNaN(id)) return jsonError('ID không hợp lệ')
  await env.DB.prepare('DELETE FROM socials WHERE id = ?').bind(id).run()
  return jsonOk({ ok: true })
}
