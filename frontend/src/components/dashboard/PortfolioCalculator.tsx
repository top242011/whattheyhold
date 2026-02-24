"use client";

import { useState } from "react";
import { Holding } from "@/types/fund";
import { useLocale } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { CompanyLogo } from "./CompanyLogo";
import { Calculator } from "lucide-react";

interface PortfolioCalculatorProps {
    holdings: Holding[];
}

export function PortfolioCalculator({ holdings }: PortfolioCalculatorProps) {
    const { t, locale } = useLocale();
    const [amountStr, setAmountStr] = useState("10000");

    const amount = parseFloat(amountStr.replace(/,/g, "")) || 0;

    // Filter to top 10 (or keep all if preferred, but design said Top 10)
    const topHoldings = holdings.slice(0, 10);

    return (
        <div className="flex flex-col h-full w-full">
            {/* Header Area (Padding top to avoid overlapping with FundInfoOverlay only on large screens) */}
            <div className="pt-4 lg:pt-[260px] xl:pt-[280px] pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <Calculator size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
                            {t.calculator.title}
                        </h3>
                        <p className="text-sm text-slate-500">
                            {t.calculator.titleDesc}
                        </p>
                    </div>
                </div>

                <div className="w-full sm:w-auto relative group">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 absolute -top-2 left-4 bg-slate-50 dark:bg-slate-900 px-1 z-10">
                        {t.calculator.inputLabel}
                    </label>
                    <input
                        type="text"
                        value={amountStr}
                        onChange={(e) => {
                            // Allow numbers and commas
                            const val = e.target.value.replace(/[^0-9.]/g, '');
                            if (val === '') setAmountStr('');
                            else {
                                // Format with commas
                                const num = parseFloat(val);
                                if (!isNaN(num)) {
                                    setAmountStr(num.toLocaleString('en-US'));
                                } else {
                                    setAmountStr(val);
                                }
                            }
                        }}
                        className="w-full sm:w-48 pl-4 pr-12 py-3 bg-white dark:bg-slate-800 border-2 border-emerald-200 dark:border-emerald-800/50 rounded-2xl text-lg font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                        placeholder={t.calculator.inputPlaceholder}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium font-sans">
                        ฿
                    </span>
                </div>
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto pt-6 space-y-3 pb-20 lg:pb-0">
                <AnimatePresence>
                    {topHoldings.length === 0 ? (
                        <div className="flex items-center justify-center h-40 text-slate-400 font-medium">
                            {t.dashboard.noHoldings}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
                            {topHoldings.map((holding, index) => {
                                const allocation = (amount * holding.pct) / 100;
                                return (
                                    <motion.div
                                        key={holding.ticker}
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white dark:bg-slate-800 rounded-2xl p-4 flex items-center justify-between border border-slate-100 dark:border-slate-700 shadow-sm shadow-emerald-900/5"
                                    >
                                        <div className="flex items-center gap-3 min-w-0 pr-4">
                                            <CompanyLogo ticker={holding.ticker} size={40} />
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                    {holding.name}
                                                </span>
                                                <span className="text-xs font-semibold text-slate-500">
                                                    {holding.ticker} • {holding.pct.toFixed(2)}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end shrink-0 pl-2">
                                            <span className="text-[10px] text-slate-400 mb-0.5">
                                                {t.calculator.resultLabel}
                                            </span>
                                            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                                {allocation.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-bold text-slate-400">฿</span>
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
