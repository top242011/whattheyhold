"use client";

import { useState } from "react";

interface CompanyLogoProps {
  ticker: string;
  size?: number;
}

export function CompanyLogo({ ticker, size = 40 }: CompanyLogoProps) {
  const [failed, setFailed] = useState(false);
  const logoUrl = `https://financialmodelingprep.com/image-stock/${ticker.toUpperCase()}.png`;

  if (failed) {
    return (
      <div
        className="rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        <span className="font-bold text-xs text-slate-600 dark:text-slate-300">
          {ticker.slice(0, 2)}
        </span>
      </div>
    );
  }

  return (
    <div
      className="rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden shadow-sm"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt={`${ticker} logo`}
        width={size - 8}
        height={size - 8}
        className="object-contain"
        onError={() => setFailed(true)}
        loading="lazy"
      />
    </div>
  );
}
