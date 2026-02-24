"use client";

import { useEffect, useState } from "react";
import { useAnalytics } from "./AnalyticsProvider";
import { X } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);
    const { hasConsent, setConsent } = useAnalytics();
    const { t, locale } = useLocale();

    useEffect(() => {
        // Check if user has answered the consent prompt yet
        // We use localStorage directly here to check for existence, 
        // because hasConsent only returns true/false (granted or not)
        const stored = localStorage.getItem('analytics_consent');
        if (stored === null) {
            // Delay showing the banner slightly for better UX
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [hasConsent]);

    const handleAccept = () => {
        setConsent(true);
        setIsVisible(false);
    };

    const handleDecline = () => {
        setConsent(false);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom flex justify-center pointer-events-none">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-8 justify-between max-w-4xl w-full pointer-events-auto ring-1 ring-black/5 dark:ring-white/10">

                <div className="flex-1 text-sm text-slate-600 dark:text-slate-300">
                    <p className="font-medium text-slate-900 dark:text-white mb-1">
                        {locale === 'th' ? "การตั้งค่าคุกกี้และความเป็นส่วนตัว" : "Cookie & Privacy Preferences"}
                    </p>
                    <p>
                        {locale === 'th'
                            ? "เราขอความยินยอมในการเก็บข้อมูลการใช้งานแบบไม่ระบุตัวตน (Anonymous) เพื่อนำไปพัฒนาประสบการณ์ใช้งานและสร้างบทวิเคราะห์เทรนด์ตลาด"
                            : "We ask for your consent to collect anonymous usage data to improve your experience and develop market insights."}
                        <Link href="/privacy-policy" className="text-primary hover:underline underline-offset-2">
                            {locale === 'th' ? "อ่านนโยบายความเป็นส่วนตัว" : "Read Privacy Policy"}
                        </Link>
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
                    <button
                        onClick={handleDecline}
                        className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    >
                        {locale === 'th' ? "ปฏิเสธ" : "Decline"}
                    </button>
                    <button
                        onClick={handleAccept}
                        className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 rounded-xl transition-colors"
                    >
                        {locale === 'th' ? "ยินยอม" : "Accept"}
                    </button>
                    <button
                        onClick={handleAccept}
                        className="hidden md:flex p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
