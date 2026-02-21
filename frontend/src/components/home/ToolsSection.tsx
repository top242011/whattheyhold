"use client";

import { useLocale } from "@/lib/i18n";
import { Search, PieChart, Activity } from "lucide-react";
import Link from "next/link";

export function ToolsSection() {
    const { t } = useLocale();

    return (
        <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        {t.tools.title}
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-300">
                        {t.tools.description}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Tool 1 */}
                    <Link href="/screen" className="bg-white dark:bg-slate-800 rounded-2xl p-8 hover:translate-y-[-5px] transition-transform duration-300 border border-slate-200 dark:border-slate-700 hover:border-primary shadow-sm hover:shadow-md block">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-6">
                            <Search size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                            {t.nav.screening}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            {t.screen.description}
                        </p>
                    </Link>

                    {/* Tool 2 */}
                    <Link href="/portfolio" className="bg-white dark:bg-slate-800 rounded-2xl p-8 hover:translate-y-[-5px] transition-transform duration-300 border border-slate-200 dark:border-slate-700 hover:border-secondary-mint shadow-sm hover:shadow-md block">
                        <div className="w-14 h-14 rounded-2xl bg-secondary-mint/10 dark:bg-secondary-mint/20 flex items-center justify-center text-secondary-mint dark:text-green-400 mb-6">
                            <PieChart size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                            {t.nav.portfolio}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            {t.portfolio.description}
                        </p>
                    </Link>

                    {/* Tool 3 */}
                    <Link href="/compare" className="bg-white dark:bg-slate-800 rounded-2xl p-8 hover:translate-y-[-5px] transition-transform duration-300 border border-slate-200 dark:border-slate-700 hover:border-secondary-lavender shadow-sm hover:shadow-md block">
                        <div className="w-14 h-14 rounded-2xl bg-secondary-lavender/10 dark:bg-secondary-lavender/20 flex items-center justify-center text-secondary-lavender dark:text-purple-400 mb-6">
                            <Activity size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                            {t.nav.compare}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            {t.compare.title}
                        </p>
                    </Link>
                </div>
            </div>
        </section>
    );
}
