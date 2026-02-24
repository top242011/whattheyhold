import type { CollectionConfig } from 'payload'

export const Complaints: CollectionConfig = {
  slug: 'complaints',
  admin: {
    useAsTitle: 'message',
    group: 'Operations',
    defaultColumns: ['type', 'status', 'email', 'fundTicker', 'createdAt'],
  },
  access: {
    create: () => true,
    read: ({ req }) => {
      if (req.user) return true
      return false
    },
    update: ({ req }) => !!req.user,
    delete: ({ req }) => {
      if (!req.user) return false
      return (req.user as { role?: string }).role === 'super-admin'
    },
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Bug Report', value: 'bug' },
        { label: 'Incorrect Data', value: 'incorrect-data' },
        { label: 'Feature Request', value: 'feature-request' },
        { label: 'Other', value: 'other' },
      ],
      required: true,
      index: true,
    },
    {
      name: 'email',
      type: 'email',
      admin: {
        description: 'Optional — for follow-up',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'fundTicker',
      type: 'text',
      label: 'Related Fund Ticker',
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'New', value: 'new' },
        { label: 'In Review', value: 'in-review' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Closed', value: 'closed' },
      ],
      defaultValue: 'new',
      required: true,
      index: true,
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      label: 'Admin Notes (internal)',
      access: {
        read: ({ req }) => !!req.user,
        update: ({ req }) => !!req.user,
      },
    },
  ],
  timestamps: true,
}
