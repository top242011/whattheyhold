/**
 * Utilities for fetching content from Payload CMS via the Local API.
 * Uses try/catch with a null fallback so pages degrade gracefully if
 * the Payload DB is unavailable or not yet seeded.
 */

// Minimal type for a Lexical rich text node tree
type LexicalNode = {
  type: string
  tag?: string
  text?: string
  format?: number
  children?: LexicalNode[]
  direction?: string
  indent?: number
  version?: number
}

type LexicalRoot = {
  root: LexicalNode
}

type LegalPageData = {
  id: string
  slug: string
  language: string
  title: string
  content: LexicalRoot | null
  lastUpdated: string | null
}

/**
 * Fetch a legal page document from Payload CMS via its REST API.
 * Falls back to null if Payload is not configured or the document doesn't exist.
 */
export async function getLegalPageContent(
  slug: 'privacy-policy' | 'terms-of-service',
  language: 'en' | 'th' = 'en'
): Promise<LegalPageData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Query Payload CMS REST API at /cms-api (configured in payload.config.ts routes.api)
    const url = `${baseUrl}/cms-api/legal-pages?where[slug][equals]=${slug}&where[language][equals]=${language}&limit=1`

    const res = await fetch(url, {
      next: { revalidate: 3600 },
    })

    if (!res.ok) return null

    const json = await res.json()
    const doc = json?.docs?.[0]
    if (!doc) return null

    return doc as LegalPageData
  } catch {
    return null
  }
}

/**
 * Convert a Payload Lexical rich text tree to safe HTML string.
 * Handles basic node types: paragraph, heading, text, list, listitem.
 * This is intentionally minimal — use @payloadcms/richtext-lexical's
 * React renderer for full fidelity in a proper setup.
 */
export function renderLexicalToText(root: LexicalRoot | null): string {
  if (!root?.root) return ''
  return renderNode(root.root)
}

function renderNode(node: LexicalNode): string {
  if (!node) return ''

  const children = node.children?.map(renderNode).join('') ?? ''

  switch (node.type) {
    case 'root':
      return children

    case 'paragraph':
      return `<p class="mb-4">${children}</p>`

    case 'heading': {
      const tag = node.tag ?? 'h2'
      const sizeMap: Record<string, string> = {
        h1: 'text-3xl font-bold',
        h2: 'text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4',
        h3: 'text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-3',
        h4: 'text-lg font-semibold mt-4 mb-2',
      }
      const cls = sizeMap[tag] ?? ''
      return `<${tag} class="${cls}">${children}</${tag}>`
    }

    case 'text': {
      let text = escapeHtml(node.text ?? '')
      const fmt = node.format ?? 0
      if (fmt & 1) text = `<strong>${text}</strong>`
      if (fmt & 2) text = `<em>${text}</em>`
      if (fmt & 8) text = `<u>${text}</u>`
      if (fmt & 16) text = `<s>${text}</s>`
      if (fmt & 32) text = `<code class="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">${text}</code>`
      return text
    }

    case 'list': {
      const tag = node.tag === 'ol' ? 'ol' : 'ul'
      const cls = tag === 'ol' ? 'list-decimal list-inside mb-4' : 'list-disc list-inside mb-4'
      return `<${tag} class="${cls}">${children}</${tag}>`
    }

    case 'listitem':
      return `<li class="mb-1">${children}</li>`

    case 'linebreak':
      return '<br>'

    case 'link': {
      const url = (node as unknown as { fields?: { url?: string } }).fields?.url ?? '#'
      return `<a href="${escapeHtml(url)}" class="text-primary underline hover:text-primary-dark">${children}</a>`
    }

    default:
      return children
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
