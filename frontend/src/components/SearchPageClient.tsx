"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/i18n";
import { Search, Building2, Filter, Globe, ArrowRight } from "lucide-react";
import { DashboardNav } from "./dashboard/DashboardNav";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface SearchResult {
    ticker: string;
    name: string;
    proj_id?: string;
    source: "yf" | "sec";
    is_feeder_fund?: boolean;
    type: string;
    amc?: string;
}

export function SearchPageClient({ initialQuery }: { initialQuery: string }) {
    const { t } = useLocale();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(initialQuery);
    const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
    const [fundType, setFundType] = useState<"" | "etf" | "mutual">("");
    const [source, setSource] = useState<"" | "yf" | "sec">("");

    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);

    // For mobile filters
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
            // Update URL query
            const params = new URLSearchParams(searchParams.toString());
            if (query) params.set("q", query);
            else params.delete("q");
            router.replace(`/search?${params.toString()}`, { scroll: false });
        }, 500);
        return () => clearTimeout(handler);
    }, [query, router, searchParams]);

    const fetchResults = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (debouncedQuery) params.set("q", debouncedQuery);
            if (fundType) params.set("type", fundType);
            if (source) params.set("source", source);
            params.set("limit", "50");

            const res = await fetch(`${API_BASE_URL}/api/search/all?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data.results || []);
                setHasMore(data.has_more || false);
            }
        } catch (error) {
            console.error("Failed to fetch search results", error);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedQuery, fundType, source]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    return (
        <div className="min-h-screen bg-background text-foreground hero-gradient selection:bg-primary/20 transition-colors duration-300 flex flex-col pb-12">
            <DashboardNav />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-col gap-6 relative z-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">
                            {t.search.pageTitle}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            {t.search.showing} {results.length} {t.search.pageTitle.toLowerCase()}
                        </p>
                    </div>

                    {/* Mobile filter toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="md:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                        <Filter size={18} />
                        <span className="font-semibold text-sm">{t.search.filters}</span>
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start">

                    {/* Sidebar Filters */}
                    <AnimatePresence>
                        {(showFilters || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
                            <motion.aside
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="w-full md:w-64 shrink-0 glass-panel rounded-2xl p-5 flex flex-col gap-6 md:-mt-2"
                            >
                                {/* Search Input */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t.search.filterByName}</label>
                                    <div className="relative">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="e.g. VOO or Vanguard"
                                        />
                                    </div>
                                </div>

                                {/* Type Filter */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t.search.filterByType}</label>
                                    <div className="flex flex-col gap-1.5">
                                        {[
                                            { value: "", label: t.search.allTypes },
                                            { value: "etf", label: t.search.etf },
                                            { value: "mutual", label: t.search.mutualFund },
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                onClick={() => setFundType(opt.value as any)}
                                                className={`text-left px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${fundType === opt.value
                                                        ? 'bg-primary/10 text-primary-dark dark:text-primary'
                                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Source Filter */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t.search.source}</label>
                                    <div className="flex flex-col gap-1.5">
                                        {[
                                            { value: "", label: t.search.allSources, icon: Globe },
                                            { value: "yf", label: t.search.international, icon: Globe },
                                            { value: "sec", label: t.search.thai, icon: Building2 },
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                onClick={() => setSource(opt.value as any)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${source === opt.value
                                                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    }`}
                                            >
                                                <opt.icon size={14} />
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                            </motion.aside>
                        )}
                    </AnimatePresence>

                    {/* Results Grid */}
                    <div className="flex-1 w-full">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white/50 dark:bg-slate-800/50 rounded-2xl h-32 animate-pulse border border-slate-100 dark:border-slate-800" />
                                ))}
                            </div>
                        ) : results.length === 0 ? (
                            <div className="text-center py-20 glass-panel rounded-3xl">
                                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">{t.search.noResults}</h3>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
                                {results.map((fund, index) => (
                                    <motion.div
                                        key={`${fund.source}-${fund.ticker}-${index}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(index * 0.05, 0.4) }}
                                    >
                                        <Link
                                            href={fund.source === "sec" ? `/fund/${fund.proj_id}?source=sec${fund.is_feeder_fund ? `&feeder=${encodeURIComponent(fund.ticker)}` : ''}` : `/fund/${fund.ticker}`}
                                            className="block h-full group bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                                        >
                                            <div className="flex flex-col h-full justify-between gap-4">
                                                <div>
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 leading-tight">
                                                            {fund.name}
                                                        </h3>
                                                        <span className="text-xs font-black px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                                                            {fund.ticker}
                                                        </span>
                                                    </div>
                                                    {fund.amc && (
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                                            <Building2 size={14} />
                                                            {fund.amc}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                                                    <div className="flex gap-2">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary-dark dark:text-primary">
                                                            {fund.type}
                                                        </span>
                                                        {fund.source === 'sec' && (
                                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                                                Thai
                                                            </span>
                                                        )}
                                                    </div>
                                                    <ArrowRight size={16} className="text-slate-300 group-hover:text-primary transition-colors transform group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}

