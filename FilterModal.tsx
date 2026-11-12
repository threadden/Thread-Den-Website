import React from "react";
import { SlidersHorizontal, X, RotateCcw, Check, Tag, DollarSign, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import PriceRangeFilter from "./PriceRangeFilter";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  minPrice: number;
  maxPrice: number;
  catalogMinPrice: number;
  catalogMaxPrice: number;
  onChangeMinPrice: (val: number) => void;
  onChangeMaxPrice: (val: number) => void;
  onResetFilters: () => void;
  currencySymbol: string;
  theme: "dark" | "light";
  productCount: number;
  totalProductCount: number;
}

export default function FilterModal({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  minPrice,
  maxPrice,
  catalogMinPrice,
  catalogMaxPrice,
  onChangeMinPrice,
  onChangeMaxPrice,
  onResetFilters,
  currencySymbol,
  theme,
  productCount,
  totalProductCount,
}: FilterModalProps) {
  if (!isOpen) return null;

  const isDark = theme === "dark";

  // Check how many filters are active
  const isCategoryFiltered = selectedCategory !== "All";
  const isPriceFiltered = minPrice > catalogMinPrice || maxPrice < catalogMaxPrice;
  const activeCount = (isCategoryFiltered ? 1 : 0) + (isPriceFiltered ? 1 : 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Filter Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`relative w-full max-w-xl rounded-3xl shadow-2xl border overflow-hidden transition-all my-auto z-10 ${
            isDark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
          }`}
          id="filter-options-modal"
        >
          {/* Header */}
          <div className={`p-5 sm:p-6 border-b flex items-center justify-between ${
            isDark ? "border-zinc-800/80 bg-zinc-900/90" : "border-zinc-100 bg-zinc-50/80"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl ${
                isDark ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border border-emerald-200"
              }`}>
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-lg">Filter</h3>
                  {activeCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500 text-zinc-950">
                      {activeCount} Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">Refine catalog by category, fit, or price range</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-all ${
                isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-zinc-200 text-zinc-500 hover:text-zinc-950"
              }`}
              id="close-filter-modal-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            
            {/* 1. Category Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  Select Category
                </label>
                <span className="text-[11px] font-mono text-emerald-500 font-semibold">
                  {selectedCategory}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => onSelectCategory(cat)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all border ${
                        isSelected
                          ? isDark
                            ? "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md font-bold"
                            : "bg-zinc-950 text-white border-zinc-950 shadow-md font-bold"
                          : isDark
                          ? "bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border-zinc-800/80"
                          : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
                      }`}
                      id={`filter-cat-btn-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <span className="truncate">{cat}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className={isDark ? "border-zinc-800" : "border-zinc-200/80"} />

            {/* 2. Price Range Filter */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Price Range
              </label>

              <PriceRangeFilter
                minPrice={minPrice}
                maxPrice={maxPrice}
                catalogMinPrice={catalogMinPrice}
                catalogMaxPrice={catalogMaxPrice}
                onChangeMinPrice={onChangeMinPrice}
                onChangeMaxPrice={onChangeMaxPrice}
                onReset={onResetFilters}
                currencySymbol={currencySymbol}
                theme={theme}
                productCount={productCount}
                totalProductCount={totalProductCount}
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className={`p-5 border-t flex items-center justify-between gap-3 ${
            isDark ? "border-zinc-800 bg-zinc-900/90" : "border-zinc-200/80 bg-zinc-50/80"
          }`}>
            <button
              type="button"
              onClick={onResetFilters}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all border flex items-center gap-1.5 ${
                isDark
                  ? "bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border-zinc-700"
                  : "bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300 shadow-xs"
              }`}
              id="reset-all-filters-btn"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all flex items-center gap-2 shadow-md shadow-emerald-500/10 active:scale-98"
              id="apply-filters-btn"
            >
              <Check className="w-4 h-4" /> Apply Filters ({productCount})
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
