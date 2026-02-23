"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLocale } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { convertThaiToEng } from "@/lib/thai-mapper";
import { sanitizeTicker } from "@/lib/sanitize";
import { analytics } from "@/lib/analytics";

// Client-side: empty string = relative URL, works via Vercel rewrites
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface SearchResult {
    ticker: string;
    name: string;
    source?: string;
    proj_id?: string;
    is_feeder_fund?: boolean;
    master_fund?: string;
    master_ticker?: string;
}

interface SearchBarProps {
    initialValue?: string;
}

export function SearchBar({ initialValue = "" }: SearchBarProps) {
    const router = useRouter();
    const { t } = useLocale();
    const [query, setQuery] = useState(initialValue);
    const [debouncedQuery, setDebouncedQuery] = useState(initialValue);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Debounce input logic
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300); // 300ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [query]);

    // Fetch results when debounced query changes
    useEffect(() => {
        const fetchResults = async () => {
            if (!debouncedQuery.trim()) {
                setResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=5`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data.results || []);
                }
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsSearching(false);
            }
        };

        if (isOpen) {
            fetchResults();
        }
    }, [debouncedQuery, isOpen]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) {
            toast.error(t.toast.enterTickerShort);
            return;
        }
        setIsOpen(false);
        // Convert Thai characters on submit (for ticker lookup)
        const ticker = sanitizeTicker(convertThaiToEng(query.trim()));

        analytics.trackEvent("search_query", {
            query: query.trim(),
            method: "submit",
            destination: ticker
        });

        // If we hit Enter instead of clicking an auto-complete result, we don't have the source/feeder info easily available here.
        // It will just be a standard ticker lookup, which is fine for direct searches.
        router.push(`/fund/${ticker}`);
    };

    const handleSelect = (result: SearchResult) => {
        setIsOpen(false);

        analytics.trackEvent("search_query", {
            query: query.trim(),
            method: "select",
            destination: result.ticker,
            source: result.source || "yf"
        });

        if (result.source === "sec") {
            // Thai fund: navigate to master fund ticker if available, else navigate to its own abbreviation
            if (result.master_ticker) {
                setQuery(result.master_ticker);
                router.push(`/fund/${result.master_ticker}?feeder=${encodeURIComponent(result.ticker)}`);
            } else {
                // No master ticker mapped — navigate to this specific Thai fund
                const ticker = result.ticker.toUpperCase();
                setQuery(ticker);
                router.push(`/fund/${ticker}?source=sec`);
            }
        } else {
            setQuery(result.ticker);
            router.push(`/fund/${result.ticker}`);
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <form onSubmit={handleSubmit} className="relative group w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-dark dark:text-primary transition-colors">
                    {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={20} />}
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="w-full pl-11 pr-12 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-base focus:ring-2 focus:ring-primary/50 placeholder-slate-400 transition-all shadow-inner"
                    placeholder={t.dashboard.searchPlaceholder}
                />
                {query.trim() && (
                    <button
                        type="submit"
                        aria-label={t.dashboard.searchButton}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary-dark dark:text-primary hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                    >
                        <ArrowRight size={20} />
                    </button>
                )}
            </form>

            <AnimatePresence>
                {isOpen && query.trim() && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50"
                    >
                        {results.length > 0 ? (
                            <ul className="py-2">
                                {results.map((result, idx) => (
                                    <li key={`${result.ticker}-${result.source || 'yf'}-${idx}`}>
                                        <button
                                            type="button"
                                            onClick={() => handleSelect(result)}
                                            className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex flex-col transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900 dark:text-white group-hover:text-primary-dark dark:group-hover:text-primary transition-colors">
                                                    {result.ticker}
                                                </span>
                                                {result.source === "sec" && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                                        🇹🇭 TH
                                                    </span>
                                                )}
                                                {result.is_feeder_fund && result.master_ticker && (
                                                    <span className="text-[10px] text-slate-400">
                                                        → {result.master_ticker}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-500 line-clamp-1">
                                                {result.name}
                                            </span>
                                            {result.master_fund && (
                                                <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                                                    Master: {result.master_fund}
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="px-4 py-4 text-center text-sm text-slate-500">
                                {isSearching ? "Searching..." : "No funds found"}
                            </div>
                        )}
                        <div
                            className="bg-slate-50 dark:bg-slate-800/50 p-3 text-center border-t border-slate-100 dark:border-slate-800 flex justify-center w-full focus:outline-none"
                        >
                            <button
                                type="button"
                                onClick={() => handleSubmit()}
                                className="text-xs font-bold text-primary-dark dark:text-primary hover:text-primary-dark dark:text-primary-dark cursor-pointer flex-1 py-1 px-4 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                Search specifically for &quot;{query}&quot;
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

