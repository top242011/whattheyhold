import { getFundData, getThaiFundInfo } from "@/lib/api";
import { getWatchlistStatus } from "@/app/actions/watchlist";
import { FundClientWrapper } from "@/components/dashboard/FundClientWrapper";
import { ThaiFundClientWrapper } from "@/components/dashboard/ThaiFundClientWrapper";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ ticker: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({ params, searchParams }: PageProps) {
    const { ticker } = await params;
    const { source, feeder } = await searchParams;
    const isThaiFund = source === "sec";

    // Non-feeder Thai Fund View
    if (isThaiFund) {
        const result = await getThaiFundInfo(ticker);
        if (result.status === 'not_found') notFound();
        if (result.status === 'error') throw new Error(result.message);

        return <ThaiFundClientWrapper ticker={ticker} data={result.data} />;
    }

    // Standard yfinance fund view (with potential feeder banner)
    const result = await getFundData(ticker);

    if (result.status === 'not_found') {
        notFound();
    }

    if (result.status === 'error') {
        throw new Error(result.message);
    }

    // At this point result.status is guaranteed 'ok'
    const data = result.data;
    const isWatchlisted = await getWatchlistStatus(data.fund.ticker);

    const feederName = typeof feeder === 'string' ? feeder : undefined;

    return (
        <FundClientWrapper
            ticker={ticker}
            data={data}
            initialIsWatchlisted={isWatchlisted}
            feederName={feederName}
        />
    );
}
