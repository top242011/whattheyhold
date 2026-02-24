'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AnalyticsNavLink() {
  const pathname = usePathname()
  const isActive = pathname === '/admin/analytics'

  return (
    <div style={{ padding: '0 8px', marginTop: 4 }}>
      <Link
        href="/admin/analytics"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 12px',
          borderRadius: 6,
          fontSize: 14,
          fontWeight: isActive ? 600 : 400,
          color: isActive ? 'var(--theme-success-500, #22c55e)' : 'inherit',
          background: isActive ? 'var(--theme-success-100, rgba(34,197,94,0.1))' : 'transparent',
          textDecoration: 'none',
          transition: 'background 0.15s',
        }}
      >
        <span style={{ fontSize: 16 }}>📊</span>
        Analytics
      </Link>
    </div>
  )
}
