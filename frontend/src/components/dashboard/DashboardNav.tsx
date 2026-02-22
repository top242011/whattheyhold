"use client";

import { PieChart } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { LanguageSwitcher } from "../LanguageSwitcher";
import Link from "next/link";
import { SearchBar } from "../SearchBar";

interface DashboardNavProps {
    currentTicker?: string;
}

export function DashboardNav({ currentTicker = "" }: DashboardNavProps) {

    return (
        <nav className="relative z-50 w-full px-6 pt-6 pb-2">
            <div className="max-w-[1400px] mx-auto">
                <div className="glass-panel shadow-soft rounded-full px-6 py-3 flex items-center justify-between gap-6">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                            <PieChart size={24} />
                        </div>
                        <h1 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight hidden sm:block">
                            WhatTheyHold
                        </h1>
                    </Link>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-xl">
                        <SearchBar initialValue={currentTicker} />
                    </div>


                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        <LanguageSwitcher />
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </nav>
    );
}
