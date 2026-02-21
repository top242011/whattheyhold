import { FundResponse } from "@/types/fund";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
