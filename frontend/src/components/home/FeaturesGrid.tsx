"use client";

import { Globe, PieChart, Gem } from "lucide-react";
import { useLocale } from "@/lib/i18n";

export function FeaturesGrid() {
    const { t } = useLocale();

    return (
        <section className="py-20 bg-white dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        {t.features.title}
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-300">
                        {t.features.description}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-soft-bg dark:bg-slate-800/50 rounded-2xl p-8 hover:translate-y-[-5px] transition-transform duration-300 border border-transparent hover:border-primary/20">
                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm dark:shadow-none flex items-center justify-center text-primary mb-6 dark:border dark:border-slate-700">
                            <Globe size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                            {t.features.globalExposure}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            {t.features.globalExposureDesc}
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-soft-bg dark:bg-slate-800/50 rounded-2xl p-8 hover:translate-y-[-5px] transition-transform duration-300 border border-transparent hover:border-secondary-mint/50">
                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm dark:shadow-none flex items-center justify-center text-secondary-mint dark:text-green-400 mb-6 dark:border dark:border-slate-700">
                            <PieChart size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                            {t.features.sectorBreakdown}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            {t.features.sectorBreakdownDesc}
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-soft-bg dark:bg-slate-800/50 rounded-2xl p-8 hover:translate-y-[-5px] transition-transform duration-300 border border-transparent hover:border-secondary-lavender/50">
                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm dark:shadow-none flex items-center justify-center text-secondary-lavender dark:text-purple-400 mb-6 dark:border dark:border-slate-700">
                            <Gem size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                            {t.features.hiddenGems}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            {t.features.hiddenGemsDesc}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
