"use client";

import { TrendingUp, Bookmark, Share2, Loader2 } from "lucide-react";
import { FundInfo } from "@/types/fund";
import { toast } from "sonner";
import { useLocale } from "@/lib/i18n";
import { motion } from "framer-motion";
import { useState } from "react";
import { toggleWatchlist } from "@/app/actions/watchlist";
import { FundLogo } from "@/components/ui/FundLogo";

interface FundInfoOverlayProps {
    fund: FundInfo;
    lastUpdated?: string;
    initialIsWatchlisted?: boolean;
}

export function FundInfoOverlay({ fund, lastUpdated, initialIsWatchlisted = false }: FundInfoOverlayProps) {
    const { t, locale } = useLocale();
    const [isWatchlisted, setIsWatchlisted] = useState<boolean>(initialIsWatchlisted ?? false);
    const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);

    // Show change only if API returns it
    const change = fund.change_pct;
    const isPositive = change ? change >= 0 : true;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success(t.toast.linkCopied);
    };

    const handleBookmark = async () => {
        setIsWatchlistLoading(true);
        const result = await toggleWatchlist(fund.ticker);
        setIsWatchlistLoading(false);

        if (result.success) {
            setIsWatchlisted(result.isWatchlisted ?? false);
            if (result.isWatchlisted) {
                toast.success(`Added ${fund.ticker} to Watchlist`);
            } else {
                toast.success(`Removed ${fund.ticker} from Watchlist`);
            }
        } else {
            if (result.error === "Unauthorized") {
                toast.error("Please login to save to your watchlist");
            } else {
                toast.error(result.error || "Failed to update watchlist");
            }
        }
    };

    const formattedDate = lastUpdated
        ? new Date(lastUpdated).toLocaleString(locale, {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
        : null;

    return (
        <div className="absolute top-6 left-6 z-20 pointer-events-none">
            <div className="flex flex-col gap-2 pointer-events-auto">
                <div className="glass-panel p-4 rounded-2xl shadow-lg border border-white/40 dark:border-white/10 backdrop-blur-md bg-white/60 dark:bg-slate-900/60 lg:max-w-[300px]">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <FundLogo ticker={fund.ticker} name={fund.name} className="w-12 h-12 mt-1 shrink-0" />
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                        {fund.ticker}
                                    </h1>
                                    {fund.type && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-md">
                                            {fund.type}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-snug mb-1 break-words line-clamp-2">
                                    {fund.name}
                                </p>
                                {formattedDate && (
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                        {t.fund.lastUpdated} {formattedDate}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                            {fund.price ? `$${fund.price.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : t.fund.na}
                        </span>
                        {change !== undefined && (
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg ${isPositive
                                ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                                : "text-red-500 bg-red-50 dark:bg-red-500/10"
                                }`}>
                                <TrendingUp size={14} className={isPositive ? "" : "transform rotate-180"} />
                                <span className="text-xs font-bold">
                                    {isPositive ? "+" : ""}{change.toFixed(2)}%
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toast.info(t.toast.tradingComingSoon)}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 text-sm font-medium py-2.5 rounded-xl transition-colors shadow-lg shadow-slate-900/20 dark:shadow-black/20 cursor-pointer"
                    >
                        {t.fund.trade}
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toast.info(t.toast.bookmarkComingSoon)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                        aria-label="Bookmark"
                    >
                        <Bookmark size={20} />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleCopyLink}
                        className="w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
                        aria-label="Share"
                    >
                        <Share2 size={20} />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
