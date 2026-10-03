/**
 * usePortfolioData – fetch /api/profile và trả về data + loading + error states.
 * Có skeleton loading và retry logic.
 */
import { useState, useEffect } from 'react'
import type { ApiData } from '../types/api'

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
        return res.json() as Promise<ApiData>
      })
      .then(json => {
        if (!cancelled) {
          setData(json)
          setLoading(false)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message ?? 'Không thể tải dữ liệu')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [tick])

  return { data, loading, error, refetch }
}
