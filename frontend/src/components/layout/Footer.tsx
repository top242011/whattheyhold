"use client";

import Link from "next/link";
import { PieChart, Twitter, Linkedin, Github, Facebook } from "lucide-react";
import { useLocale } from "@/lib/i18n";

export function Footer() {
    const { t } = useLocale();

    return (
        <footer className="bg-white dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                    <div className="col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
                            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                                <PieChart size={20} />
                            </div>
                            <span className="text-lg font-bold">WhatTheyHold</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mb-6">
                            {t.footer.tagline}
                        </p>
                        <div className="flex gap-4">
                            <Link
                                href="https://www.linkedin.com/in/panupan-pitak-559b86230/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-primary transition-colors"
                                aria-label="LinkedIn"
                            >
                                <Linkedin size={20} />
                            </Link>
                            <Link
                                href="https://github.com/top242011"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-primary transition-colors"
                                aria-label="GitHub"
                            >
                                <Github size={20} />
                            </Link>
                            <Link
                                href="https://web.facebook.com/top242011/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-primary transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook size={20} />
                            </Link>
                            <Link
                                href="https://x.com/Panu_ttt"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-primary transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter size={20} />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">
                            {t.footer.legal}
                        </h4>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <li>
                                <Link href="/privacy-policy" className="hover:text-primary transition-colors">
                                    {t.footer.privacy}
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms-of-service" className="hover:text-primary transition-colors">
                                    {t.footer.terms}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 text-xs text-slate-400">
                    <p className="shrink-0">{t.footer.copyright}</p>
                    <p className="max-w-3xl lg:text-right leading-relaxed text-slate-400/80">
                        {t.footer.disclaimer}
                    </p>
                </div>
            </div>
        </footer>
    );
}
