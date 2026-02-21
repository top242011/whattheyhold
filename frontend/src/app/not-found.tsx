"use client";

import Link from "next/link";
import { Search, ArrowRight, Home } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLocale } from "@/lib/i18n";
import { sanitizeTicker } from "@/lib/sanitize";

export default function NotFound() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const { t } = useLocale();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) {
            toast.error(t.toast.enterTickerShort);
            return;
        }
        router.push(`/fund/${query.trim().toUpperCase()}`);
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>
                <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-indigo-300/10 blur-[100px]"></div>
            </div>

            <div className="glass-panel max-w-lg w-full p-8 md:p-12 rounded-[30px] shadow-2xl relative z-10 text-center border border-white/40 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary shadow-inner">
                    <Search size={40} className="opacity-80" />
                </div>

                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                    {t.notFound.title}
                </h1>

                <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">
                    {t.notFound.description}
                </p>

                <form onSubmit={handleSearch} className="mb-8 relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(sanitizeTicker(e.target.value))}
                        className="w-full pl-11 pr-12 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder-slate-400 transition-all shadow-sm group-hover:shadow-md"
                        placeholder={t.notFound.searchPlaceholder}
                    />
                    <button
                        type="submit"
                        className="absolute inset-y-1 right-1 bg-primary hover:bg-primary-dark text-white p-2.5 rounded-lg transition-colors shadow-sm"
                        aria-label="Search"
                    >
                        <ArrowRight size={18} />
                    </button>
                </form>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-primary font-medium transition-colors group"
                >
                    <Home size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span>{t.notFound.backHome}</span>
                </Link>
            </div>
        </div>
    );
}
