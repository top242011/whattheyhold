/**
 * Fetch SiteSettings global from Payload CMS.
 * Returns null gracefully if Payload is not yet configured or seeded.
 */

type SiteSettings = {
  heroTickers: { ticker: string }[]
  announcement: string | null
  maintenanceMode: boolean
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const url = `${baseUrl}/cms-api/globals/site-settings`

    const res = await fetch(url, {
      next: { revalidate: 3600 },
    })

    if (!res.ok) return null

    const data = await res.json()
    return data as SiteSettings
  } catch {
    return null
  }
}
