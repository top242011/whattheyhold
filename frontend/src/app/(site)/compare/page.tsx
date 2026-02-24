"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Search, Plus, Trash2, ArrowRight } from "lucide-react";
import { getFundData } from "@/lib/api";
import { FundResponse } from "@/types/fund";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import { FundLogo } from "@/components/ui/FundLogo";
import { sanitizeTicker } from "@/lib/sanitize";

export default function ComparePage() {
    const [tickers, setTickers] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [fundsData, setFundsData] = useState<Record<string, FundResponse>>({});
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useLocale();

    const handleAddTicker = async (e: React.FormEvent) => {
        e.preventDefault();
        const ticker = inputValue.trim().toUpperCase();

        if (!ticker) return;

        if (tickers.length >= 3) {
            toast.error("You can compare up to 3 funds at a time.");
            return;
        }

        if (tickers.includes(ticker)) {
            toast.error(`${ticker} is already in the comparison.`);
            setInputValue("");
            return;
        }

        setIsLoading(true);
        const res = await getFundData(ticker);
        setIsLoading(false);

        if (res.status === 'ok') {
            setTickers([...tickers, ticker]);
            setFundsData(prev => ({ ...prev, [ticker]: res.data }));
            setInputValue("");
        } else {
            toast.error(`Could not find data for ${ticker}`);
        }
    };

    const handleRemoveTicker = (tickerToRemove: string) => {
        setTickers(tickers.filter(t => t !== tickerToRemove));
        const newData = { ...fundsData };
        delete newData[tickerToRemove];
        setFundsData(newData);
    };

    const renderHoldings = (data: FundResponse) => {
        const top10 = data.holdings?.slice(0, 10) || [];
        return (
            <div className="space-y-2 text-sm">
                {top10.map(h => (
                    <div key={h.ticker} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                        <span className="font-medium text-slate-700 dark:text-slate-300 w-16">{h.ticker}</span>
                        <span className="text-slate-500 truncate flex-1 px-2">{h.name}</span>
                        <span className="font-bold text-slate-900 dark:text-white w-12 text-right">{h.pct.toFixed(1)}%</span>
                    </div>
                ))}
                {top10.length === 0 && <span className="text-slate-400">{t.compare.noHoldingsData}</span>}
            </div>
        );
    };

    const renderSectors = (data: FundResponse) => {
        const top5 = data.sector_weights?.slice(0, 5) || [];
        return (
            <div className="space-y-2 text-sm">
                {top5.map(s => {
                    const translatedSector = (t.industries as any)[s.sector] || s.sector;
                    return (
                        <div key={s.sector} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                            <span className="text-slate-500 truncate flex-1">{translatedSector}</span>
                            <span className="font-bold text-slate-900 dark:text-white w-12 text-right">{s.weight_pct.toFixed(1)}%</span>
                        </div>
                    );
                })}
                {top5.length === 0 && <span className="text-slate-400">{t.compare.noSectorData}</span>}
            </div>
        );
    };

    const renderCountries = (data: FundResponse) => {
        const top5 = data.country_weights?.slice(0, 5) || [];
        return (
            <div className="space-y-2 text-sm">
                {top5.map(c => {
                    const translatedRegion = (t.regions as any)[c.country_code] || c.country_code;
                    return (
                        <div key={c.country_code} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                            <span className="text-slate-500 font-medium">{translatedRegion}</span>
                            <span className="font-bold text-slate-900 dark:text-white">{c.weight_pct.toFixed(1)}%</span>
                        </div>
                    );
                })}
                {top5.length === 0 && <span className="text-slate-400">{t.compare.noGeographicData}</span>}
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white pb-20 overflow-x-hidden">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 w-full">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                        {t.compare.title}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        {t.compare.description}
                    </p>
                </div>

                {/* Input Area */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-glass border border-white/20 dark:border-white/10 mb-8 max-w-xl mx-auto">
                    <form onSubmit={handleAddTicker} className="flex gap-2 relative">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(sanitizeTicker(e.target.value))}
                                placeholder={t.compare.searchPlaceholder}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50 transition-all uppercase outline-none"
                                disabled={tickers.length >= 3 || isLoading}
                            />
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={!inputValue.trim() || tickers.length >= 3 || isLoading}
                            className="bg-primary hover:bg-primary-dark text-white font-bold rounded-xl px-4 py-3 shadow-soft transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={20} />}
                            <span className="hidden sm:inline">{t.compare.add}</span>
                        </motion.button>
                    </form>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-medium px-2">
                        <span>{tickers.length} {t.compare.selectedOf3}</span>
                        {tickers.length >= 3 && <span className="text-amber-500">{t.compare.maxReached}</span>}
                    </div>
                </div>

                {/* Comparison Grid */}
                {tickers.length > 0 ? (
                    <div className="w-full overflow-x-auto pb-8">
                        <div className={`grid gap-6 min-w-[300px]`} style={{ gridTemplateColumns: `repeat(${tickers.length}, minmax(300px, 1fr))` }}>
                            {tickers.map(ticker => {
                                const data = fundsData[ticker];

                                return (
                                    <div key={ticker} className="flex flex-col gap-6">
                                        {/* Card Header (Basic Info) */}
                                        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 shadow-glass border border-white/40 dark:border-white/10 relative group h-48 flex flex-col justify-between">
                                            <button
                                                onClick={() => handleRemoveTicker(ticker)}
                                                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={18} />
                                            </button>

                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <FundLogo ticker={ticker} name={data?.fund.name} className="w-12 h-12" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-md">
                                                        {data?.fund.type || "ETF"}
                                                    </span>
                                                </div>
                                                <h2 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 pr-8">
                                                    {data?.fund.name}
                                                </h2>
                                            </div>

                                            <div className="flex items-baseline gap-2">
                                                {data?.fund.price ? (
                                                    <>
                                                        <span className="text-2xl font-black">${data.fund.price.toFixed(2)}</span>
                                                        {data.fund.change_pct !== undefined && (
                                                            <span className={`text-sm font-bold ${data.fund.change_pct >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                                                {data.fund.change_pct >= 0 ? "+" : ""}{data.fund.change_pct.toFixed(2)}%
                                                            </span>
                                                        )}
                                                    </>
                                                ) : <span className="text-slate-500">{t.compare.priceNa}</span>}
                                            </div>
                                        </div>

                                        {/* Top 10 Holdings Section */}
                                        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex-1">
                                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">{t.compare.top10Holdings}</h3>
                                            {data ? renderHoldings(data) : <div className="h-32 flex items-center justify-center"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}
                                        </div>

                                        {/* Sector Exposure */}
                                        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">{t.compare.topSectors}</h3>
                                            {data ? renderSectors(data) : <div className="h-24" />}
                                        </div>

                                        {/* Geography */}
                                        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">{t.compare.topGeographies}</h3>
                                            {data ? renderCountries(data) : <div className="h-24" />}
                                        </div>

                                        {/* Full Report Link */}
                                        <Link href={`/fund/${ticker}`} className="w-full block">
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full py-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center gap-2 font-bold text-primary transition-colors"
                                            >
                                                {t.compare.fullReport} <ArrowRight size={18} />
                                            </motion.div>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center text-center bg-white/40 dark:bg-slate-900/40 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800/50 max-w-4xl mx-auto">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center gap-1 justify-center mb-6 shadow-inner text-slate-300 dark:text-slate-600">
                            <div className="w-3 h-10 bg-current rounded-full"></div>
                            <div className="w-3 h-14 bg-current rounded-full"></div>
                            <div className="w-3 h-8 bg-current rounded-full"></div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">{t.compare.compareSideBySide}</h3>
                        <p className="text-slate-500 font-medium max-w-md text-lg">
                            {t.compare.searchAndAdd}
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
