import { getFundData } from "@/lib/api";
import { getWatchlistStatus } from "@/app/actions/watchlist";
import { FundClientWrapper } from "@/components/dashboard/FundClientWrapper";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ ticker: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
    const { ticker } = await params;
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

    return (
        <FundClientWrapper
            ticker={ticker}
            data={data}
            initialIsWatchlisted={isWatchlisted}
        />
    );
}
