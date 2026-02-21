"use client";

import { motion } from "framer-motion";

export function CuteLoader() {
    return (
        <div className="flex flex-col items-center justify-center gap-6">
            <div className="relative w-24 h-24">
                {/* Body */}
                <motion.div
                    className="absolute inset-0 bg-primary rounded-[2rem] shadow-lg shadow-primary/30"
                    animate={{
                        y: [0, -10, 0],
                        scale: [1, 0.95, 1],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    {/* Face wrapper - moves slightly to give 3D effect */}
                    <motion.div
                        className="w-full h-full relative"
                        animate={{
                            y: [0, -2, 0],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.1, // Slight offset from body
                        }}
                    >
                        {/* Eyes */}
                        <div className="absolute top-8 left-6 w-3 h-3 bg-slate-900 rounded-full flex items-center justify-center">
                            <motion.div
                                className="w-1 h-1 bg-white rounded-full absolute top-[1px] right-[2px]"
                                animate={{ scaleY: [1, 0.1, 1, 1, 1] }}
                                transition={{ duration: 3, repeat: Infinity, times: [0, 0.1, 0.2, 0.8, 1] }}
                            />
                        </div>
                        <div className="absolute top-8 right-6 w-3 h-3 bg-slate-900 rounded-full flex items-center justify-center">
                            <motion.div
                                className="w-1 h-1 bg-white rounded-full absolute top-[1px] right-[2px]"
                                animate={{ scaleY: [1, 0.1, 1, 1, 1] }}
                                transition={{ duration: 3, repeat: Infinity, times: [0, 0.1, 0.2, 0.8, 1] }}
                            />
                        </div>

                        {/* Mouth */}
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-4 h-2 bg-slate-900 rounded-b-full"></div>

                        {/* Blush */}
                        <div className="absolute top-10 left-3 w-3 h-2 bg-pink-400/50 rounded-full blur-[1px]"></div>
                        <div className="absolute top-10 right-3 w-3 h-2 bg-pink-400/50 rounded-full blur-[1px]"></div>
                    </motion.div>
                </motion.div>

                {/* Shadow */}
                <motion.div
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-2 bg-slate-900/10 dark:bg-black/30 rounded-full blur-sm"
                    animate={{
                        scale: [1, 0.8, 1],
                        opacity: [0.5, 0.2, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>

            {/* Loading text with dancing dots */}
            <div className="flex items-center text-slate-500 font-medium tracking-wide">
                <span>Loading</span>
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                >.</motion.span>
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                >.</motion.span>
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                >.</motion.span>
            </div>
        </div>
    );
}
