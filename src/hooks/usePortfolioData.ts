/**
 * usePortfolioData – fetch /api/profile và trả về data + loading + error states.
 * Có skeleton loading và retry logic.
 */
import { useState, useEffect } from 'react'
import type { ApiData } from '../types/api'

import {
  profile as defaultProfile,
  socials as defaultSocials,
  skillGroups as defaultSkillGroups,
  projects as defaultProjects,
} from '../data/profile'

const fallbackData: ApiData = {
  profile: {
    id: 1,
    full_name: defaultProfile.name,
    display_name: defaultProfile.nameEn,
    badge: defaultProfile.badge,
    location: defaultProfile.location,
    age: defaultProfile.age,
    school: defaultProfile.school,
    major: defaultProfile.major,
    year_level: defaultProfile.yearLevel,
    birthday: defaultProfile.born,
    quote: defaultProfile.quote,
    avatar_url: defaultProfile.avatar,
    cv_url: defaultProfile.cvUrl,
  },
  socials: defaultSocials.map((s, idx) => ({
    id: idx + 1,
    platform: s.label.toLowerCase(),
    url: s.href,
    sort_order: idx + 1,
  })),
  skills: defaultSkillGroups.flatMap((group, gIdx) =>
    group.skills.map((sk, sIdx) => ({
      id: gIdx * 100 + sIdx + 1,
      category: group.category.includes('Ngôn ngữ') ? 'language' : 'tool',
      name: sk.name,
      icon_key: sk.name.toLowerCase(),
      color: sk.color ?? '#1E90FF',
      sort_order: sIdx + 1,
    }))
  ),
  projects: defaultProjects.map((p, idx) => ({
    id: idx + 1,
    title: p.name,
    description: p.description,
    tech_tags: p.tags,
    icon_key: p.emoji,
    repo_url: p.href,
    demo_url: p.href,
    sort_order: idx + 1,
    is_visible: 1,
  })),
}

interface UsePortfolioDataResult {
  data:    ApiData | null
  loading: boolean
  error:   string | null
  refetch: () => void
}

export function usePortfolioData(): UsePortfolioDataResult {
  const [data,    setData]    = useState<ApiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [tick,    setTick]    = useState(0)

  const refetch = () => setTick(t => t + 1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch('/api/profile')
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`)
        const contentType = res.headers.get('content-type') || ''
        if (!contentType.includes('application/json')) throw new Error('Not JSON response')
        return res.json() as Promise<ApiData>
      })
      .then(json => {
        if (!cancelled) {
          setData(json)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          // Graceful fallback to rich local profile dataset
          setData(fallbackData)
          setError(null)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [tick])

  return { data, loading, error, refetch }
}
