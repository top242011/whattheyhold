"use client";

import { useState, useEffect } from "react";
import { FundSkeleton } from "./FundSkeleton";
import { DashboardNav } from "./DashboardNav";
import { WorldMap } from "./WorldMap";
import { FundInfoOverlay } from "./FundInfoOverlay";
import { HoldingsCard } from "./HoldingsCard";
import { FundResponse } from "@/types/fund";
import { useLocale } from "@/lib/i18n";

interface FundClientWrapperProps {
    ticker: string;
    data: FundResponse;
    initialIsWatchlisted: boolean;
    feederName?: string;
}

export function FundClientWrapper({ ticker, data, initialIsWatchlisted, feederName }: FundClientWrapperProps) {
    const { t } = useLocale();
    const [imagesLoaded, setImagesLoaded] = useState(false);

    useEffect(() => {
        let mounted = true;

        const preloadImages = async () => {
            // Only preload images that actually come from financialmodelingprep
            const imageUrls = data.holdings.map(
                (holding) => `https://financialmodelingprep.com/image-stock/${holding.ticker.toUpperCase()}.png`
            );

            if (imageUrls.length === 0) {
                if (mounted) setImagesLoaded(true);
                return;
            }

            const promises = imageUrls.map((url) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.src = url;
                    // Resolve regardless of success or error so one broken image doesn't block the page
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            });

            await Promise.all(promises);
            if (mounted) {
                setImagesLoaded(true);
            }
        };

        preloadImages();

        return () => {
            mounted = false;
        };
    }, [data.holdings]);

    if (!imagesLoaded) {
        return <FundSkeleton />;
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col overflow-hidden relative selection:bg-primary selection:text-white">
            {/* Background Decoration */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] rounded-full bg-primary/5 dark:bg-primary/3 blur-[120px]"></div>
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-300/10 dark:bg-indigo-400/5 blur-[100px]"></div>
                <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-primary/5 dark:bg-primary/3 blur-[120px]"></div>
            </div>

            {/* Nav */}
            <DashboardNav currentTicker={ticker} />

            {/* Main Grid */}
            <main className="relative z-10 flex-1 w-full h-full p-6 pt-4 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 max-w-[1400px] mx-auto overflow-hidden animate-fade-in-up">
                {/* Feeder Banner */}
                {feederName && (
                    <div className="lg:col-span-2 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-2xl p-4 flex items-center justify-between shadow-sm backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                                <span className="text-xl">🇹🇭</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                    {t.fund.feederBannerTitle.replace("{feederName}", feederName)}
                                </h3>
                                <p className="text-xs text-blue-700/80 dark:text-blue-300/80 mt-0.5">
                                    {t.fund.feederBannerDesc.replace("{masterFundName}", data.fund.name || ticker).replace("{feederName}", feederName)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile: standalone fund info card */}
                <div className="lg:hidden [&>div]:static">
                    <FundInfoOverlay fund={data.fund} lastUpdated={data.last_updated} initialIsWatchlisted={initialIsWatchlisted} />
                </div>

                {/* Left: Map */}
                <div className="relative flex flex-col h-full min-h-[50vh] lg:min-h-0 rounded-[30px] overflow-hidden shadow-glass border border-white/40 dark:border-white/10">
                    <div className="hidden lg:block">
                        <FundInfoOverlay fund={data.fund} lastUpdated={data.last_updated} initialIsWatchlisted={initialIsWatchlisted} />
                    </div>
                    <WorldMap weights={data.country_weights} sectors={data.sector_weights} />
                </div>

                {/* Right: Side Card */}
                <HoldingsCard holdings={data.holdings} />
            </main>
        </div>
    );
}
