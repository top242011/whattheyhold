import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { LocaleProvider } from "@/lib/i18n";

// Initialize fonts
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WhatTheyHold - Visualizing ETF Holdings",
  description: "Visualize ETF and Mutual Fund holdings across the globe in seconds using our friendly, interactive tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${inter.variable} suppressHydrationWarning`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
          (function(){
            var t = localStorage.getItem('theme');
            if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme:dark)').matches))
              document.documentElement.classList.add('dark');
            var l = localStorage.getItem('locale');
            if (l === 'th' || l === 'en') document.documentElement.lang = l;
            else if (navigator.language && navigator.language.startsWith('th')) document.documentElement.lang = 'th';
          })();
        `}} />
      </head>
      <body
        className="antialiased"
      >
        <LocaleProvider>
          {children}
        </LocaleProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
