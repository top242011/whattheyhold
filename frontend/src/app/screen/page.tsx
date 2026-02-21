"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Search, Percent, ArrowRight, Loader2 } from "lucide-react";
import { screenFunds } from "@/lib/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { useLocale } from "@/lib/i18n";
import { FundLogo } from "@/components/ui/FundLogo";
import { sanitizeTicker } from "@/lib/sanitize";

interface ScreenResult {
    fund_ticker: string;
    fund_name: string;
    holding_ticker: string;
    weight_pct: number;
}

export default function ScreenPage() {
    const [holding, setHolding] = useState("");
    const [minWeight, setMinWeight] = useState<number>(1.0);
    const [results, setResults] = useState<ScreenResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const { t } = useLocale();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!holding.trim()) {
            toast.error(t.toast.enterTicker);
            return;
        }

        setIsLoading(true);
        setHasSearched(true);

        const res = await screenFunds(holding.trim().toUpperCase(), minWeight);

        setIsLoading(false);
        if (res.status === 'ok') {
            setResults(res.data);
            if (res.data.length === 0) {
                toast.info(t.screen.noFundsFound);
            }
        } else {
            toast.error(res.message || "Failed to fetch screen results");
        }
    };

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white pb-20">
            <Header />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                        {t.screen.title}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        {t.screen.description}
                    </p>
                </div>

                {/* Filter Controls */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-glass border border-white/20 dark:border-white/10 mb-8">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label htmlFor="holding" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                {t.screen.holdingTicker}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <Search size={20} />
                                </div>
                                <input
                                    type="text"
                                    id="holding"
                                    value={holding}
                                    onChange={(e) => setHolding(sanitizeTicker(e.target.value))}
                                    placeholder="Ticker..."
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-md focus:ring-2 focus:ring-primary/50 transition-all shadow-inner uppercase"
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-48">
                            <label htmlFor="weight" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                {t.screen.minWeight}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <Percent size={18} />
                                </div>
                                <input
                                    type="number"
                                    id="weight"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={minWeight}
                                    onChange={(e) => setMinWeight(Number(e.target.value))}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-md focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full md:w-auto px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-soft transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed h-[48px]"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>{t.screen.searchFunds}</>}
                        </motion.button>
                    </form>
                </div>

                {/* Results Area */}
                <div className="space-y-4">
                    {hasSearched && !isLoading && results.length > 0 && (
                        <h3 className="text-xl font-bold mb-4">
                            {t.screen.foundResults} {results.length} {results.length !== 1 ? t.screen.results : t.screen.result}
                        </h3>
                    )}

                    {!isLoading && results.map((result, idx) => (
                        <motion.div
                            key={`${result.fund_ticker}-${idx}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Link href={`/fund/${result.fund_ticker}`} className="block group">
                                <div className="bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-sm rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <FundLogo ticker={result.fund_ticker} name={result.fund_name} className="w-12 h-12 group-hover:scale-105 transition-transform" />
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                                {result.fund_ticker}
                                            </h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                                                {result.fund_name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 pr-2">
                                        <div className="text-right flex flex-col items-end">
                                            <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg">
                                                <span className="text-lg font-black">{result.weight_pct.toFixed(2)}</span>
                                                <span className="text-sm font-bold ml-0.5">%</span>
                                            </div>
                                        </div>
                                        <div className="text-slate-400 group-hover:text-primary transition-colors hidden sm:block">
                                            <ArrowRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}

                    {hasSearched && !isLoading && results.length === 0 && (
                        <div className="text-center py-16 bg-white/30 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-slate-500 dark:text-slate-400 font-medium">{t.screen.noFundsFound}</p>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">{t.screen.tryLowering}</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
