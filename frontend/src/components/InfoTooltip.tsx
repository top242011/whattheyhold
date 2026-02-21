"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InfoTooltipProps {
    text: string;
}

export function InfoTooltip({ text }: InfoTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="relative inline-flex items-center ml-1.5"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onClick={() => setIsVisible(!isVisible)}
        >
            <Info size={14} className="text-slate-400 hover:text-primary dark:hover:text-primary cursor-help transition-colors" />

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 2, x: "-50%" }}
                        className="absolute bottom-full left-1/2 mb-2 w-48 p-2.5 bg-slate-900 dark:bg-slate-700 text-white text-xs font-medium rounded-xl shadow-xl z-50 pointer-events-none break-words text-center leading-relaxed"
                    >
                        {text}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-700" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
