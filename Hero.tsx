import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Sparkles, Truck, Check, ShieldCheck, Flame, ArrowUpRight, 
  ChevronLeft, ChevronRight, Pause, Play, Store, Tag, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "../types";
import { getProductColorImage } from "../data";

interface HeroProps {
  brandName: string;
  theme: "dark" | "light";
  products: Product[];
  currencySymbol: string;
  onSelectProduct: (product: Product) => void;
}

export default function Hero({ 
  brandName, 
  theme, 
  products = [], 
  currencySymbol = "₹", 
  onSelectProduct 
}: HeroProps) {
  const isDark = theme === "dark";

  // Filter featured articles selected in Merchant Hub (or fallback to top 4 products)
  const featuredArticles = useMemo(() => {
    const list = products.filter((p) => p.isFeatured);
    return list.length > 0 ? list : products.slice(0, 4);
  }, [products]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slideColorOverrides, setSlideColorOverrides] = useState<Record<string, string>>({});

  // Ensure current index is within bounds if products list changes
  useEffect(() => {
    if (currentIndex >= featuredArticles.length) {
      setCurrentIndex(0);
    }
  }, [featuredArticles.length, currentIndex]);

  // Slideshow auto-rotation timer (4.5s)
  useEffect(() => {
    if (isPaused || featuredArticles.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredArticles.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, featuredArticles.length]);

  const currentArticle = featuredArticles[currentIndex] || products[0];

  const handlePrevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? featuredArticles.length - 1 : prev - 1));
  };

  const handleNextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % featuredArticles.length);
  };

  const activeColor = currentArticle
    ? slideColorOverrides[currentArticle.id] || currentArticle.colors?.[0]?.name || ""
    : "";

  const slideImage = currentArticle
    ? getProductColorImage(currentArticle, activeColor) || currentArticle.images?.[0]
    : "";

  return (
    <div 
      className={`relative overflow-hidden border-b py-10 md:py-16 transition-all duration-300 ${
        isDark 
          ? "bg-zinc-900/40 border-zinc-900" 
          : "bg-zinc-50 border-b border-zinc-200/60"
      }`} 
      id="hero-section"
    >
      {/* Decorative Grid Accent */}
      <div 
        className={`absolute inset-0 bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 ${
          isDark
            ? "bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)]"
            : "bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]"
        }`} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
          {/* Left Column: Hero Brand Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className={`inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-full font-semibold shadow-xs ${
                isDark ? "bg-white text-zinc-950" : "bg-zinc-900 text-white"
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 animate-spin-slow ${isDark ? "text-amber-500 fill-amber-500" : "text-yellow-400 fill-yellow-400"}`} />
              Direct Imported Blanks & Streetwear Network
            </motion.div>

            <h1 className={`font-display font-bold tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-[1.1] ${
              isDark ? "text-white" : "text-zinc-900"
            }`}>
              Premium Blanks. <br />
              <span className={isDark ? "text-zinc-400 font-normal italic" : "text-zinc-600 font-normal italic"}>No Compromises.</span>
            </h1>

            <p className={`text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-sans leading-relaxed ${
              isDark ? "text-zinc-400" : "text-zinc-600"
            }`}>
              We source high-grade heavyweight blanks and trending oversized drops directly from our partner brands. Heavyweight cotton, durable collar ribs, and soft-washed fits delivered straight to your door.
            </p>

            {/* Value Indicators Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-left max-w-lg mx-auto lg:mx-0">
              <motion.div 
                whileHover={{ y: -3 }}
                className={`flex items-start gap-2 p-3 rounded-2xl border shadow-2xs transition-all ${
                  isDark ? "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700" : "bg-white border-zinc-200/70 hover:border-zinc-300"
                }`}
              >
                <div className={`p-1.5 rounded-xl mt-0.5 ${
                  isDark ? "bg-emerald-950/60 text-emerald-400" : "bg-emerald-50 text-emerald-700"
                }`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isDark ? "text-zinc-200" : "text-zinc-900"}`}>240-280 GSM</h4>
                  <p className={`text-[10px] ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>Heavyweight fabrics</p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -3 }}
                className={`flex items-start gap-2 p-3 rounded-2xl border shadow-2xs transition-all ${
                  isDark ? "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700" : "bg-white border-zinc-200/70 hover:border-zinc-300"
                }`}
              >
                <div className={`p-1.5 rounded-xl mt-0.5 ${
                  isDark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-800"
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isDark ? "text-zinc-200" : "text-zinc-900"}`}>Brand Direct</h4>
                  <p className={`text-[10px] ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>Zero pre-stock waste</p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -3 }}
                className={`col-span-2 sm:col-span-1 flex items-start gap-2 p-3 rounded-2xl border shadow-2xs transition-all ${
                  isDark ? "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700" : "bg-white border-zinc-200/70 hover:border-zinc-300"
                }`}
              >
                <div className={`p-1.5 rounded-xl mt-0.5 ${
                  isDark ? "bg-blue-950/60 text-blue-400" : "bg-blue-50 text-blue-700"
                }`}>
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isDark ? "text-zinc-200" : "text-zinc-900"}`}>Fast Dispatch</h4>
                  <p className={`text-[10px] ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>Tracked delivery</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column: LATEST / TRENDING COLLECTION SLIDESHOW AREA */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 flex flex-col items-center"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {currentArticle ? (
              <div 
                onClick={() => onSelectProduct(currentArticle)}
                className={`group relative w-full max-w-[440px] aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border cursor-pointer select-none transition-all duration-300 hover:shadow-emerald-500/10 hover:border-emerald-500/40 ${
                  isDark ? "border-zinc-800 bg-zinc-950 shadow-black/80" : "border-zinc-200 bg-white shadow-zinc-300/60"
                }`}
                title={`Click to view "${currentArticle.name}"`}
                id="hero-slideshow-card"
              >
                {/* Background Garment Image with AnimatePresence */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentArticle.id}_${activeColor}`}
                    initial={{ opacity: 0.3, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0.2, scale: 0.98 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="absolute inset-0"
                  >
                    <img
                      src={slideImage}
                      alt={currentArticle.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Top Ambient Gradient Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-zinc-950/60 pointer-events-none" />

                {/* Top Slide Header Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10 pointer-events-auto">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-amber-400 text-zinc-950 shadow-md">
                      <Flame className="w-3.5 h-3.5 fill-zinc-950" />
                      Trending Drop
                    </span>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-zinc-950/80 text-white backdrop-blur-md border border-zinc-700/80">
                      {currentArticle.category}
                    </span>
                  </div>

                  {/* Slide Counter & Pause/Play Indicator */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-zinc-950/80 text-zinc-300 backdrop-blur-md border border-zinc-700/80">
                    <span>{String(currentIndex + 1).padStart(2, "0")} / {String(featuredArticles.length).padStart(2, "0")}</span>
                    {isPaused ? (
                      <Pause className="w-2.5 h-2.5 text-amber-400" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                </div>

                {/* Navigation Arrow Controls */}
                {featuredArticles.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevSlide}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-zinc-950/70 hover:bg-zinc-950 text-white backdrop-blur-md border border-zinc-700/80 flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 active:scale-95 z-20 cursor-pointer"
                      title="Previous collection article"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleNextSlide}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-zinc-950/70 hover:bg-zinc-950 text-white backdrop-blur-md border border-zinc-700/80 flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 active:scale-95 z-20 cursor-pointer"
                      title="Next collection article"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Bottom Article Info Card Overlay */}
                <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-auto">
                  <div className={`p-4 rounded-2xl border backdrop-blur-md transition-all space-y-3 ${
                    isDark 
                      ? "bg-zinc-900/95 border-zinc-800 text-white shadow-xl shadow-black/60" 
                      : "bg-white/95 border-zinc-200 text-zinc-900 shadow-xl"
                  }`}>
                    {/* Brand Origin & Stock Status */}
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="flex items-center gap-1.5 text-amber-400 font-bold truncate max-w-[200px]">
                        <Store className="w-3 h-3 shrink-0" />
                        {currentArticle.brandShopName || currentArticle.brandName || "Premier Studio Drop"}
                      </span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        On-Demand Ready
                      </span>
                    </div>

                    {/* Article Name & Price */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`font-display font-bold text-base sm:text-lg leading-snug ${isDark ? "text-white" : "text-zinc-900"}`}>
                          {currentArticle.name}
                        </h3>
                        <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5 font-sans">
                          {currentArticle.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono text-base sm:text-lg font-black text-amber-400 block">
                          {currencySymbol}{currentArticle.price.toLocaleString()}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">
                          Inclusive Tax
                        </span>
                      </div>
                    </div>

                    {/* Colors & CTA Row */}
                    <div className="flex items-center justify-between gap-3 pt-1 border-t border-zinc-800/60">
                      {/* Interactive Color Chips (Clicking updates the hero slide immediately) */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                        {currentArticle.colors?.slice(0, 4).map((c, i) => {
                          const isSelected = activeColor.toLowerCase() === c.name.toLowerCase();
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSlideColorOverrides((prev) => ({ ...prev, [currentArticle.id]: c.name }));
                              }}
                              className={`w-4 h-4 rounded-full border transition-all ${
                                isSelected ? "ring-2 ring-amber-400 scale-125 border-white" : "border-white/30 hover:scale-110"
                              }`}
                              style={{ backgroundColor: c.hex }}
                              title={`Preview in ${c.name}`}
                            />
                          );
                        })}
                        {currentArticle.colors?.length > 4 && (
                          <span className="text-[10px] font-mono text-zinc-400">
                            +{currentArticle.colors.length - 4}
                          </span>
                        )}
                      </div>

                      {/* Prominent "View Article" CTA Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(currentArticle);
                        }}
                        className="px-3.5 py-1.5 rounded-xl font-display font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                        id="hero-view-article-cta"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Article</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Slide Indicator Progress Bar */}
                {featuredArticles.length > 1 && (
                  <div className="absolute bottom-1.5 left-6 right-6 flex items-center justify-center gap-1.5 z-20 pointer-events-auto">
                    {featuredArticles.map((art, idx) => (
                      <button
                        key={art.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentIndex(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          idx === currentIndex
                            ? "w-8 bg-amber-400 shadow-sm"
                            : "w-2 bg-zinc-600/70 hover:bg-zinc-400"
                        }`}
                        title={`Slide ${idx + 1}: ${art.name}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {/* Slideshow Hint / Subtitle */}
            <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Click slide or &ldquo;View Article&rdquo; to customize fit &amp; order</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
