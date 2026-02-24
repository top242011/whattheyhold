import type { Metadata } from 'next'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap.js'
import config from '@payload-config'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

// Pass params/searchParams as Promises — Payload handles awaiting them internally.
// IMPORTANT: call RootPage as JSX (<RootPage/>) not as a function (RootPage({}))
// so React hooks and context work correctly inside it.
export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

export default function Page({ params, searchParams }: Args) {
  return (
    <RootPage config={config} params={params} searchParams={searchParams} importMap={importMap} />
  )
}
