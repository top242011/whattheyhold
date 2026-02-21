"use client";

import { X, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "../ThemeToggle";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { useLocale } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { sanitizeEmail, isValidEmail } from "@/lib/sanitize";
import { toast } from "sonner";

const STORAGE_KEY = "wth_subscribed";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    const [shouldRender, setShouldRender] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [justSubscribed, setJustSubscribed] = useState(false);
    const [email, setEmail] = useState("");
    const { t } = useLocale();

    useEffect(() => {
        if (isOpen) setShouldRender(true);
    }, [isOpen]);

    useEffect(() => {
        setIsSubscribed(localStorage.getItem(STORAGE_KEY) === "true");
    }, []);

    const handleSubscribe = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!email.trim() || !isValidEmail(email)) {
            toast.error(t.toast.enterValidEmail || "Please enter a valid email");
            return;
        }
        localStorage.setItem(STORAGE_KEY, "true");
        setJustSubscribed(true);
        setIsSubscribed(true);
    };

    if (!shouldRender) return null;

    const handleAnimationEnd = () => {
        if (!isOpen) setShouldRender(false);
    };

    return (
        <div
            className={`fixed inset-0 z-[60] md:hidden transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`absolute top-0 left-0 w-full bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 shadow-xl transition-transform duration-300 ease-out ${isOpen ? "translate-y-0" : "-translate-y-full"
                    }`}
                onTransitionEnd={handleAnimationEnd}
            >
                <div className="flex flex-col p-6 gap-6">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-lg text-slate-900 dark:text-white">{t.nav.menu}</span>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Close menu"
                        >
                            <X size={24} />
                        </motion.button>
                    </div>

                    <nav className="flex flex-col gap-4">
                        <Link
                            href="/screen"
                            onClick={onClose}
                            className="text-lg font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors py-2"
                        >
                            {t.nav.screening}
                        </Link>
                        <Link
                            href="/portfolio"
                            onClick={onClose}
                            className="text-lg font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors py-2"
                        >
                            {t.nav.portfolio}
                        </Link>
                        <Link
                            href="/compare"
                            onClick={onClose}
                            className="text-lg font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors py-2"
                        >
                            {t.nav.compare}
                        </Link>

                    </nav>

                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600 dark:text-slate-300 font-medium">{t.nav.theme}</span>
                            <div className="flex items-center gap-2">
                                <LanguageSwitcher />
                                <ThemeToggle />
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {isSubscribed ? (
                                <motion.div
                                    key="subscribed"
                                    initial={justSubscribed ? { scale: 0.8, opacity: 0 } : false}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                    className="flex items-center justify-center gap-3 bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/50"
                                >
                                    <motion.div
                                        initial={justSubscribed ? { rotate: -180, scale: 0 } : false}
                                        animate={{ rotate: 0, scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.1 }}
                                    >
                                        <Check size={20} className="text-emerald-600 dark:text-emerald-400" />
                                    </motion.div>
                                    <motion.span
                                        initial={justSubscribed ? { opacity: 0, x: -10 } : false}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-base font-semibold text-emerald-700 dark:text-emerald-300"
                                    >
                                        {t.nav.subscribedText}
                                    </motion.span>
                                    {justSubscribed && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.35, type: "spring" }}
                                        >
                                            <Sparkles size={16} className="text-emerald-500 dark:text-emerald-400" />
                                        </motion.div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="subscribe-form"
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700"
                                >
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {t.nav.subscribeText}
                                    </p>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(sanitizeEmail(e.target.value))}
                                        placeholder={t.nav.subscribePlaceholder}
                                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-base px-4 py-3 w-full text-slate-900 dark:text-white placeholder:text-slate-400"
                                        required
                                    />
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSubscribe}
                                        className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-soft transition-colors cursor-pointer"
                                    >
                                        {t.nav.subscribe}
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

