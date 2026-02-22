import { FundResponse } from "@/types/fund";

// Server-side (SSR): use API_URL env var → directly hits Railway
// Client-side: use empty string → relative URLs go through Vercel rewrites
function getApiBaseUrl(): string {
    if (typeof window !== 'undefined') {
        // Client-side: relative URLs work via Vercel rewrites
        return process.env.NEXT_PUBLIC_API_URL || '';
    }
    // Server-side: need absolute URL
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || '';
    if (apiUrl && !apiUrl.startsWith('http')) return `https://${apiUrl}`;
    if (apiUrl) return apiUrl;
    // Vercel auto-sets VERCEL_URL
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return 'http://localhost:3000';
}

const API_BASE_URL = getApiBaseUrl();

export type FundResult =
    | { status: 'ok'; data: FundResponse }
    | { status: 'not_found' }
    | { status: 'error'; message: string };

export async function getFundData(ticker: string): Promise<FundResult> {
    try {
        const res = await fetch(`${API_BASE_URL}/api/fund/${ticker}`, {
            cache: "no-store",
        });

        if (res.status === 404) return { status: 'not_found' };
        if (!res.ok) return { status: 'error', message: res.statusText };

        const data = await res.json();
        return { status: 'ok', data };
    } catch (error) {
        console.error("API Error:", error);
        return { status: 'error', message: String(error) };
    }
}

export async function screenFunds(holding: string, minWeight: number = 0) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/screen?holding=${holding}&min_weight=${minWeight}`, {
            cache: "no-store",
        });

        if (!res.ok) return { status: 'error', message: res.statusText };

        const data = await res.json();
        return { status: 'ok', data: data.results };
    } catch (error) {
        console.error("API Error:", error);
        return { status: 'error', message: String(error) };
    }
}

export async function getTrendingFunds(limit: number = 5) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/trending?limit=${limit}`, {
            // Revalidate every hour
            next: { revalidate: 3600 }
        });

        if (!res.ok) return { status: 'error', message: res.statusText };

        const data = await res.json();
        return { status: 'ok', data: data.results };
    } catch (error) {
        console.error("API Error:", error);
        return { status: 'error', message: String(error) };
    }
}

export async function getThaiFundInfo(ticker: string) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/thai-fund-info/${ticker}`, {
            cache: "no-store",
        });

        if (res.status === 404) return { status: 'not_found' };
        if (!res.ok) return { status: 'error', message: res.statusText };

        const data = await res.json();
        return { status: 'ok', data };
    } catch (error) {
        console.error("API Error:", error);
        return { status: 'error', message: String(error) };
    }
}
