"use client";

import Link from "next/link";
import { PieChart, Menu, Check, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "../ThemeToggle";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { useLocale } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { sanitizeEmail, isValidEmail } from "@/lib/sanitize";
import { toast } from "sonner";

const STORAGE_KEY = "wth_subscribed";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [justSubscribed, setJustSubscribed] = useState(false);
    const [email, setEmail] = useState("");
    const { t } = useLocale();

    useEffect(() => {
        setIsSubscribed(localStorage.getItem(STORAGE_KEY) === "true");
    }, []);

    const handleSubscribe = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!email.trim() || !isValidEmail(email)) {
            toast.error(t.toast.enterValidEmail || "Please enter a valid email");
            return;
        }
        try {
            const res = await fetch("/api/waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), source: "navbar" }),
            });
            if (!res.ok) throw new Error();
            localStorage.setItem(STORAGE_KEY, "true");
            setJustSubscribed(true);
            setIsSubscribed(true);
        } catch {
            toast.error(t.toast.somethingWentWrong || "Something went wrong. Please try again.");
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/90 border-b border-slate-100 dark:border-slate-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 cursor-pointer group">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                            <PieChart size={24} />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            WhatTheyHold
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="hidden md:flex items-center gap-4 lg:gap-8">
                        <Link
                            href="/screen"
                            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors whitespace-nowrap"
                        >
                            <span className="lg:hidden">{t.nav.screeningShort}</span>
                            <span className="hidden lg:inline">{t.nav.screening}</span>
                        </Link>
                        <Link
                            href="/portfolio"
                            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors whitespace-nowrap"
                        >
                            <span className="lg:hidden">{t.nav.portfolioShort}</span>
                            <span className="hidden lg:inline">{t.nav.portfolio}</span>
                        </Link>
                        <Link
                            href="/compare"
                            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors whitespace-nowrap"
                        >
                            {t.nav.compare}
                        </Link>

                    </nav>

                    {/* CTA */}
                    <div className="hidden md:flex items-center gap-4">
                        <LanguageSwitcher />
                        <ThemeToggle />

                        <AnimatePresence mode="wait">
                            {isSubscribed ? (
                                <motion.div
                                    key="subscribed"
                                    initial={justSubscribed ? { scale: 0.8, opacity: 0 } : false}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                    className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-800/50"
                                >
                                    <motion.div
                                        initial={justSubscribed ? { rotate: -180, scale: 0 } : false}
                                        animate={{ rotate: 0, scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.1 }}
                                    >
                                        <Check size={16} className="text-emerald-600 dark:text-emerald-400" />
                                    </motion.div>
                                    <motion.span
                                        initial={justSubscribed ? { opacity: 0, x: -10 } : false}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 whitespace-nowrap"
                                    >
                                        {t.nav.subscribedText}
                                    </motion.span>
                                    {justSubscribed && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.35, type: "spring" }}
                                        >
                                            <Sparkles size={14} className="text-emerald-500 dark:text-emerald-400" />
                                        </motion.div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="subscribe-form"
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-full border border-slate-200 dark:border-slate-700/50 w-72"
                                >
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(sanitizeEmail(e.target.value))}
                                        placeholder={t.nav.subscribePlaceholder}
                                        className="bg-transparent border-none outline-none text-sm px-3 py-1 w-full text-slate-900 dark:text-white placeholder:text-slate-400"
                                        required
                                    />
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSubscribe}
                                        className="bg-primary hover:bg-primary-dark text-white text-sm font-bold py-1.5 px-4 rounded-full shadow-soft transition-colors whitespace-nowrap"
                                    >
                                        {t.nav.subscribe}
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Mobile Menu Button */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsMenuOpen(true)}
                        className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label="Toggle menu"
                    >
                        <Menu size={24} />
                    </motion.button>
                </div>
            </div>

            <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </header>
    );
}
