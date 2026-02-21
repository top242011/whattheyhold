"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import { CuteError } from "@/components/CuteError";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const { t } = useLocale();

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] rounded-full bg-red-500/5 blur-[120px]"></div>
            </div>

            <div className="relative z-10 glass-panel p-10 rounded-[32px] text-center max-w-md w-full border border-white/20 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl">
                <div className="mb-6 scale-90">
                    <CuteError />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {t.error.title}
                </h2>

                <p className="text-slate-500 dark:text-slate-400 mb-8">
                    {t.error.description}
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={() => reset()}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                    >
                        <RotateCw size={18} />
                        {t.error.tryAgain}
                    </button>
                    <Link
                        href="/"
                        className="flex-1 flex items-center justify-center px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl font-bold transition-all"
                    >
                        {t.error.goHome}
                    </Link>
                </div>
            </div>
        </div>
    );
}
