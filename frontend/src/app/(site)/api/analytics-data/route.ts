import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'not configured' }, { status: 503 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [sessionsRes, eventsRes] = await Promise.all([
    supabase
      .from('analytics_sessions')
      .select('id, created_at, locale, device_type')
      .order('created_at', { ascending: false })
      .limit(50000),
    supabase
      .from('analytics_events')
      .select('id, event_type, event_data, created_at')
      .order('created_at', { ascending: false })
      .limit(100000),
  ])

  if (sessionsRes.error) {
    return NextResponse.json({ error: sessionsRes.error.message }, { status: 500 })
  }

  const sessions = sessionsRes.data ?? []
  const events = eventsRes.data ?? []

  const totalSessions = sessions.length
  const sessionsToday = sessions.filter((s) => s.created_at?.startsWith(todayStr)).length
  const sessionsThisWeek = sessions.filter((s) => s.created_at >= weekAgo).length
  const sessionsThisMonth = sessions.filter((s) => s.created_at >= monthStart).length
  const totalEvents = events.length

  const dailyMap: Record<string, number> = {}
  sessions
    .filter((s) => s.created_at >= thirtyDaysAgo)
    .forEach((s) => {
      const day = s.created_at.slice(0, 10)
      dailyMap[day] = (dailyMap[day] ?? 0) + 1
    })
  const dailySessions = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))

  const eventTypeMap: Record<string, number> = {}
  events.forEach((e) => {
    const t = e.event_type ?? 'unknown'
    eventTypeMap[t] = (eventTypeMap[t] ?? 0) + 1
  })
  const eventTypes = Object.entries(eventTypeMap)
    .sort(([, a], [, b]) => b - a)
    .map(([event_type, count]) => ({ event_type, count }))

  const fundMap: Record<string, { name: string; views: number }> = {}
  events
    .filter((e) => e.event_type === 'fund_view')
    .forEach((e) => {
      const ticker = (e.event_data as Record<string, string>)?.ticker ?? 'unknown'
      const name = (e.event_data as Record<string, string>)?.name ?? ticker
      if (!fundMap[ticker]) fundMap[ticker] = { name, views: 0 }
      fundMap[ticker].views++
    })
  const topFunds = Object.entries(fundMap)
    .sort(([, a], [, b]) => b.views - a.views)
    .slice(0, 10)
    .map(([ticker, { name, views }]) => ({ ticker, name, views }))

  const searchMap: Record<string, number> = {}
  events
    .filter((e) => e.event_type === 'search_query')
    .forEach((e) => {
      const query = ((e.event_data as Record<string, string>)?.query ?? '').toLowerCase().trim()
      if (query) searchMap[query] = (searchMap[query] ?? 0) + 1
    })
  const topSearches = Object.entries(searchMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([query, count]) => ({ query, count }))

  let mobile = 0
  let desktop = 0
  sessions.forEach((s) => {
    if (s.device_type === 'mobile') mobile++
    else desktop++
  })
  const deviceBreakdown = [
    { device: 'Mobile', count: mobile },
    { device: 'Desktop', count: desktop },
  ].filter((d) => d.count > 0)

  const localeMap: Record<string, number> = {}
  sessions.forEach((s) => {
    const l = s.locale ?? 'unknown'
    localeMap[l] = (localeMap[l] ?? 0) + 1
  })
  const localeBreakdown = Object.entries(localeMap)
    .sort(([, a], [, b]) => b - a)
    .map(([locale, count]) => ({ locale, count }))

  return NextResponse.json({
    overview: { totalSessions, sessionsToday, sessionsThisWeek, sessionsThisMonth, totalEvents },
    dailySessions,
    eventTypes,
    topFunds,
    topSearches,
    deviceBreakdown,
    localeBreakdown,
  })
}
