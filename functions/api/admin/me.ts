/**
 * GET  /api/admin/me  – kiểm tra session còn hợp lệ không
 */
import { type Env, requireAdmin, jsonOk } from './_auth'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const err = await requireAdmin(request, env)
  if (err) return err
  return jsonOk({ authenticated: true })
}
