"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n";

import { SearchBar } from "../SearchBar";

export function HeroSection() {
    const { t } = useLocale();

    return (
        <div className="relative w-full hero-gradient pt-20 pb-20 lg:pt-32 lg:pb-32 z-30">
            {/* Decorative blobs with their own overflow-hidden wrapper to avoid clipping the search dropdown */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-secondary-lavender/30 dark:bg-primary/10 rounded-full blur-3xl opacity-50 dark:opacity-20"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-secondary-mint/30 dark:bg-primary/10 rounded-full blur-3xl opacity-50 dark:opacity-20"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">


                {/* Heading */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-snug">
                    {t.hero.heading} <br className="hidden md:block" />
                    <span className="text-gradient">{t.hero.headingHighlight}</span>
                </h1>

                {/* Subheading */}
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                    {t.hero.subheading}
                </p>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-secondary-mint via-primary to-secondary-lavender rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-2 border border-slate-100 dark:border-slate-700 transition-all flex items-center">
                        <SearchBar />
                    </div>

                    {/* Popular tags */}
                    <div className="flex flex-wrap justify-center gap-2 mt-4 text-sm text-slate-500 dark:text-slate-400">
                        <span>{t.hero.popular}</span>
                        <Link href="/fund/VOO" className="hover:text-primary transition-colors underline decoration-dotted">
                            VOO
                        </Link>
                        <Link href="/fund/QQQ" className="hover:text-primary transition-colors underline decoration-dotted">
                            QQQ
                        </Link>
                        <Link href="/fund/VTI" className="hover:text-primary transition-colors underline decoration-dotted">
                            VTI
                        </Link>
                        <Link href="/fund/SCHD" className="hover:text-primary transition-colors underline decoration-dotted">
                            SCHD
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
