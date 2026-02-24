import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { AdminUsers } from './src/collections/AdminUsers'
import { LegalPages } from './src/collections/LegalPages'
import { Complaints } from './src/collections/Complaints'
import { FundOverrides } from './src/collections/FundOverrides'
import { SiteSettings } from './src/globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: AdminUsers.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— WhatTheyHold Admin',
    },
    components: {
      afterNavLinks: [
        {
          path: './src/app/(payload)/admin/analytics/AnalyticsNavLink',
          exportName: 'AnalyticsNavLink',
        },
      ],
      views: {
        Dashboard: {
          Component: {
            path: './src/app/(payload)/admin/DashboardView',
            exportName: 'DashboardView',
          },
        },
        analytics: {
          Component: {
            path: './src/app/(payload)/admin/analytics/AnalyticsView',
            exportName: 'AnalyticsView',
          },
          path: '/analytics',
        },
      },
    },
  },
  // Use /cms-api to avoid conflict with the Flask API proxy at /api
  routes: {
    api: '/cms-api',
    admin: '/admin',
  },
  collections: [AdminUsers, LegalPages, Complaints, FundOverrides],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'fallback-dev-secret-change-in-production',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    // Keep all Payload tables in a dedicated PostgreSQL schema to avoid
    // conflicts with the existing app tables (funds, holdings, etc.)
    schemaName: 'payload',
    // push: true auto-syncs schema on startup — required until migrations are set up.
    push: true,
  }),
  sharp,
})
