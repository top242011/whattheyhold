"use client";

import React, { useState, useRef, useEffect } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";
import { CountryWeight, SectorWeight } from "@/types/fund";
import { useLocale } from "@/lib/i18n";
import { SectorTreeMap } from "./SectorTreeMap";
import { analytics } from "@/lib/analytics";

// Public topojson URL
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Single vivid color for countries with holdings
const HIGHLIGHT_COLOR = "#0ea5e9";
const EMPTY_COLOR_LIGHT = "#cbd5e1";  // slate-300
const EMPTY_COLOR_DARK = "#334155";   // slate-700
const STROKE_COLOR_LIGHT = "#94a3b8"; // slate-400
const STROKE_COLOR_DARK = "#475569";  // slate-600

// Map numeric country codes to [longitude, latitude] for auto-zooming
const COUNTRY_COORDINATES: Record<string, [number, number]> = {
    "840": [-95.7129, 37.0902], // USA
    "156": [104.1954, 35.8617], // China
    "392": [138.2529, 36.2048], // Japan
    "826": [-3.4360, 55.3781],  // UK
    "276": [10.4515, 51.1657],  // Germany
    "250": [2.2137, 46.2276],   // France
    "356": [78.9629, 20.5937],  // India
    "076": [-51.9253, -14.2350],// Brazil
    "124": [-106.3468, 56.1304],// Canada
    "036": [133.7751, -25.2744],// Australia
    "756": [8.2275, 46.8182],   // Switzerland
    "410": [127.7669, 35.9078], // South Korea
    "158": [120.9605, 23.6978], // Taiwan
    "528": [5.2913, 52.1326],   // Netherlands
    "752": [18.6435, 60.1282],  // Sweden
    "764": [100.9925, 15.8700], // Thailand
};

interface WorldMapProps {
    weights: CountryWeight[];
    sectors?: SectorWeight[];
    view?: "weight" | "sector";
    onViewChange?: (v: "weight" | "sector") => void;
}

const colors = [
    "bg-sky-500", "bg-indigo-500", "bg-emerald-500", "bg-amber-500",
    "bg-rose-500", "bg-purple-500", "bg-cyan-500", "bg-fuchsia-500",
    "bg-teal-500", "bg-orange-500", "bg-violet-500", "bg-pink-500"
];

export function WorldMap({ weights, sectors = [], view: externalView, onViewChange }: WorldMapProps) {
    const [tooltipContent, setTooltipContent] = useState("");
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
    const [internalView, setInternalView] = useState<"weight" | "sector">("weight");
    const view = externalView ?? internalView;
    const setView = onViewChange ?? setInternalView;
    const [isDark, setIsDark] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { t } = useLocale();

    useEffect(() => {
        const check = () => setIsDark(document.documentElement.classList.contains("dark"));
        check();
        const observer = new MutationObserver(check);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    // Auto-zoom if there is exactly one country with weight > 0
    useEffect(() => {
        const activeWeights = weights.filter((w) => w.weight_pct > 0);
        if (activeWeights.length === 1) {
            const countryCode = activeWeights[0].country_code;
            if (COUNTRY_COORDINATES[countryCode]) {
                setPosition({
                    coordinates: COUNTRY_COORDINATES[countryCode],
                    zoom: 2.5
                });
            }
        } else {
            // Reset if multiple or none
            setPosition({ coordinates: [0, 0], zoom: 1 });
        }
    }, [weights]);

    const getWeight = (geoCode: string) => {
        const country = weights.find((c) => c.country_code === geoCode);
        return country ? country.weight_pct : 0;
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-[30px] overflow-hidden relative flex items-center justify-center border border-white/20"
        >
            <AnimatePresence>
                <motion.div className="w-full h-full absolute inset-0 transition-opacity" style={{ opacity: view === "weight" ? 1 : 0, pointerEvents: view === "weight" ? "auto" : "none" }}>
                    <ComposableMap
                        projectionConfig={{
                            rotate: [-10, 0, 0],
                            scale: 147,
                        }}
                        className="w-full h-full"
                    >
                        <ZoomableGroup
                            zoom={position.zoom}
                            center={position.coordinates as [number, number]}
                            onMoveEnd={(pos) => setPosition(pos)}
                            maxZoom={4}
                            minZoom={1}
                        >
                            <Geographies geography={GEO_URL}>
                                {({ geographies }) =>
                                    geographies.map((geo) => {
                                        const weight = getWeight(geo.id);
                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill={weight > 0 ? HIGHLIGHT_COLOR : (isDark ? EMPTY_COLOR_DARK : EMPTY_COLOR_LIGHT)}
                                                stroke={isDark ? STROKE_COLOR_DARK : STROKE_COLOR_LIGHT}
                                                strokeWidth={0.5}
                                                style={{
                                                    default: { outline: "none", transition: "all 0.3s" },
                                                    hover: {
                                                        fill: "#47b4eb",
                                                        outline: "none",
                                                        cursor: "pointer",
                                                        filter: "drop-shadow(0 4px 6px rgba(71, 180, 235, 0.3))",
                                                    },
                                                    pressed: { outline: "none" },
                                                }}
                                                onMouseEnter={(evt) => {
                                                    const name = geo.properties.name;
                                                    const w = getWeight(geo.id);
                                                    setTooltipContent(`${name}: ${w > 0 ? w + "%" : "0%"}`);

                                                    // Calculate relative position within container
                                                    if (containerRef.current) {
                                                        const rect = containerRef.current.getBoundingClientRect();
                                                        setTooltipPos({
                                                            x: evt.clientX - rect.left,
                                                            y: evt.clientY - rect.top
                                                        });
                                                    }
                                                }}
                                                onClick={() => {
                                                    // Track map click event
                                                    const w = getWeight(geo.id);
                                                    if (w > 0) {
                                                        analytics.trackEvent("map_click", {
                                                            country_code: geo.id,
                                                            country_name: geo.properties.name,
                                                            weight_pct: w
                                                        });
                                                    }
                                                }}
                                                onMouseMove={(evt) => {
                                                    if (containerRef.current) {
                                                        const rect = containerRef.current.getBoundingClientRect();
                                                        setTooltipPos({
                                                            x: evt.clientX - rect.left,
                                                            y: evt.clientY - rect.top
                                                        });
                                                    }
                                                }}
                                                onMouseLeave={() => {
                                                    setTooltipContent("");
                                                }}
                                            />
                                        );
                                    })
                                }
                            </Geographies>
                        </ZoomableGroup>
                    </ComposableMap>
                </motion.div>

                {/* Sector Tree Map View */}
                {view === "sector" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-50 dark:bg-slate-900 z-10 p-4 lg:p-8 flex flex-col gap-2 rounded-[30px]"
                    >
                        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 pt-16">
                            Industry Heat Map
                        </h3>
                        <div className="flex-1 w-full h-full pb-4 pr-4">
                            <SectorTreeMap sectors={sectors} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Map Controls */}
            {view === "weight" && (
                <div className="absolute bottom-6 left-6 flex flex-col gap-2 z-20">
                    <div className="glass-panel p-1.5 rounded-xl shadow-soft flex flex-col gap-1 bg-white/80 dark:bg-slate-800/80">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setPosition((pos) => ({ ...pos, zoom: Math.min(pos.zoom * 1.2, 4) }))}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                            aria-label={t.map.zoomIn}
                        >
                            +
                        </motion.button>
                        <div className="h-px w-full bg-slate-200 dark:bg-slate-700"></div>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setPosition((pos) => ({ ...pos, zoom: Math.max(pos.zoom / 1.2, 1) }))}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                            aria-label={t.map.zoomOut}
                        >
                            -
                        </motion.button>
                    </div>
                </div>
            )}


            {/* Floating Tooltip */}
            {tooltipContent && (
                <div
                    className="absolute pointer-events-none z-30 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl animate-fade-in-up"
                    style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 10 }}
                >
                    {tooltipContent}
                </div>
            )}

            {/* View Toggles — only on desktop (mobile rendered by parent) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden lg:block">
                <MapViewToggle view={view} onViewChange={setView} />
            </div>
        </div>
    );
}

/** Standalone toggle component, used by parent on mobile */
export function MapViewToggle({ view, onViewChange }: { view: "weight" | "sector"; onViewChange: (v: "weight" | "sector") => void }) {
    const { t } = useLocale();
    return (
        <div className="glass-panel p-1.5 rounded-full shadow-lg flex items-center gap-1 bg-white/80 dark:bg-slate-800/80 w-fit mx-auto">
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onViewChange("weight")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${view === "weight"
                    ? "bg-slate-900 text-white shadow-md"
                    : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                aria-label={t.map.viewByWeight}
            >
                {t.map.byWeight}
            </motion.button>
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onViewChange("sector")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${view === "sector"
                    ? "bg-slate-900 text-white shadow-md"
                    : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                aria-label={t.map.viewBySector}
            >
                {t.map.bySector}
            </motion.button>
        </div>
    );
}
