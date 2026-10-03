/**
 * Shared auth utilities for admin API endpoints.
 * HMAC-based token, cookie HttpOnly + Secure + SameSite=Strict.
 * Token expires after 12 hours.
 */

export interface Env {
  DB: D1Database
  ADMIN_PASSWORD: string
  ADMIN_SECRET: string
}

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000   // 12h
const COOKIE_NAME  = 'admin_token'

/* ── HMAC helpers ──────────────────────────────────────────── */
async function hmacSign(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function hmacVerify(secret: string, data: string, sig: string): Promise<boolean> {
  try {
    const expected = await hmacSign(secret, data)
    return expected === sig
  } catch { return false }
}

export async function sha256Hex(data: string, salt: string): Promise<string> {
  const encoder = new TextEncoder()
  const buf = await crypto.subtle.digest('SHA-256', encoder.encode(data + '::' + salt))
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/* ── Token ─────────────────────────────────────────────────── */
export async function createToken(secret: string): Promise<string> {
  const exp  = Date.now() + TOKEN_TTL_MS
  const data = `admin:${exp}`
  const sig  = await hmacSign(secret, data)
  return `${data}.${sig}`
}

export async function verifyToken(secret: string, token: string): Promise<boolean> {
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [data, sig] = parts
  if (!(await hmacVerify(secret, data, sig))) return false
  const exp = parseInt(data.split(':')[1] ?? '0', 10)
  return Date.now() < exp
}

/* ── Extract token from cookie ─────────────────────────────── */
export function getTokenFromRequest(req: Request): string | null {
  const cookie = req.headers.get('Cookie') ?? ''
  for (const part of cookie.split(';')) {
    const [k, v] = part.trim().split('=')
    if (k === COOKIE_NAME && v) return decodeURIComponent(v)
  }
  return null
}

/* ── Validate admin request ────────────────────────────────── */
export async function requireAdmin(
  req: Request,
  env: Env,
): Promise<Response | null> {
  const token = getTokenFromRequest(req)
  if (!token) return unauthorizedResponse()
  const ok = await verifyToken(env.ADMIN_SECRET, token)
  if (!ok) return unauthorizedResponse()
  return null   // null = authenticated
}

function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function setCookieHeader(token: string): string {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${TOKEN_TTL_MS / 1000}`
}

export function clearCookieHeader(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
}

/* ── JSON helpers ──────────────────────────────────────────── */
export function jsonOk(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function jsonError(msg: string, status = 400): Response {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/* ── Rate limiter (in-memory, per isolate, best effort) ─────── */
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS   = 5
const WINDOW_MS      = 15 * 60 * 1000   // 15 min

export function checkRateLimit(ip: string): boolean {
  const now  = Date.now()
  const data = loginAttempts.get(ip)
  if (!data || now > data.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (data.count >= MAX_ATTEMPTS) return false
  data.count++
  return true
}

export function resetRateLimit(ip: string): void {
  loginAttempts.delete(ip)
}
