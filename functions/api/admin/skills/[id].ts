/** PUT/DELETE /api/admin/skills/[id] */
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
  if ('category'   in body) fields['category']   = String(body.category   ?? '').slice(0, 20)
  if ('name'       in body) fields['name']        = String(body.name       ?? '').slice(0, 100)
  if ('icon_key'   in body) fields['icon_key']    = String(body.icon_key   ?? '').slice(0, 50)
  if ('color'      in body) fields['color']       = String(body.color      ?? '').slice(0, 20)
  if ('sort_order' in body) fields['sort_order']  = Math.max(0, Number(body.sort_order) || 0)

  if (Object.keys(fields).length === 0) return jsonError('Không có trường nào')
  const sets = Object.keys(fields).map(k => `${k} = ?`).join(', ')
  await env.DB.prepare(`UPDATE skills SET ${sets} WHERE id = ?`)
    .bind(...Object.values(fields), id).run()
  return jsonOk({ ok: true })
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const err = await requireAdmin(request, env)
  if (err) return err
  const id = Number(params.id)
  if (!id || isNaN(id)) return jsonError('ID không hợp lệ')
  await env.DB.prepare('DELETE FROM skills WHERE id = ?').bind(id).run()
  return jsonOk({ ok: true })
}
