"use client";

import { useEffect, useState } from "react";
import { getTrendingFunds } from "@/lib/api";
import { TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface TrendingFund {
    ticker: string;
    name: string;
    price?: number;
    change_pct?: number;
}

export function TrendingFunds() {
    const [funds, setFunds] = useState<TrendingFund[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            const res = await getTrendingFunds(5);
            if (res.status === 'ok') {
                setFunds(res.data);
            }
            setIsLoading(false);
        };
        fetchTrending();
    }, []);

    if (isLoading) {
        return (
            <section className="py-12 bg-white/40 dark:bg-slate-900/40 border-t border-b border-white/20 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="text-primary-dark dark:text-primary" size={24} />
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Trending Funds</h2>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="min-w-[280px] h-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (funds.length === 0) return null;

    return (
        <section className="py-12 bg-white/40 dark:bg-slate-900/40 border-t border-b border-white/20 dark:border-white/5 backdrop-blur-md relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary-dark dark:text-primary">
                            <TrendingUp size={20} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Trending Right Now</h2>
                    </div>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth snap-x snap-mandatory hide-scrollbar">
                    {funds.map((fund, idx) => (
                        <motion.div
                            key={fund.ticker}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="snap-start snap-always"
                        >
                            <Link href={`/fund/${fund.ticker}`} className="block w-[280px] group">
                                <div className="bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 backdrop-blur-xl border border-white/40 dark:border-white/10 p-5 rounded-2xl shadow-glass transition-all hover:shadow-lg h-full flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="font-black text-xl text-slate-900 dark:text-white group-hover:text-primary-dark dark:text-primary transition-colors">
                                                {fund.ticker}
                                            </div>
                                            {fund.change_pct !== undefined && fund.change_pct !== null && (
                                                <div className={`px-2 py-1 rounded-md text-xs font-bold ${fund.change_pct >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-red-50 text-red-600 dark:bg-red-500/10'}`}>
                                                    {fund.change_pct >= 0 ? '+' : ''}{fund.change_pct.toFixed(2)}%
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">
                                            {fund.name}
                                        </p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                                        <span className="font-bold text-slate-700 dark:text-slate-200">
                                            {fund.price ? `$${fund.price.toFixed(2)}` : 'N/A'}
                                        </span>
                                        <ArrowRight size={16} className="text-slate-400 group-hover:text-primary-dark dark:text-primary transition-colors group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
