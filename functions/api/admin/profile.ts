/**
 * Admin CRUD for profile (singleton row id=1)
 * GET    /api/admin/profile  – lấy profile hiện tại
 * PUT    /api/admin/profile  – cập nhật profile
 */
import { type Env, requireAdmin, jsonOk, jsonError } from './_auth'

const MAX_LEN = 500

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const err = await requireAdmin(request, env)
  if (err) return err
  const row = await env.DB.prepare('SELECT * FROM profile WHERE id = 1').first()
  return jsonOk(row ?? {})
}

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  const err = await requireAdmin(request, env)
  if (err) return err

  let body: Record<string, unknown>
  try { body = await request.json() as Record<string, unknown> }
  catch { return jsonError('Invalid JSON') }

  const fields: Record<string, unknown> = {}
  const allowed = [
    'full_name','display_name','badge','location','age',
    'school','major','year_level','birthday','quote','avatar_url','cv_url',
  ] as const

  for (const key of allowed) {
    if (key in body) {
      const val = body[key]
      if (key === 'age') {
        fields[key] = Math.max(0, Math.min(120, Number(val) || 0))
      } else {
        const str = String(val ?? '').slice(0, MAX_LEN)
        fields[key] = str
      }
    }
  }

  if (Object.keys(fields).length === 0) return jsonError('Không có trường nào để cập nhật')

  const sets  = Object.keys(fields).map(k => `${k} = ?`).join(', ')
  const vals  = [...Object.values(fields), 1]   // 1 = WHERE id = 1
  await env.DB.prepare(`UPDATE profile SET ${sets} WHERE id = ?`).bind(...vals).run()

  return jsonOk({ ok: true })
}
