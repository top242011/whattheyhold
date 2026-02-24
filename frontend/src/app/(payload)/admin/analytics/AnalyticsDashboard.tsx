'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DailySession {
  date: string
  count: number
}

interface FundView {
  ticker: string
  name: string
  views: number
}

interface SearchQuery {
  query: string
  count: number
}

interface EventTypeCount {
  event_type: string
  count: number
}

interface DeviceBreakdown {
  device: string
  count: number
}

interface LocaleBreakdown {
  locale: string
  count: number
}

interface OverviewStats {
  totalSessions: number
  sessionsToday: number
  sessionsThisWeek: number
  sessionsThisMonth: number
  totalEvents: number
}

interface AnalyticsDashboardProps {
  overview: OverviewStats
  dailySessions: DailySession[]
  eventTypes: EventTypeCount[]
  topFunds: FundView[]
  topSearches: SearchQuery[]
  deviceBreakdown: DeviceBreakdown[]
  localeBreakdown: LocaleBreakdown[]
}

const COLORS = ['#47b4eb', '#b2f2bb', '#e0c3fc', '#fbbf24', '#f87171', '#34d399', '#a78bfa']

export function AnalyticsDashboardView({
  overview,
  dailySessions,
  eventTypes,
  topFunds,
  topSearches,
  deviceBreakdown,
  localeBreakdown,
}: AnalyticsDashboardProps) {
  return (
    <div className="custom-dashboard">
      <div className="custom-dashboard-header">
        <h1>Analytics Dashboard</h1>
        <p style={{ color: 'var(--theme-text-dim)' }}>
          Anonymous usage data from WhatTheyHold visitors
        </p>
      </div>

      <div className="analytics-hero">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Total Sessions', value: overview.totalSessions.toLocaleString() },
            { label: 'Today', value: overview.sessionsToday.toLocaleString() },
            { label: 'This Week', value: overview.sessionsThisWeek.toLocaleString() },
            { label: 'This Month', value: overview.sessionsThisMonth.toLocaleString() },
            { label: 'Total Events', value: overview.totalEvents.toLocaleString() },
          ].map((card) => (
            <div key={card.label} className="analytics-stat-card">
              <p style={{ color: 'var(--theme-text-dim)', fontSize: '0.875rem' }}>{card.label}</p>
              <p className="analytics-stat-value">{card.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Sessions over time */}
        <div className="custom-card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Sessions — Last 30 Days</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dailySessions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="count" stroke="#18181b" strokeWidth={2} dot={false} name="Sessions" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Top 10 funds viewed */}
        <div className="custom-card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Top 10 Funds Viewed</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topFunds} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis type="number" tick={{ fill: '#71717a', fontSize: 11 }} />
              <YAxis dataKey="ticker" type="category" tick={{ fill: '#71717a', fontSize: 11 }} width={60} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '8px' }} formatter={(value, _name, props) => [value, props.payload?.name || 'Views']} />
              <Bar dataKey="views" fill="#a1a1aa" name="Views" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Events by type */}
        <div className="custom-card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Events by Type</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={eventTypes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis type="number" tick={{ fill: '#71717a', fontSize: 11 }} />
              <YAxis dataKey="event_type" type="category" tick={{ fill: '#71717a', fontSize: 11 }} width={110} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '8px' }} />
              <Bar dataKey="count" fill="#18181b" name="Count" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="custom-card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Device Breakdown</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={deviceBreakdown} dataKey="count" nameKey="device" cx="50%" cy="50%" outerRadius={60} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {deviceBreakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="custom-card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Locale Breakdown</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={localeBreakdown} dataKey="count" nameKey="locale" cx="50%" cy="50%" outerRadius={60} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {localeBreakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="custom-card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Top Search Queries</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #e4e4e7' }}>
                <th style={{ paddingBottom: '0.5rem', paddingRight: '1rem', color: '#71717a', fontWeight: 500 }}>#</th>
                <th style={{ paddingBottom: '0.5rem', paddingRight: '1rem', color: '#71717a', fontWeight: 500 }}>Query</th>
                <th style={{ paddingBottom: '0.5rem', color: '#71717a', fontWeight: 500, textAlign: 'right' }}>Count</th>
              </tr>
            </thead>
            <tbody>
              {topSearches.map((row, i) => (
                <tr key={row.query} style={{ borderBottom: '1px solid #f4f4f5' }}>
                  <td style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingRight: '1rem', color: '#a1a1aa' }}>{i + 1}</td>
                  <td style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingRight: '1rem', fontFamily: 'monospace', color: '#3f3f46' }}>{row.query}</td>
                  <td style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#18181b' }}>{row.count.toLocaleString()}</td>
                </tr>
              ))}
              {topSearches.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem', textAlign: 'center', color: '#a1a1aa' }}>
                    No search queries recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
