"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { en } from "./translations/en";
import { th } from "./translations/th";
import type { Translations } from "./translations/en";

export type Locale = "en" | "th";

const dictionaries: Record<Locale, Translations> = { en, th };

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Translations;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => { },
  t: en,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Read from <html lang="..."> which is set synchronously by the inline script in layout.tsx
    if (typeof document !== "undefined") {
      const htmlLang = document.documentElement.lang;
      if (htmlLang === "th" || htmlLang === "en") return htmlLang as Locale;
    }
    return "en";
  });

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: dictionaries[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
