"use client";


import { ArrowRight, MoreHorizontal, Package, Download } from "lucide-react";
import { Holding } from "@/types/fund";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useLocale } from "@/lib/i18n";
import { InfoTooltip } from "../InfoTooltip";
import { CompanyLogo } from "./CompanyLogo";

interface HoldingsCardProps {
    holdings: Holding[];
}

export function HoldingsCard({ holdings }: HoldingsCardProps) {
    const { t } = useLocale();

    const handleExportCSV = () => {
        if (!holdings || holdings.length === 0) {
            toast.error(t.dashboard?.noHoldings || "No holdings to export");
            return;
        }

        const headers = ["Ticker", "Name", "Weight (%)"];
        const csvContent = [
            headers.join(","),
            ...holdings.map(h => `"${h.ticker}","${h.name.replace(/"/g, '""')}",${h.pct.toFixed(2)}`)
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "fund_holdings.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Exported successfully!");
    };

    return (
        <div className="relative flex flex-col gap-6 h-full overflow-y-auto pr-1">
            <div className="glass-panel rounded-3xl p-6 shadow-glass flex flex-col gap-5 h-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                            {t.dashboard.topHoldings}
                            <InfoTooltip text="สินทรัพย์หรือหุ้น 10 อันดับแรกที่กองทุนนี้นำเงินไปลงทุน" />
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">
                            {t.dashboard.largestAssets}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary-dark dark:text-primary transition-colors cursor-pointer"
                            onClick={handleExportCSV}
                            aria-label="Export to CSV"
                            title="Export to CSV"
                        >
                            <Download size={20} />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
                            onClick={() => toast.info(t.toast.moreOptionsComingSoon)}
                            aria-label="More options for top holdings"
                        >
                            <MoreHorizontal size={20} />
                        </motion.button>
                    </div>
                </div>


                <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-2">
                    {holdings.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
                            <Package size={48} className="mb-4 opacity-50" />
                            <p className="font-medium">{t.dashboard.noHoldings}</p>
                            <p className="text-sm">{t.dashboard.noHoldingsDesc}</p>
                        </div>
                    ) : (
                        holdings.map((stock, index) => (
                            <motion.div
                                key={stock.ticker}
                                role="button"
                                tabIndex={0}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="w-full group flex items-center justify-between p-3 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:shadow-md cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-primary/50"
                                onClick={() => toast.info(`${t.toast.selected} ${stock.ticker}`)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        toast.info(`${t.toast.selected} ${stock.ticker}`);
                                    }
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <CompanyLogo ticker={stock.ticker} size={40} />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[100px] sm:max-w-none">
                                            {stock.name}
                                        </span>
                                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded w-fit">
                                            {stock.ticker}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-sm font-bold text-primary-dark dark:text-primary">
                                        {stock.pct.toFixed(2)}%
                                    </span>
                                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-primary rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(stock.pct * 10, 100)}%` }}
                                            transition={{ delay: 0.2 + index * 0.05, duration: 0.5 }}
                                        ></motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        )))}
                </div>

                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toast.info(t.toast.holdingsListComingSoon, { description: t.toast.holdingsListDesc })}
                    className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                    <span>{t.dashboard.viewAll}</span>
                    <ArrowRight size={16} />
                </motion.button>
            </div>
        </div>
    );
}
