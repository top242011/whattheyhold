import { createBrowserClient } from '@supabase/ssr'

// Define a function that returns a Supabase client for the browser
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}
