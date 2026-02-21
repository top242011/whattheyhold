import React from 'react';
import { Building2 } from 'lucide-react';

interface FundLogoProps {
    ticker: string;
    name?: string;
    className?: string;
}

export function FundLogo({ ticker, name = '', className = "w-12 h-12" }: FundLogoProps) {
    const n = name.toLowerCase();
    const t = ticker.toUpperCase();

    const baseCircleClasses = `flex items-center justify-center rounded-full shadow-inner overflow-hidden shrink-0 ${className}`;

    // Fallback to the environment variable or fixed URL
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const getLogoUrl = (issuer: string) => `${SUPABASE_URL}/storage/v1/object/public/logos/${issuer}.png`;

    const renderLogo = (issuer: string, fallbackBorderBg: string) => (
        <div className={`${baseCircleClasses} bg-slate-100 dark:bg-slate-800 border ${fallbackBorderBg}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={getLogoUrl(issuer)}
                alt={`${issuer} logo`}
                className="w-[80%] h-[80%] object-contain"
                onError={(e) => {
                    // Fallback visually if image fails
                    e.currentTarget.style.display = 'none';
                }}
            />
        </div>
    );

    if (n.includes('vanguard') || t.startsWith('V')) { // Vanguard often starts with V (VOO, VTI, VXUS)
        return renderLogo('vanguard', 'border-rose-200 dark:border-rose-800/50');
    } else if (n.includes('ishares') || n.includes('blackrock') || t.startsWith('I')) { // iShares often starts with I (IVV, IJH)
        return renderLogo('ishares', 'border-slate-300 dark:border-slate-700');
    } else if (n.includes('spdr') || n.includes('state street') || t === 'SPY') {
        return renderLogo('spdr', 'border-blue-200 dark:border-blue-800/50');
    } else if (n.includes('invesco') || t === 'QQQ') {
        return renderLogo('invesco', 'border-sky-200 dark:border-sky-800/50');
    } else if (n.includes('charles schwab') || n.includes('schwab') || t.startsWith('SCH')) {
        return renderLogo('charles_schwab', 'border-indigo-200 dark:border-indigo-800/50');
    } else if (n.includes('fidelity') || t.startsWith('F')) {
        return renderLogo('fidelity', 'border-emerald-200 dark:border-emerald-800/50');
    } else if (n.includes('ark') || t.startsWith('ARK')) {
        return renderLogo('ark', 'border-purple-200 dark:border-purple-800/50');
    } else if (n.includes('wisdomtree') || t.startsWith('WT')) {
        return renderLogo('wisdomtree', 'border-teal-200 dark:border-teal-800/50');
    } else if (n.includes('global x')) {
        return renderLogo('global_x', 'border-orange-200 dark:border-orange-800/50');
    }

    // Fallback
    return (
        <div className={`${baseCircleClasses} bg-primary/10 text-primary border border-primary/20`}>
            <Building2 size={20} className="opacity-70" />
        </div>
    );
}
