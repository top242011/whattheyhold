import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Configuration',
  },
  fields: [
    {
      name: 'heroTickers',
      type: 'array',
      label: 'Hero Section Popular Tickers',
      admin: {
        description: 'Tickers shown as popular links below the hero search bar',
      },
      defaultValue: [
        { ticker: 'VOO' },
        { ticker: 'QQQ' },
        { ticker: 'VTI' },
        { ticker: 'SCHD' },
      ],
      fields: [
        {
          name: 'ticker',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'announcement',
      type: 'text',
      label: 'Announcement Banner',
      admin: {
        description: 'Optional message shown as a top banner on the site. Leave empty to hide.',
      },
    },
    {
      name: 'maintenanceMode',
      type: 'checkbox',
      label: 'Maintenance Mode',
      defaultValue: false,
      admin: {
        description: 'When enabled, shows a maintenance page to all visitors',
      },
    },
  ],
}
