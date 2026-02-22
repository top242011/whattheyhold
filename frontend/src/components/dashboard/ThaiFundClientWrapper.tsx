"use client";

import { useState } from "react";
import { DashboardNav } from "./DashboardNav";
import { Ghost } from "lucide-react";

interface Top5Holding {
    asset_name?: string;
    asset_name_th?: string;
    asset_name_en?: string;
    asset_ratio?: number;
    invest_prop?: number;
    [key: string]: any;
}

interface ThaiFundInfo {
    proj_id: string;
    proj_name_th: string;
    proj_name_en: string;
    proj_abbr_name?: string;
    amc_name_en?: string;
    fund_type?: string;
    risk_level?: string;
}

interface ThaiFundClientWrapperProps {
    ticker: string;
    data: {
        fund_info: ThaiFundInfo;
        top5_holdings: Top5Holding[];
    };
}

export function ThaiFundClientWrapper({ ticker, data }: ThaiFundClientWrapperProps) {
    const { fund_info, top5_holdings } = data;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const displayName = fund_info.proj_abbr_name || ticker;
    const fullName = fund_info.proj_name_en || fund_info.proj_name_th;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col overflow-hidden relative selection:bg-primary selection:text-white">
            {/* Background Decoration */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] rounded-full bg-primary/5 dark:bg-primary/3 blur-[120px]"></div>
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-300/10 dark:bg-indigo-400/5 blur-[100px]"></div>
            </div>

            {/* Nav */}
            <DashboardNav currentTicker={displayName} />

            <main className="relative z-10 flex-1 w-full p-6 pt-4 max-w-[800px] mx-auto overflow-hidden animate-fade-in-up">

                {/* Header Card */}
                <div className="bg-white/60 dark:bg-slate-900/40 rounded-3xl p-6 shadow-glass border border-white/40 dark:border-white/10 mb-6 backdrop-blur-md">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {displayName}
                                </h1>
                                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                    🇹🇭 TH Fund
                                </span>
                            </div>
                            <h2 className="text-lg text-slate-600 dark:text-slate-300 font-medium">
                                {fullName}
                            </h2>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {fund_info.amc_name_en && (
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                                        AMC: {fund_info.amc_name_en}
                                    </span>
                                )}
                                {fund_info.fund_type && (
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                                        Type: {fund_info.fund_type}
                                    </span>
                                )}
                                {fund_info.risk_level && (
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-medium whitespace-nowrap">
                                        Risk Level: {fund_info.risk_level}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top 5 Holdings Card */}
                <div className="bg-white/60 dark:bg-slate-900/40 rounded-3xl p-6 shadow-glass border border-white/40 dark:border-white/10 backdrop-blur-md">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Top 5 Holdings</h3>

                    {top5_holdings && top5_holdings.length > 0 ? (
                        <div className="space-y-3">
                            {top5_holdings.map((holding, idx) => {
                                const assetName = holding.asset_name || holding.asset_name_en || holding.asset_name_th || "Unknown Asset";
                                const pct = holding.asset_ratio || holding.invest_prop || 0;

                                return (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                {idx + 1}
                                            </div>
                                            <div className="font-medium text-slate-900 dark:text-white line-clamp-1">
                                                {assetName}
                                            </div>
                                        </div>
                                        <div className="font-bold text-slate-900 dark:text-white pl-4">
                                            {pct.toFixed(2)}%
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-center">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700/50 shadow-sm">
                                <Ghost className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
                                แง๊... ไม่พบข้อมูลพอร์ตการลงทุน
                            </h4>
                            <p className="text-sm max-w-[300px] mb-6 text-slate-500 dark:text-slate-400 leading-relaxed">
                                กองทุนนี้อาจไม่ได้เปิดเผยข้อมูลไส้ใน หรือระบบเรายังจับคู่กองทุนหลักให้ไม่เจอครับ
                            </p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                            >
                                แบ่งปันข้อมูลกับเรา
                            </button>
                        </div>
                    )}
                </div>

            </main>

            {/* Feedback Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl max-w-[400px] w-full border border-slate-200 dark:border-slate-800 animate-fade-in-up md:mb-20">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            คุณรู้จักกองทุนหลักของกองนี้ไหม?
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            ช่วยเราพัฒนาแพลตฟอร์มให้ดีขึ้น ด้วยการบอกชื่อหรือ Ticker ของกองทุนหลัก (Master Fund) ที่กองทุนนี้ไปลงทุน
                        </p>
                        <textarea
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 text-sm text-slate-900 dark:text-white mb-4 outline-none focus:ring-2 focus:ring-primary/50 resize-none min-h-[100px]"
                            placeholder="เช่น: ไปลงทุนใน QQQ หรือ Fidelity Global Tech..."
                            rows={3}
                        ></textarea>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    // In a real app, send data to backend here
                                }}
                                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                            >
                                ส่งข้อมูล
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
