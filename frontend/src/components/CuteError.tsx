"use client";

import { motion } from "framer-motion";

export function CuteError() {
    return (
        <div className="flex flex-col items-center justify-center gap-6">
            <div className="relative w-28 h-28">
                {/* Body - Red/Orange for error */}
                <motion.div
                    className="absolute inset-0 bg-red-400 dark:bg-red-500 rounded-[2rem] shadow-lg shadow-red-500/30"
                    animate={{
                        rotate: [-2, 2, -2],
                    }}
                    transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    {/* Face wrapper */}
                    <div className="w-full h-full relative">
                        {/* Dazed Eyes */}
                        <div className="absolute top-10 left-6 flex items-center justify-center">
                            <span className="text-2xl font-black text-slate-900 rotate-45 transform leading-none">×</span>
                        </div>
                        <div className="absolute top-10 right-6 flex items-center justify-center">
                            <span className="text-2xl font-black text-slate-900 rotate-45 transform leading-none">×</span>
                        </div>

                        {/* Sad/Squiggly Mouth */}
                        <motion.svg
                            className="absolute top-16 left-1/2 -translate-x-1/2 w-8 h-4 text-slate-900"
                            viewBox="0 0 24 12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                        >
                            <path d="M2 10 Q6 2 12 6 T22 10" />
                        </motion.svg>

                        {/* Band-aid */}
                        <div className="absolute top-4 right-4 w-8 h-3 bg-amber-200/90 rounded-sm rotate-45 shadow-sm border border-amber-300/50">
                            <div className="w-full h-full flex gap-1 items-center justify-center">
                                <span className="w-1 h-1 rounded-full bg-amber-600/20"></span>
                                <span className="w-1 h-1 rounded-full bg-amber-600/20"></span>
                            </div>
                        </div>

                        {/* Sweat drop */}
                        <motion.div
                            className="absolute top-6 left-2 w-3 h-4 bg-sky-200 rounded-b-full rounded-tr-full -rotate-45"
                            animate={{
                                y: [0, 5, 0],
                                opacity: [1, 0, 1]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    </div>
                </motion.div>

                {/* Shadow */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-3 bg-slate-900/10 dark:bg-black/30 rounded-full blur-sm" />
            </div>
        </div>
    );
}
