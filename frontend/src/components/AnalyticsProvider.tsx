"use client";

import { createContext, useContext, useEffect, useState, Suspense } from "react";
import { analytics } from "@/lib/analytics";
import { usePathname, useSearchParams } from "next/navigation";

interface AnalyticsContextType {
    hasConsent: boolean;
    setConsent: (granted: boolean) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
    hasConsent: false,
    setConsent: () => { },
});

function AnalyticsTracker({ hasConsent }: { hasConsent: boolean }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Track page views automatically when route changes
    useEffect(() => {
        if (hasConsent) {
            // Give a slight delay to allow session init to complete if it just started
            setTimeout(() => {
                analytics.trackEvent("page_view", {
                    path: pathname,
                    search: searchParams?.toString() || ""
                });
            }, 500);
        }
    }, [pathname, searchParams, hasConsent]);

    return null;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
    const [hasConsent, setHasConsentState] = useState(false);

    // Initialize consent state and session if already granted
    useEffect(() => {
        const consent = analytics.hasConsent();
        setHasConsentState(consent);

        if (consent) {
            analytics.initSession();
        }
    }, []);

    const handleSetConsent = (granted: boolean) => {
        analytics.setConsent(granted);
        setHasConsentState(granted);
    };

    return (
        <AnalyticsContext.Provider value={{ hasConsent, setConsent: handleSetConsent }}>
            <Suspense fallback={null}>
                <AnalyticsTracker hasConsent={hasConsent} />
            </Suspense>
            {children}
        </AnalyticsContext.Provider>
    );
}

export function useAnalytics() {
    return useContext(AnalyticsContext);
}
