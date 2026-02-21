"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleWatchlist(ticker: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: "Unauthorized" }
    }

    // Check if it exists
    const { data: existing } = await supabase
        .from('watchlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('ticker', ticker)
        .single()

    if (existing) {
        // Remove
        const { error } = await supabase
            .from('watchlists')
            .delete()
            .eq('id', existing.id)

        if (error) return { success: false, error: error.message }

        revalidatePath(`/fund/${ticker}`)
        revalidatePath('/dashboard')
        return { success: true, isWatchlisted: false }
    } else {
        // Add
        const { error } = await supabase
            .from('watchlists')
            .insert({ user_id: user.id, ticker })

        if (error) return { success: false, error: error.message }

        revalidatePath(`/fund/${ticker}`)
        revalidatePath('/dashboard')
        return { success: true, isWatchlisted: true }
    }
}

export async function getWatchlistStatus(ticker: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const { data } = await supabase
        .from('watchlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('ticker', ticker)
        .single()

    return !!data
}

export async function getUserWatchlist() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data } = await supabase
        .from('watchlists')
        .select('ticker')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return data?.map(item => item.ticker) || []
}
