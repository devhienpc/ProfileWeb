/**
 * POST /api/admin/login
 * Body: { password: string }
 * Trả về Set-Cookie với token HMAC nếu đúng mật khẩu.
 */
import {
  type Env,
  createToken,
  setCookieHeader,
  jsonOk,
  jsonError,
  checkRateLimit,
  resetRateLimit,
} from './_auth'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const ip = request.headers.get('CF-Connecting-IP')
    ?? request.headers.get('X-Forwarded-For')
    ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: 'Quá nhiều lần thử. Vui lòng thử lại sau 15 phút.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  let body: { password?: unknown }
  try {
    body = await request.json() as { password?: unknown }
  } catch {
    return jsonError('Invalid JSON')
  }

  const password = typeof body.password === 'string' ? body.password : ''
  if (!password) return jsonError('Thiếu mật khẩu')

  const correctPassword = env.ADMIN_PASSWORD
  if (!correctPassword) {
    return jsonError('Server chưa cấu hình ADMIN_PASSWORD', 500)
  }

  if (password !== correctPassword) {
    return jsonError('Mật khẩu không đúng', 401)
  }

  const secret = env.ADMIN_SECRET
  if (!secret) return jsonError('Server chưa cấu hình ADMIN_SECRET', 500)

  resetRateLimit(ip)
  const token = await createToken(secret)

  const res = jsonOk({ ok: true })
  const headers = new Headers(res.headers)
  headers.set('Set-Cookie', setCookieHeader(token))

  return new Response(res.body, { status: 200, headers })
}

/** POST /api/admin/logout – xoá cookie */
export const onRequestDelete: PagesFunction<Env> = async () => {
  const headers = new Headers({ 'Content-Type': 'application/json' })
  headers.set('Set-Cookie',
    'admin_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0')
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
}
