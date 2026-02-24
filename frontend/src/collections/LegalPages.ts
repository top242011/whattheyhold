import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const LegalPages: CollectionConfig = {
  slug: 'legal-pages',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'slug', 'language', 'updatedAt'],
  },
  fields: [
    {
      name: 'slug',
      type: 'select',
      options: [
        { label: 'Privacy Policy', value: 'privacy-policy' },
        { label: 'Terms of Service', value: 'terms-of-service' },
      ],
      required: true,
      index: true,
    },
    {
      name: 'language',
      type: 'select',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Thai', value: 'th' },
      ],
      required: true,
      defaultValue: 'en',
      index: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor(),
    },
    {
      name: 'lastUpdated',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
}
