/**
 * Admin CRUD for projects
 * GET    /api/admin/projects           – list all (kể cả hidden)
 * POST   /api/admin/projects           – thêm mới
 * PUT    /api/admin/projects/[id]      – cập nhật
 * DELETE /api/admin/projects/[id]      – xoá
 */
import { type Env, requireAdmin, jsonOk, jsonError } from './_auth'

const MAX_STR = 1000

function sanitize(val: unknown, maxLen = MAX_STR): string {
  return String(val ?? '').slice(0, maxLen)
}

/* ── GET – list all projects ─────────────────────────────── */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const err = await requireAdmin(request, env)
  if (err) return err

  const { results } = await env.DB
    .prepare('SELECT * FROM projects ORDER BY sort_order ASC')
    .all()

  const projects = (results ?? []).map((p: Record<string, unknown>) => ({
    ...p,
    tech_tags: (() => {
      try { return JSON.parse(p.tech_tags as string) }
      catch { return [] }
    })(),
  }))

  return jsonOk(projects)
}

/* ── POST – create project ───────────────────────────────── */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const err = await requireAdmin(request, env)
  if (err) return err

  let body: Record<string, unknown>
  try { body = await request.json() as Record<string, unknown> }
  catch { return jsonError('Invalid JSON') }

  const title = sanitize(body.title, 200)
  if (!title) return jsonError('Tên dự án không được trống')

  const description = sanitize(body.description, 500)
  const tech_tags   = (() => {
    const tags = Array.isArray(body.tech_tags) ? body.tech_tags : []
    return JSON.stringify(tags.map((t: unknown) => sanitize(t, 50)).slice(0, 20))
  })()
  const icon_key    = sanitize(body.icon_key, 50)
  const repo_url    = sanitize(body.repo_url, 500)
  const demo_url    = sanitize(body.demo_url, 500)
  const is_visible  = body.is_visible === false || body.is_visible === 0 ? 0 : 1

  // sort_order = max + 1
  const maxRow = await env.DB
    .prepare('SELECT MAX(sort_order) as m FROM projects')
    .first<{ m: number | null }>()
  const sort_order = (maxRow?.m ?? 0) + 1

  const { meta } = await env.DB.prepare(
    `INSERT INTO projects
      (title, description, tech_tags, icon_key, repo_url, demo_url, sort_order, is_visible)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(title, description, tech_tags, icon_key, repo_url, demo_url, sort_order, is_visible)
   .run()

  return jsonOk({ ok: true, id: meta.last_row_id })
}
