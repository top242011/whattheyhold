"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n";

export function UserButton() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();
    const { t } = useLocale();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push("/");
        toast.success("Signed out successfully");
    };

    if (loading) {
        return (
            <div className="hidden sm:flex h-10 w-24 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
        );
    }

    if (!user) {
        return (
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/login')}
                className="hidden sm:flex h-10 px-4 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium transition-colors cursor-pointer text-slate-900 dark:text-white"
            >
                {t.nav.login}
            </motion.button>
        );
    }

    const initial = user.email ? user.email[0].toUpperCase() : "U";

    return (
        <div className="hidden sm:flex items-center gap-2">
            <div className="flex h-10 px-4 items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-medium border border-slate-200 dark:border-slate-700">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-indigo-400 text-white flex items-center justify-center text-xs font-bold">
                    {initial}
                </div>
                <span className="truncate max-w-[150px] text-slate-700 dark:text-slate-300">{user.email}</span>
            </div>

            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSignOut}
                className="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-full bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-900/20 text-slate-600 hover:text-red-500 dark:text-slate-300 dark:hover:text-red-400 transition-colors cursor-pointer"
                title="Sign Out"
            >
                <LogOut size={16} />
            </motion.button>
        </div>
    );
}
