/**
 * GET /api/profile
 * Trả về toàn bộ profile + socials + skills + projects trong 1 request.
 * Cache-Control: 60 giây.
 */

export interface Env {
  DB: D1Database
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const db = env.DB

    const [profileRow, socialsRows, skillsRows, projectsRows] = await Promise.all([
      db.prepare('SELECT * FROM profile WHERE id = 1').first(),
      db.prepare('SELECT * FROM socials ORDER BY sort_order ASC').all(),
      db.prepare('SELECT * FROM skills ORDER BY category ASC, sort_order ASC').all(),
      db.prepare(
        'SELECT * FROM projects WHERE is_visible = 1 ORDER BY sort_order ASC'
      ).all(),
    ])

    if (!profileRow) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Parse tech_tags JSON string → array
    const projects = (projectsRows.results ?? []).map((p: Record<string, unknown>) => ({
      ...p,
      tech_tags: (() => {
        try { return JSON.parse(p.tech_tags as string) }
        catch { return [] }
      })(),
    }))

    const body = JSON.stringify({
      profile:  profileRow,
      socials:  socialsRows.results  ?? [],
      skills:   skillsRows.results   ?? [],
      projects,
    })

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type':  'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=60',
      },
    })
  } catch (err) {
    console.error('[GET /api/profile]', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
