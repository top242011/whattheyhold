import { CuteLoader } from "@/components/CuteLoader";

export function FundSkeleton() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col overflow-hidden relative selection:bg-primary selection:text-white">
            {/* Background Decoration */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-300/10 blur-[100px]"></div>
                <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"></div>
            </div>

            {/* Nav and Loader Skeleton */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                <CuteLoader />
            </div>

            {/* Nav Skeleton Placeholder */}
            <div className="w-full h-[88px] flex justify-center py-6 px-4 animate-pulse">
                <div className="h-10 w-96 bg-white/50 dark:bg-slate-800/50 rounded-full backdrop-blur-md"></div>
            </div>

            {/* Main Grid */}
            <main className="relative z-10 flex-1 w-full h-full p-6 pt-4 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 max-w-[1400px] mx-auto opacity-30 pointer-events-none">
                {/* Left: Map Skeleton */}
                <div className="relative flex flex-col h-full min-h-[50vh] lg:min-h-0 rounded-[30px] overflow-hidden shadow-glass border border-white/40 dark:border-white/10 bg-slate-100 dark:bg-slate-900/50 animate-pulse">
                    {/* Overlay Skeleton */}
                    <div className="absolute top-6 left-6 z-20">
                        <div className="w-64 h-32 bg-white/50 dark:bg-slate-800/50 rounded-2xl backdrop-blur-md"></div>
                    </div>
                </div>

                {/* Right: Side Card Skeleton */}
                <div className="h-full rounded-[30px] shadow-glass border border-white/40 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 flex flex-col gap-6 animate-pulse">
                    <div className="h-8 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                    <div className="space-y-4 flex-1">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                </div>
                                <div className="w-12 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
