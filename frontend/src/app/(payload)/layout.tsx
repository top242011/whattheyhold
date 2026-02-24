import React from 'react'
import type { ServerFunctionClient } from 'payload'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import { importMap } from './admin/importMap.js'
import config from '@payload-config'
import '@payloadcms/next/css'
import './admin/custom.css'

const serverFunction: ServerFunctionClient = async (args) => {
  'use server'
  return handleServerFunctions({ ...args, config, importMap })
}

// Payload's RootLayout provides its own <html> and <body> with all
// necessary admin context providers (ConfigProvider, RootProvider, etc.)
export default function PayloadRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}
