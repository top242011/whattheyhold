"use client";

import { useLocale } from "@/lib/i18n";
import { motion } from "framer-motion";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => setLocale(locale === "en" ? "th" : "en")}
      className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold transition-all"
      aria-label="Switch language"
    >
      {locale === "en" ? "TH" : "EN"}
    </motion.button>
  );
}
