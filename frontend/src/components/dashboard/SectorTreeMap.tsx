"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import * as d3 from "d3-hierarchy";
import { motion } from "framer-motion";
import { SectorWeight } from "@/types/fund";
import { useLocale } from "@/lib/i18n";

interface SectorTreeMapProps {
    sectors: SectorWeight[];
}

const colors = [
    // Curated distinctive but professional palette
    "bg-[#1e3a8a] text-blue-50 border-blue-900/50",    // deep blue
    "bg-[#0369a1] text-sky-50 border-sky-900/50",      // sky dark
    "bg-[#0f766e] text-teal-50 border-teal-900/50",    // teal
    "bg-[#b45309] text-amber-50 border-amber-900/50",  // amber dark
    "bg-[#be123c] text-rose-50 border-rose-900/50",    // rose dark
    "bg-[#6d28d9] text-purple-50 border-purple-900/50",// purple
    "bg-[#047857] text-emerald-50 border-emerald-900/50", // emerald
    "bg-[#c2410c] text-orange-50 border-orange-900/50", // orange
];

export function SectorTreeMap({ sectors }: SectorTreeMapProps) {
    const { t } = useLocale();
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!containerRef.current) return;

        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };

        updateDimensions();
        const resizeObserver = new ResizeObserver(updateDimensions);
        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    const treemapNodes = useMemo(() => {
        if (dimensions.width === 0 || dimensions.height === 0 || !sectors?.length) return [];

        const validSectors = sectors.filter(s => s.weight_pct > 0).sort((a, b) => b.weight_pct - a.weight_pct);
        if (validSectors.length === 0) return [];

        // Build hierarchy for D3
        const rootNode = {
            name: "root",
            value: 0,
            children: validSectors.map(s => ({
                ...s,
                name: (t.industries as any)[s.sector] || s.sector,
                value: s.weight_pct
            }))
        };

        const hierarchy = d3.hierarchy<any>(rootNode).sum(d => d.value as number);

        const treemapLayout = d3.treemap()
            .size([dimensions.width, dimensions.height])
            .paddingInner(2)
            .paddingOuter(0)
            .round(true);

        const root = treemapLayout(hierarchy);
        return root.leaves();
    }, [sectors, dimensions, t.industries]);

    if (!sectors || sectors.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                No industry data available
            </div>
        );
    }

    return (
        <div ref={containerRef} className="w-full h-full relative">
            {treemapNodes.map((node, idx) => {
                const colorClass = colors[idx % colors.length];
                const width = node.x1 - node.x0;
                const height = node.y1 - node.y0;

                // Determine text size based on box dimensions
                const isSmallBox = width < 80 || height < 40;
                const isTinyBox = width < 50 || height < 30;

                return (
                    <motion.div
                        key={(node.data as any).sector}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        style={{
                            position: 'absolute',
                            left: `${node.x0}px`,
                            top: `${node.y0}px`,
                            width: `${width}px`,
                            height: `${height}px`,
                        }}
                        className={`absolute ${colorClass} border border-slate-900 overflow-hidden flex flex-col items-center justify-center p-1 sm:p-2 group shadow-sm hover:z-10 transition-all cursor-crosshair`}
                    >
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-200" />

                        {/* Only show text if box is large enough */}
                        {!isTinyBox && (
                            <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full">
                                <span className={`font-bold leading-tight drop-shadow-md truncate w-full ${isSmallBox ? 'text-[10px]' : 'text-sm sm:text-base'}`}>
                                    {(node.data as any).name}
                                </span>
                                <span className={`font-medium opacity-90 drop-shadow-md mt-0.5 ${isSmallBox ? 'text-[9px]' : 'text-xs sm:text-sm'}`}>
                                    {((node.data as any).value).toFixed(2)}%
                                </span>
                            </div>
                        )}

                        {/* Full Tooltip on Hover for all boxes regardless of size */}
                        <div className="absolute hidden group-hover:flex bg-slate-900 text-white text-xs px-2 py-1 rounded-md -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 pointer-events-none shadow-xl border border-slate-700">
                            {(node.data as any).name}: {((node.data as any).value).toFixed(2)}%
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
