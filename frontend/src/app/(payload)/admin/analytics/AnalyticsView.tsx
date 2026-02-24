'use client'

import { useEffect, useState } from 'react'
import { AnalyticsDashboardView } from './AnalyticsDashboard'

type AnalyticsData = React.ComponentProps<typeof AnalyticsDashboardView>

export function AnalyticsView() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/analytics-data')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setData(d)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ padding: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Analytics Dashboard</h1>
        <p style={{ color: '#6b7280' }}>Loading analytics data…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={{ padding: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Analytics Dashboard</h1>
        <div
          style={{
            background: '#fefce8',
            border: '1px solid #fde047',
            borderRadius: 12,
            padding: 24,
          }}
        >
          <p style={{ fontWeight: 600, color: '#854d0e' }}>Could not load analytics</p>
          <p style={{ color: '#713f12', fontSize: 14, marginTop: 4 }}>
            {error ?? 'Unknown error. Check that SUPABASE_SERVICE_ROLE_KEY is set in .env.local.'}
          </p>
        </div>
      </div>
    )
  }

  return <AnalyticsDashboardView {...data} />
}
