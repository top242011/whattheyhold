"use client";

import { login, signup } from "./actions";
import { PieChart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
    const { t } = useLocale();
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const message = searchParams.get("message");

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-secondary-mint/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-8">
                    <ArrowLeft size={16} />
                    {t.login.backToHome}
                </Link>

                <div className="flex justify-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary shadow-inner">
                        <PieChart size={28} />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {t.login.welcome}
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                    {t.login.subtitle}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl py-8 px-4 shadow-glass sm:rounded-3xl sm:px-10 border border-white/20 dark:border-white/10">
                    <form className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t.login.email}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    maxLength={254}
                                    pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                                    title={t.login.emailValidation}
                                    placeholder={t.login.emailPlaceholder}
                                    className="appearance-none block w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t.login.password}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    minLength={6}
                                    maxLength={128}
                                    title={t.login.passwordValidation}
                                    className="appearance-none block w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-500/10 p-3 rounded-lg text-center">
                                {error}
                            </p>
                        )}

                        {message && (
                            <p className="text-sm text-emerald-500 font-medium bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-lg text-center">
                                {message}
                            </p>
                        )}

                        <div className="flex gap-4">
                            <button
                                formAction={login}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors cursor-pointer"
                            >
                                {t.login.signIn}
                            </button>
                            <button
                                formAction={signup}
                                className="w-full flex justify-center py-3 px-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-sm font-bold text-slate-700 dark:text-slate-300 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors cursor-pointer"
                            >
                                {t.login.signUp}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
