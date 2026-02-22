"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Plus, Trash2, PieChart, RefreshCw } from "lucide-react";
import { getFundData } from "@/lib/api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { WorldMap } from "@/components/dashboard/WorldMap";
import { HoldingsCard } from "@/components/dashboard/HoldingsCard";
import { CountryWeight, Holding, SectorWeight } from "@/types/fund";
import { convertThaiToEng } from "@/lib/thai-mapper";
import { InfoTooltip } from "@/components/InfoTooltip";
import { useLocale } from "@/lib/i18n";
import { FundLogo } from "@/components/ui/FundLogo";
import { sanitizeTicker } from "@/lib/sanitize";

interface PortfolioItem {
    ticker: string;
    weight: number;
}

export default function PortfolioPage() {
    const [items, setItems] = useState<PortfolioItem[]>([{ ticker: "SPY", weight: 60 }, { ticker: "QQQ", weight: 40 }]);
    const [tickerInput, setTickerInput] = useState("");
    const [weightInput, setWeightInput] = useState<number>(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { t } = useLocale();

    // Aggregated Results
    const [aggCountries, setAggCountries] = useState<CountryWeight[]>([]);
    const [aggSectors, setAggSectors] = useState<SectorWeight[]>([]);
    const [aggHoldings, setAggHoldings] = useState<Holding[]>([]);
    const [hasAnalyzed, setHasAnalyzed] = useState(false);

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tickerInput.trim() || weightInput <= 0) {
            toast.error("Please enter a valid ticker and weight > 0");
            return;
        }

        setItems([...items, { ticker: tickerInput.trim().toUpperCase(), weight: weightInput }]);
        setTickerInput("");
        setWeightInput(0);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleUpdateWeight = (index: number, newWeight: number) => {
        const newItems = [...items];
        newItems[index].weight = newWeight;
        setItems(newItems);
    };

    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

    const analyzePortfolio = async () => {
        if (items.length === 0) {
            toast.error("Please add at least one fund to your portfolio");
            return;
        }

        if (Math.abs(totalWeight - 100) > 0.1) {
            toast.warning(`Total weight is ${totalWeight}%. Normalizing to 100% for analysis.`);
        }

        setIsAnalyzing(true);
        setHasAnalyzed(false);

        const countryMap = new Map<string, number>();
        const sectorMap = new Map<string, number>();
        const holdingMap = new Map<string, { name: string, pct: number }>();

        try {
            for (const item of items) {
                // Normalize weight to 1 (100%)
                const normalizedWeight = item.weight / totalWeight;
                const res = await getFundData(item.ticker);

                if (res.status === 'ok') {
                    // Aggregate Countries
                    res.data.country_weights?.forEach(c => {
                        const current = countryMap.get(c.country_code) || 0;
                        countryMap.set(c.country_code, current + (c.weight_pct * normalizedWeight));
                    });

                    // Aggregate Sectors
                    res.data.sector_weights?.forEach(s => {
                        const current = sectorMap.get(s.sector) || 0;
                        sectorMap.set(s.sector, current + (s.weight_pct * normalizedWeight));
                    });

                    // Aggregate Holdings
                    res.data.holdings?.forEach(h => {
                        const current = holdingMap.get(h.ticker) || { name: h.name, pct: 0 };
                        current.pct += (h.pct * normalizedWeight);
                        holdingMap.set(h.ticker, current);
                    });
                } else {
                    toast.error(`Could not fetch data for ${item.ticker}`);
                }
            }

            // Convert map back to array
            const finalCountries = Array.from(countryMap.entries()).map(([country_code, weight_pct]) => ({
                country_code, weight_pct
            })).sort((a, b) => b.weight_pct - a.weight_pct);

            const finalSectors = Array.from(sectorMap.entries()).map(([sector, weight_pct]) => ({
                sector, weight_pct
            })).sort((a, b) => b.weight_pct - a.weight_pct);

            const finalHoldings = Array.from(holdingMap.entries()).map(([ticker, data]) => ({
                ticker, name: data.name, pct: data.pct
            })).sort((a, b) => b.pct - a.pct).slice(0, 50); // Top 50

            setAggCountries(finalCountries);
            setAggSectors(finalSectors);
            setAggHoldings(finalHoldings);
            setHasAnalyzed(true);
            toast.success("Portfolio analysis complete!");

        } catch (error) {
            console.error(error);
            toast.error("An error occurred during analysis");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white pb-20">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Input and List */}
                <div className="lg:col-span-1 space-y-6">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-1">
                            {t.portfolio.title}
                            <InfoTooltip text="จำลองการจัดพอร์ตโดยผสมหลายกองทุน เพื่อดูสัดส่วนการลงทุนที่แท้จริงแบบภาพรวม" />
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {t.portfolio.description}
                        </p>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-glass border border-white/20 dark:border-white/10">
                        <form onSubmit={handleAddItem} className="flex flex-col gap-4 mb-6">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tickerInput}
                                    onChange={(e) => setTickerInput(sanitizeTicker(convertThaiToEng(e.target.value)))}
                                    placeholder={t.portfolio.tickerPlaceholder}
                                    className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50 text-sm bg-slate-50 dark:bg-slate-800 uppercase"
                                />
                                <div className="relative w-24">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={weightInput}
                                        onChange={(e) => setWeightInput(Number(e.target.value))}
                                        placeholder="%"
                                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50 text-sm bg-slate-50 dark:bg-slate-800"
                                    />
                                    <span className="absolute right-3 top-2.5 text-slate-400 text-sm">%</span>
                                </div>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <Plus size={16} /> {t.portfolio.addFund}
                            </motion.button>
                        </form>

                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
                                <span>{t.portfolio.fund}</span>
                                <span className="flex items-center">
                                    {t.portfolio.weight} <InfoTooltip text="สัดส่วนเปอร์เซ็นต์ของกองทุนนี้ในพอร์ตของคุณ" />
                                </span>
                            </div>
                            {items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 group">
                                    <div className="flex-1 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-xl flex items-center justify-between border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <FundLogo ticker={item.ticker} className="w-8 h-8 text-xs" />
                                            <span className="font-bold whitespace-nowrap">{item.ticker}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                value={item.weight}
                                                onChange={(e) => handleUpdateWeight(idx, Number(e.target.value))}
                                                className="w-16 bg-transparent text-right outline-none font-medium"
                                            />
                                            <span className="text-slate-400">%</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveItem(idx)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}

                            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-2">
                                <span className="text-sm font-medium text-slate-500">{t.portfolio.totalWeight}</span>
                                <span className={`font-bold ${totalWeight !== 100 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                    {totalWeight}%
                                </span>
                            </div>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={analyzePortfolio}
                            disabled={isAnalyzing || items.length === 0}
                            className="w-full mt-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-soft transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isAnalyzing ? <RefreshCw className="animate-spin" size={18} /> : <PieChart size={18} />}
                            {isAnalyzing ? t.portfolio.analyzing : t.portfolio.analyzePortfolio}
                        </motion.button>
                    </div>
                </div>

                {/* Right Column: Results */}
                <div className="lg:col-span-2 space-y-6">
                    {!hasAnalyzed ? (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-white/30 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 backdrop-blur-sm">
                            <PieChart size={48} className="mb-4 opacity-50" />
                            <p className="font-medium text-lg">{t.portfolio.addFundsClickAnalyze}</p>
                            <p className="text-sm">{t.portfolio.calculateExposure}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 h-[800px]">
                            {/* Top: Map */}
                            <div className="relative flex flex-col rounded-[30px] overflow-hidden shadow-glass border border-white/40 dark:border-white/10 h-[400px]">
                                <div className="absolute top-6 left-6 z-20 pointer-events-none">
                                    <div className="glass-panel p-4 rounded-2xl shadow-lg border border-white/40 dark:border-white/10 backdrop-blur-md bg-white/60 dark:bg-slate-900/60 inline-flex flex-col gap-1">
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t.portfolio.aggregatedGeography}</h2>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{aggCountries.length} {t.portfolio.countries}</p>
                                    </div>
                                </div>
                                <WorldMap weights={aggCountries} sectors={aggSectors} />
                            </div>

                            {/* Bottom: Holdings */}
                            <div className="h-[380px]">
                                <HoldingsCard holdings={aggHoldings} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
