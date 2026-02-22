import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { LocaleProvider } from "@/lib/i18n";
import { Footer } from "@/components/layout/Footer";

// Initialize fonts
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://whattheyhold.vercel.app"),
  title: {
    default: "WhatTheyHold - Visualizing ETF Holdings",
    template: "%s | WhatTheyHold",
  },
  description: "Visualize ETF and Mutual Fund holdings across the globe in seconds using our friendly, interactive tools.",
  openGraph: {
    title: "WhatTheyHold - Visualizing ETF Holdings",
    description: "Visualize ETF and Mutual Fund holdings across the globe in seconds.",
    type: "website",
    locale: "en_US",
    siteName: "WhatTheyHold",
  },
  robots: {
    index: true,
    follow: true,
  },
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
          <div className="flex flex-col min-h-screen">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
        </LocaleProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
