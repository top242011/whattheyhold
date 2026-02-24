import type { CollectionConfig } from 'payload'

export const FundOverrides: CollectionConfig = {
  slug: 'fund-overrides',
  admin: {
    useAsTitle: 'ticker',
    group: 'Operations',
    defaultColumns: ['ticker', 'isHidden', 'displayNameOverride', 'updatedAt'],
  },
  fields: [
    {
      name: 'ticker',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Fund ticker symbol (e.g. VOO, QQQ, or Thai SEC proj_id)',
      },
    },
    {
      name: 'isHidden',
      type: 'checkbox',
      label: 'Hide from search & trending',
      defaultValue: false,
    },
    {
      name: 'displayNameOverride',
      type: 'text',
      label: 'Display Name Override',
      admin: {
        description: 'Optional override for the fund display name shown to users',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Internal Notes',
    },
  ],
  timestamps: true,
}
