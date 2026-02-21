import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { getUserWatchlist } from "@/app/actions/watchlist";
import { getFundData } from "@/lib/api";
import Link from "next/link";
import { ArrowRight, Bookmark } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { FundResponse } from "@/types/fund";
import { FundLogo } from "@/components/ui/FundLogo";

export default async function DashboardRootPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch user's watchlisted tickers
    const savedTickers = await getUserWatchlist();

    // Fetch data for each ticker to display basic info
    const fundsData: FundResponse[] = [];
    for (const ticker of savedTickers) {
        const res = await getFundData(ticker);
        if (res.status === 'ok') {
            fundsData.push(res.data);
        }
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col overflow-hidden relative selection:bg-primary selection:text-white">
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-300/10 blur-[100px]"></div>
            </div>

            <DashboardNav />

            <main className="relative z-10 flex-1 w-full h-full p-6 pt-12 max-w-[1000px] mx-auto overflow-hidden">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">My Watchlist</h1>
                    <p className="text-slate-600 dark:text-slate-400">Keep track of your favorite funds and ETFs.</p>
                </div>

                {fundsData.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                        <Bookmark size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No funds saved yet</h3>
                        <p className="text-sm text-slate-500 max-w-sm mt-2">
                            Search for an ETF and click the bookmark icon to save it to your watchlist.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fundsData.map((data) => (
                            <Link href={`/fund/${data.fund.ticker}`} key={data.fund.ticker} className="block group">
                                <div className="bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-md rounded-2xl p-6 shadow-glass border border-white/40 dark:border-white/10 hover:shadow-lg transition-all h-full flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <FundLogo ticker={data.fund.ticker} name={data.fund.name} className="w-12 h-12" />
                                                <div>
                                                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{data.fund.name}</h3>
                                                    <p className="text-xs text-slate-500 uppercase font-medium">{data.fund.type || "ETF"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                                        <div>
                                            {data.fund.price ? (
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-lg font-bold">${data.fund.price.toFixed(2)}</span>
                                                    {data.fund.change_pct !== undefined && (
                                                        <span className={`text-xs font-bold ${data.fund.change_pct >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                            {data.fund.change_pct >= 0 ? '+' : ''}{data.fund.change_pct.toFixed(2)}%
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-500">Price N/A</span>
                                            )}
                                        </div>
                                        <div className="text-slate-400 group-hover:text-primary transition-colors">
                                            <ArrowRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
