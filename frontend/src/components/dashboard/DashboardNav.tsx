"use client";

import { useState } from "react";
import { PieChart, Menu } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { LanguageSwitcher } from "../LanguageSwitcher";
import Link from "next/link";
import { SearchBar } from "../SearchBar";
import { MobileMenu } from "../layout/MobileMenu";
import { useLocale } from "@/lib/i18n";
import { motion } from "framer-motion";

interface DashboardNavProps {
    currentTicker?: string;
}

export function DashboardNav({ currentTicker = "" }: DashboardNavProps) {
    const { t } = useLocale();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="relative z-50 w-full px-6 pt-6 pb-2">
            <div className="max-w-[1400px] mx-auto">
                <div className="glass-panel shadow-soft rounded-full px-6 py-3 flex items-center justify-between gap-4 lg:gap-6">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity shrink-0">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                            <PieChart size={24} />
                        </div>
                        <h1 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight hidden sm:block">
                            WhatTheyHold
                        </h1>
                    </Link>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-4 lg:gap-6 shrink-0">
                        <Link
                            href="/screen"
                            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors whitespace-nowrap"
                        >
                            <span className="lg:hidden">{t.nav.screeningShort}</span>
                            <span className="hidden lg:inline">{t.nav.screening}</span>
                        </Link>
                        <Link
                            href="/portfolio"
                            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors whitespace-nowrap"
                        >
                            <span className="lg:hidden">{t.nav.portfolioShort}</span>
                            <span className="hidden lg:inline">{t.nav.portfolio}</span>
                        </Link>
                        <Link
                            href="/compare"
                            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors whitespace-nowrap"
                        >
                            {t.nav.compare}
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-xl min-w-0">
                        <SearchBar initialValue={currentTicker} />
                    </div>

                    {/* Right Actions (Desktop) */}
                    <div className="hidden md:flex items-center gap-3 shrink-0">
                        <LanguageSwitcher />
                        <ThemeToggle />
                    </div>

                    {/* Mobile Menu Button */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsMenuOpen(true)}
                        className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                        aria-label="Toggle menu"
                    >
                        <Menu size={24} />
                    </motion.button>
                </div>
            </div>

            <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </nav>
    );
}
