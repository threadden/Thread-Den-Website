import React from "react";
import { SlidersHorizontal, RotateCcw, DollarSign, Tag } from "lucide-react";

interface PriceRangeFilterProps {
  minPrice: number;
  maxPrice: number;
  catalogMinPrice: number;
  catalogMaxPrice: number;
  onChangeMinPrice: (val: number) => void;
  onChangeMaxPrice: (val: number) => void;
  onReset: () => void;
  currencySymbol: string;
  theme: "dark" | "light";
  productCount: number;
  totalProductCount: number;
}

export default function PriceRangeFilter({
  minPrice,
  maxPrice,
  catalogMinPrice,
  catalogMaxPrice,
  onChangeMinPrice,
  onChangeMaxPrice,
  onReset,
  currencySymbol,
  theme,
  productCount,
  totalProductCount,
}: PriceRangeFilterProps) {
  const isDark = theme === "dark";

  const isFiltered = minPrice > catalogMinPrice || maxPrice < catalogMaxPrice;

  // Calculate percentage positions for visual bar overlay
  const rangeSpan = Math.max(1, catalogMaxPrice - catalogMinPrice);
  const leftPercent = Math.min(100, Math.max(0, ((minPrice - catalogMinPrice) / rangeSpan) * 100));
  const rightPercent = Math.min(100, Math.max(0, ((catalogMaxPrice - maxPrice) / rangeSpan) * 100));

  const handlePreset = (presetMin: number, presetMax: number) => {
    onChangeMinPrice(presetMin);
    onChangeMaxPrice(presetMax);
  };

  return (
    <div
      className={`p-4 rounded-2xl border transition-all space-y-3 ${
        isDark
          ? "bg-zinc-900/90 border-zinc-800 text-zinc-100 shadow-lg shadow-black/20"
          : "bg-white border-zinc-200/90 text-zinc-900 shadow-sm shadow-zinc-200/50"
      }`}
      id="price-range-filter-container"
    >
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isDark ? "bg-zinc-800 text-emerald-400" : "bg-zinc-100 text-emerald-600"}`}>
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>Price Filter Range</span>
              {isFiltered && (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  Active ({productCount}/{totalProductCount})
                </span>
              )}
            </h4>
            <p className="text-[10px] text-zinc-400">
              Filter tees by budget in real-time
            </p>
          </div>
        </div>

        {/* Current Price Readout Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl font-mono text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <span>{currencySymbol}{minPrice.toLocaleString()}</span>
            <span className="text-zinc-500">–</span>
            <span>{currencySymbol}{maxPrice.toLocaleString()}</span>
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className={`p-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1 ${
                isDark
                  ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300"
              }`}
              title="Reset price range"
              id="reset-price-filter-btn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Slider Container */}
      <div className="space-y-2 pt-1">
        {/* Custom Track Bar with Fill */}
        <div className="relative w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div
            className="absolute top-0 bottom-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-150"
            style={{
              left: `${leftPercent}%`,
              right: `${rightPercent}%`,
            }}
          />
        </div>

        {/* Dual Range Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Min Price Control */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-400">Min Price:</span>
              <span className="font-bold text-emerald-500">
                {currencySymbol}{minPrice.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={catalogMinPrice}
              max={maxPrice}
              step={50}
              value={minPrice}
              onChange={(e) => onChangeMinPrice(Math.min(Number(e.target.value), maxPrice))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800"
              id="min-price-slider"
            />
          </div>

          {/* Max Price Control */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-400">Max Price:</span>
              <span className="font-bold text-emerald-500">
                {currencySymbol}{maxPrice.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={minPrice}
              max={catalogMaxPrice}
              step={50}
              value={maxPrice}
              onChange={(e) => onChangeMaxPrice(Math.max(Number(e.target.value), minPrice))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800"
              id="max-price-slider"
            />
          </div>
        </div>
      </div>

      {/* Quick Preset Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
        <span className="text-[10px] font-mono text-zinc-400 font-semibold mr-1 shrink-0 flex items-center gap-1">
          <Tag className="w-3 h-3 text-zinc-400" /> Presets:
        </span>

        <button
          type="button"
          onClick={() => handlePreset(catalogMinPrice, catalogMaxPrice)}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border whitespace-nowrap ${
            minPrice === catalogMinPrice && maxPrice === catalogMaxPrice
              ? "bg-emerald-500 text-zinc-950 border-emerald-400"
              : isDark
              ? "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200"
              : "bg-zinc-100 text-zinc-600 border-zinc-200 hover:text-zinc-900"
          }`}
        >
          All Prices
        </button>

        <button
          type="button"
          onClick={() => handlePreset(catalogMinPrice, 500)}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border whitespace-nowrap ${
            minPrice === catalogMinPrice && maxPrice === 500
              ? "bg-emerald-500 text-zinc-950 border-emerald-400"
              : isDark
              ? "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200"
              : "bg-zinc-100 text-zinc-600 border-zinc-200 hover:text-zinc-900"
          }`}
        >
          Under {currencySymbol}500
        </button>

        <button
          type="button"
          onClick={() => handlePreset(500, 1000)}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border whitespace-nowrap ${
            minPrice === 500 && maxPrice === 1000
              ? "bg-emerald-500 text-zinc-950 border-emerald-400"
              : isDark
              ? "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200"
              : "bg-zinc-100 text-zinc-600 border-zinc-200 hover:text-zinc-900"
          }`}
        >
          {currencySymbol}500 - {currencySymbol}1,000
        </button>

        <button
          type="button"
          onClick={() => handlePreset(1000, catalogMaxPrice)}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border whitespace-nowrap ${
            minPrice === 1000 && maxPrice === catalogMaxPrice
              ? "bg-emerald-500 text-zinc-950 border-emerald-400"
              : isDark
              ? "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200"
              : "bg-zinc-100 text-zinc-600 border-zinc-200 hover:text-zinc-900"
          }`}
        >
          Over {currencySymbol}1,000
        </button>
      </div>
    </div>
  );
}
