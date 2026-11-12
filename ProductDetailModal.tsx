import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  ShoppingBag,
  Info,
  AlertTriangle,
  ShieldCheck,
  Bell,
  TrendingDown,
  Ruler,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HelpCircle
} from "lucide-react";
import { Product } from "../types";
import { getProductColorImage } from "../data";
import PriceHistoryChart from "./PriceHistoryChart";

interface ProductDetailModalProps {
  product: Product | null;
  currencySymbol: string;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    size: string,
    color: { name: string; hex: string },
    quantity: number
  ) => void;
  theme: "dark" | "light";
  isPriceAlertSubscribed?: boolean;
  onTogglePriceAlert?: (product: Product) => void;
  onSimulatePriceDrop?: (product: Product) => void;
  onVisualizeWithAiStylist?: (product: Product, color?: { name: string; hex: string }) => void;
}

interface SizeMeasurement {
  size: string;
  chestIn: number;
  chestCm: number;
  lengthIn: number;
  lengthCm: number;
  shoulderIn: number;
  shoulderCm: number;
  sleeveIn: number;
  sleeveCm: number;
}

const SIZE_CHART_DATA: SizeMeasurement[] = [
  { size: "S", chestIn: 40, chestCm: 102, lengthIn: 28, lengthCm: 71, shoulderIn: 19, shoulderCm: 48, sleeveIn: 9, sleeveCm: 23 },
  { size: "M", chestIn: 42, chestCm: 107, lengthIn: 29, lengthCm: 74, shoulderIn: 20, shoulderCm: 51, sleeveIn: 9.5, sleeveCm: 24 },
  { size: "L", chestIn: 44, chestCm: 112, lengthIn: 30, lengthCm: 76, shoulderIn: 21, shoulderCm: 53, sleeveIn: 10, sleeveCm: 25 },
  { size: "XL", chestIn: 46, chestCm: 117, lengthIn: 31, lengthCm: 79, shoulderIn: 22, shoulderCm: 56, sleeveIn: 10.5, sleeveCm: 27 },
  { size: "XXL", chestIn: 48, chestCm: 122, lengthIn: 32, lengthCm: 81, shoulderIn: 23, shoulderCm: 58, sleeveIn: 11, sleeveCm: 28 },
];

export default function ProductDetailModal({
  product,
  currencySymbol,
  onClose,
  onAddToCart,
  theme,
  isPriceAlertSubscribed = false,
  onTogglePriceAlert,
  onSimulatePriceDrop,
  onVisualizeWithAiStylist,
}: ProductDetailModalProps) {
  if (!product) return null;

  // Local state for customized choices
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string }>({ name: "", hex: "" });
  const [quantity, setQuantity] = useState<number>(1);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  // Size chart modal/drawer state
  const [isSizeChartOpen, setIsSizeChartOpen] = useState<boolean>(false);
  const [sizeUnit, setSizeUnit] = useState<"in" | "cm">("in");

  // "More about the product" expandable state
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(true);

  const isDark = theme === "dark";

  // Set default selections when product changes
  useEffect(() => {
    if (product) {
      if (product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      if (product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      }
      setQuantity(1);
      setIsSuccess(false);
      setSelectedImageIndex(0);
      setIsSizeChartOpen(false);
    }
  }, [product]);

  const handleQuantityChange = (val: number) => {
    if (val < 1) return;
    if (val > product.stockCount) return;
    setQuantity(val);
  };

  const handleAdd = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
    if (!selectedColor.name) {
      alert("Please select a color option");
      return;
    }
    onAddToCart(product, selectedSize, selectedColor, quantity);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  const isOutOfStock = product.stockCount === 0 || !product.isAvailable;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 backdrop-blur-md transition-opacity ${
          isDark ? "bg-zinc-950/80" : "bg-black/50"
        }`}
        onClick={onClose}
      />

      {/* Main Modal Card Container */}
      <div
        className={`relative rounded-3xl overflow-hidden shadow-2xl border w-full max-w-5xl max-h-[92vh] flex flex-col md:flex-row transform transition-all animate-in fade-in zoom-in-95 duration-200 z-10 ${
          isDark
            ? "bg-zinc-900 border-zinc-800 text-zinc-100"
            : "bg-white border-zinc-200 text-zinc-900"
        }`}
        id="product-detail-modal"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-20 p-2 rounded-full border transition-all shadow-md cursor-pointer ${
            isDark
              ? "bg-zinc-900/90 hover:bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"
              : "bg-white/90 hover:bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-950"
          }`}
          id="close-modal-button"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ============================================================== */}
        {/* LEFT SIDE: PRODUCT IMAGE STAGE (CONTROLLED 75-80% SCALE)        */}
        {/* ============================================================== */}
        <div
          className={`w-full md:w-5/12 p-6 sm:p-8 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r ${
            isDark
              ? "bg-zinc-950/70 border-zinc-800"
              : "bg-zinc-50 border-zinc-200/80"
          }`}
        >
          {/* Category Tag Top Left */}
          <div className="absolute top-4 left-4 bg-zinc-950/90 text-white font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md font-bold border border-zinc-800 z-10">
            {product.category}
          </div>

          {/* Framed Image Container: 75% to 80% container scale */}
          <div className="w-full flex items-center justify-center py-4">
            <div className="relative w-[78%] sm:w-[75%] max-w-[320px] aspect-[4/5] rounded-2xl overflow-hidden shadow-xl border border-zinc-700/20 group">
              <img
                src={getProductColorImage(product, selectedColor.name) || product.images[selectedImageIndex] || product.images[0]}
                alt={`${product.name} in ${selectedColor.name || "Default"}`}
                className="w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              {selectedColor.name && (
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-zinc-950/80 text-[10px] font-mono text-zinc-300 border border-zinc-800 backdrop-blur-sm">
                  {selectedColor.name}
                </div>
              )}
            </div>
          </div>

          {/* Image Thumbnails if Multiple Images Exist */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-2 mt-2">
              {product.images.map((img, idx) => {
                const isSelected = getProductColorImage(product, selectedColor.name) === img || selectedImageIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedImageIndex(idx);
                      // If this image matches any color, auto-select that color
                      const matchingCol = product.colors.find(c => c.image === img || c.imageUrl === img);
                      if (matchingCol) setSelectedColor(matchingCol);
                    }}
                    className={`w-11 h-11 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-emerald-500 scale-105 shadow-md ring-2 ring-emerald-500/20"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Heavyweight Badge Under Image */}
          <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>240+ GSM Combed Drop-Shoulder Cut</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT SIDE: CUSTOMIZATION & SPECIFICATION ORDERED ACCORDING TO */}
        {/* 1. Name & Price                                                */}
        {/* 2. Product Description                                         */}
        {/* 3. Available Colours                                           */}
        {/* 4. Sizes with Size Chart Option                                */}
        {/* 5. More about the product (with Price Tracking)                */}
        {/* 6. Add to Cart Button                                          */}
        {/* ============================================================== */}
        <div
          className={`w-full md:w-7/12 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[85vh] md:max-h-[92vh] ${
            isDark ? "bg-zinc-900" : "bg-white"
          }`}
        >
          <div className="space-y-6">
            {/* 1. PRODUCT NAME & PRICE */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {product.category}
                </span>
                {product.stockCount > 0 && product.stockCount <= 10 && (
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Only {product.stockCount} left
                  </span>
                )}
              </div>

              <h2
                className={`font-display font-black text-2xl sm:text-3xl mt-2 tracking-tight ${
                  isDark ? "text-white" : "text-zinc-950"
                }`}
                id="product-detail-name"
              >
                {product.name}
              </h2>

              <div className="mt-3 flex items-baseline gap-3">
                <span
                  className={`font-mono text-2xl sm:text-3xl font-extrabold ${
                    isDark ? "text-white" : "text-zinc-950"
                  }`}
                  id="product-detail-price"
                >
                  {currencySymbol}{product.price.toLocaleString()}
                </span>
                <span
                  className={`text-xs px-2.5 py-1 rounded-md font-mono font-medium ${
                    isDark ? "text-zinc-400 bg-zinc-800" : "text-zinc-500 bg-zinc-100"
                  }`}
                >
                  Direct Sourced Retail
                </span>
              </div>
            </div>

            {/* 2. PRODUCT DESCRIPTION */}
            <div className="space-y-1.5 pt-1">
              <h4 className="text-[11px] font-mono uppercase tracking-wider font-bold text-zinc-400">
                Product Description
              </h4>
              <p
                className={`text-sm leading-relaxed font-sans ${
                  isDark ? "text-zinc-300" : "text-zinc-600"
                }`}
                id="product-detail-description"
              >
                {product.description}
              </p>
            </div>

            {/* 3. AVAILABLE COLOURS */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono uppercase tracking-wider font-bold text-zinc-400">
                  Available Colours
                </span>
                <span
                  className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-full ${
                    isDark ? "text-zinc-200 bg-zinc-800" : "text-zinc-900 bg-zinc-100"
                  }`}
                >
                  {selectedColor.name || "Select Color"}
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`relative w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all shadow-sm cursor-pointer ${
                      selectedColor.name === color.name
                        ? isDark
                          ? "border-emerald-400 ring-4 ring-emerald-500/20 scale-110"
                          : "border-zinc-950 ring-4 ring-zinc-950/20 scale-110"
                        : isDark
                        ? "border-zinc-700 hover:scale-105 opacity-85 hover:opacity-100"
                        : "border-zinc-300 hover:scale-105 opacity-85 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                    id={`color-option-${color.name.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {selectedColor.name === color.name && (
                      <Check
                        className={`w-4 h-4 ${
                          color.hex.toUpperCase() === "#FFFFFF" || color.hex.toUpperCase() === "#F4F4F5"
                            ? "text-zinc-950"
                            : "text-white"
                        }`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. SIZES ALONG WITH OPTION SIZE CHART */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono uppercase tracking-wider font-bold text-zinc-400">
                  Select Size
                </span>

                {/* Option Size Chart Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsSizeChartOpen(!isSizeChartOpen)}
                  className={`flex items-center gap-1.5 text-xs font-bold transition-all underline decoration-emerald-500 cursor-pointer ${
                    isDark ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-700 hover:text-emerald-800"
                  }`}
                  id="toggle-size-chart-btn"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>{isSizeChartOpen ? "Hide Size Chart" : "View Size Chart"}</span>
                </button>
              </div>

              {/* Size Buttons */}
              <div className="flex flex-wrap gap-2">
                {["S", "M", "L", "XL", "XXL"].map((size) => {
                  const isSizeSupported = product.sizes.includes(size);
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={!isSizeSupported || isOutOfStock}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-12 h-11 px-3 rounded-xl text-xs font-mono font-bold tracking-wider border transition-all flex items-center justify-center cursor-pointer ${
                        !isSizeSupported
                          ? isDark
                            ? "bg-zinc-950 text-zinc-700 border-zinc-900 cursor-not-allowed line-through opacity-40"
                            : "bg-zinc-100 text-zinc-300 border-zinc-200 cursor-not-allowed line-through opacity-40"
                          : isSelected
                          ? isDark
                            ? "bg-white text-zinc-950 border-white shadow-lg font-black scale-105"
                            : "bg-zinc-950 text-white border-zinc-950 shadow-lg font-black scale-105"
                          : isDark
                          ? "bg-zinc-800/80 text-zinc-200 border-zinc-700 hover:border-zinc-500"
                          : "bg-white text-zinc-800 border-zinc-300 hover:border-zinc-500"
                      }`}
                      id={`size-option-${size}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {/* Interactive Size Chart Panel (When toggled open) */}
              {isSizeChartOpen && (
                <div
                  className={`mt-3 p-4 rounded-2xl border transition-all animate-in fade-in duration-200 space-y-3 ${
                    isDark
                      ? "bg-zinc-950/80 border-zinc-800 text-zinc-200"
                      : "bg-zinc-50 border-zinc-200 text-zinc-900"
                  }`}
                  id="size-chart-panel"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-emerald-500" />
                      <h5 className="text-xs font-bold font-mono uppercase tracking-wider">
                        Streetwear Relaxed Fit Chart
                      </h5>
                    </div>

                    {/* Unit Switcher */}
                    <div className="flex items-center gap-1 p-0.5 rounded-lg border text-[10px] font-mono">
                      <button
                        type="button"
                        onClick={() => setSizeUnit("in")}
                        className={`px-2 py-0.5 rounded font-bold transition-all ${
                          sizeUnit === "in"
                            ? isDark
                              ? "bg-zinc-800 text-white"
                              : "bg-white text-zinc-950 shadow-xs"
                            : "text-zinc-500"
                        }`}
                      >
                        Inches
                      </button>
                      <button
                        type="button"
                        onClick={() => setSizeUnit("cm")}
                        className={`px-2 py-0.5 rounded font-bold transition-all ${
                          sizeUnit === "cm"
                            ? isDark
                              ? "bg-zinc-800 text-white"
                              : "bg-white text-zinc-950 shadow-xs"
                            : "text-zinc-500"
                        }`}
                      >
                        CM
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse font-mono">
                      <thead>
                        <tr className={`border-b text-[10px] uppercase ${isDark ? "border-zinc-800 text-zinc-400" : "border-zinc-200 text-zinc-500"}`}>
                          <th className="py-1.5 px-2 font-bold">Size</th>
                          <th className="py-1.5 px-2">Chest</th>
                          <th className="py-1.5 px-2">Length</th>
                          <th className="py-1.5 px-2">Shoulder</th>
                          <th className="py-1.5 px-2">Sleeve</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SIZE_CHART_DATA.map((row) => (
                          <tr
                            key={row.size}
                            onClick={() => {
                              if (product.sizes.includes(row.size)) {
                                setSelectedSize(row.size);
                              }
                            }}
                            className={`border-b transition-colors cursor-pointer ${
                              selectedSize === row.size
                                ? isDark
                                  ? "bg-emerald-500/15 text-emerald-400 font-bold border-emerald-500/30"
                                  : "bg-emerald-50 text-emerald-800 font-bold border-emerald-200"
                                : isDark
                                ? "border-zinc-900 hover:bg-zinc-900"
                                : "border-zinc-100 hover:bg-zinc-100"
                            }`}
                          >
                            <td className="py-2 px-2 font-bold">{row.size}</td>
                            <td className="py-2 px-2">
                              {sizeUnit === "in" ? `${row.chestIn}"` : `${row.chestCm} cm`}
                            </td>
                            <td className="py-2 px-2">
                              {sizeUnit === "in" ? `${row.lengthIn}"` : `${row.lengthCm} cm`}
                            </td>
                            <td className="py-2 px-2">
                              {sizeUnit === "in" ? `${row.shoulderIn}"` : `${row.shoulderCm} cm`}
                            </td>
                            <td className="py-2 px-2">
                              {sizeUnit === "in" ? `${row.sleeveIn}"` : `${row.sleeveCm} cm`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[10px] text-zinc-400 leading-snug">
                    * Tip: Measurements feature drop-shoulder relaxed cut. Choose your true size for oversized streetwear styling or one size down for a standard regular fit.
                  </p>
                </div>
              )}
            </div>

            {/* 5. "MORE ABOUT THE PRODUCT" (INCLUDES PRODUCT PRICE TRACKING) */}
            <div
              className={`rounded-2xl border transition-all overflow-hidden ${
                isDark ? "bg-zinc-950/60 border-zinc-800" : "bg-zinc-50 border-zinc-200"
              }`}
            >
              <button
                type="button"
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors ${
                  isDark ? "hover:bg-zinc-900/50" : "hover:bg-zinc-100/50"
                }`}
                id="toggle-more-about-btn"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span className="font-display font-bold text-xs uppercase tracking-wider">
                    More About the Product
                  </span>
                </div>
                {isMoreOpen ? (
                  <ChevronUp className="w-4 h-4 text-zinc-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                )}
              </button>

              {isMoreOpen && (
                <div className={`p-4 pt-0 space-y-4 border-t ${isDark ? "border-zinc-800/60" : "border-zinc-200/60"}`}>
                  {/* Fabric Specs Summary */}
                  <div className="grid grid-cols-2 gap-2 pt-3 text-[11px] font-mono">
                    <div className={`p-2.5 rounded-xl border ${isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-white border-zinc-200 text-zinc-700"}`}>
                      <span className="text-[10px] text-zinc-500 block uppercase">Fabric Weight</span>
                      <strong>240+ GSM Combed Cotton</strong>
                    </div>
                    <div className={`p-2.5 rounded-xl border ${isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-white border-zinc-200 text-zinc-700"}`}>
                      <span className="text-[10px] text-zinc-500 block uppercase">Collar & Finish</span>
                      <strong>Double-Stitched Ribbing</strong>
                    </div>
                  </div>

                  {/* PRODUCT PRICE TRACKING BANNER */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400 flex items-center gap-1.5">
                        <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                        Product Price Tracking & Trend
                      </span>
                    </div>

                    {/* D3.js 3-Month Price Trend Chart */}
                    <PriceHistoryChart
                      productId={product.id}
                      currentPrice={product.price}
                      currencySymbol={currencySymbol}
                      theme={theme}
                    />

                    {/* Price Drop Alert Subscription */}
                    <div
                      className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                        isPriceAlertSubscribed
                          ? isDark
                            ? "bg-amber-950/25 border-amber-500/30 text-amber-200"
                            : "bg-amber-50 border-amber-200 text-amber-950"
                          : isDark
                          ? "bg-zinc-900 border-zinc-800"
                          : "bg-white border-zinc-200"
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-2.5">
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            isPriceAlertSubscribed
                              ? "bg-amber-500/20 text-amber-400"
                              : isDark
                              ? "bg-zinc-800 text-zinc-400"
                              : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          <Bell className={`w-4 h-4 ${isPriceAlertSubscribed ? "fill-amber-400" : ""}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-xs font-bold">Price Drop Alert</h5>
                            {isPriceAlertSubscribed && (
                              <span className="text-[9px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                            {isPriceAlertSubscribed
                              ? "Subscribed! You will get an instant push notification when the price drops."
                              : "Track this product and get notified automatically if price drops."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => onTogglePriceAlert && onTogglePriceAlert(product)}
                          className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border shadow-2xs cursor-pointer ${
                            isPriceAlertSubscribed
                              ? "bg-amber-500 text-zinc-950 hover:bg-amber-400 border-amber-400 font-bold"
                              : isDark
                              ? "bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
                              : "bg-white hover:bg-zinc-100 text-zinc-900 border-zinc-300"
                          }`}
                          id={`notify-price-drop-btn-${product.id}`}
                        >
                          <Bell className={`w-3.5 h-3.5 ${isPriceAlertSubscribed ? "fill-zinc-950" : ""}`} />
                          <span>{isPriceAlertSubscribed ? "Subscribed" : "Track Price Drops"}</span>
                        </button>

                        {isPriceAlertSubscribed && (
                          <button
                            type="button"
                            onClick={() => onSimulatePriceDrop && onSimulatePriceDrop(product)}
                            className="px-2.5 py-2 text-[10px] font-mono font-bold rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                            title="Simulate a price drop event to test push notification"
                            id={`test-price-drop-btn-${product.id}`}
                          >
                            <TrendingDown className="w-3 h-3 text-emerald-400" />
                            <span>Test Drop</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center justify-between pt-1">
                <div className="space-y-0.5">
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-400 block">
                    Quantity
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    Stock available: {product.stockCount} units
                  </span>
                </div>
                <div
                  className={`flex items-center border rounded-xl overflow-hidden shadow-xs ${
                    isDark ? "border-zinc-800 bg-zinc-950" : "border-zinc-200 bg-zinc-50"
                  }`}
                >
                  <button
                    disabled={quantity <= 1}
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className={`w-10 h-10 flex items-center justify-center font-semibold text-lg disabled:opacity-40 transition-colors cursor-pointer ${
                      isDark ? "text-zinc-400 hover:bg-zinc-900 active:bg-zinc-850" : "text-zinc-600 hover:bg-zinc-150 active:bg-zinc-200"
                    }`}
                  >
                    -
                  </button>
                  <span
                    className={`w-10 text-center font-mono font-bold text-sm ${
                      isDark ? "text-zinc-100" : "text-zinc-900"
                    }`}
                  >
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= product.stockCount}
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className={`w-10 h-10 flex items-center justify-center font-semibold text-lg disabled:opacity-40 transition-colors cursor-pointer ${
                      isDark ? "text-zinc-400 hover:bg-zinc-900 active:bg-zinc-850" : "text-zinc-600 hover:bg-zinc-150 active:bg-zinc-200"
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 6. AND THEN: ADD TO CART & AI STYLIST BUTTONS */}
          <div className={`pt-5 mt-5 border-t space-y-3 ${isDark ? "border-zinc-800" : "border-zinc-200"}`}>
            {/* Visualize with AI Stylist Button */}
            <button
              type="button"
              onClick={() => {
                if (onVisualizeWithAiStylist) {
                  onVisualizeWithAiStylist(product, selectedColor);
                  onClose();
                }
              }}
              className={`w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-display font-bold text-xs transition-all shadow-sm active:scale-98 cursor-pointer ${
                isDark
                  ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/10"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-emerald-600/10"
              }`}
              id="modal-visualize-stylist-btn"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Visualize on My AI Miniature</span>
            </button>

            {isOutOfStock ? (
              <div
                className={`w-full p-4 rounded-2xl flex items-center justify-center gap-2 font-display font-semibold text-sm cursor-not-allowed ${
                  isDark ? "bg-zinc-900 text-zinc-500 border border-zinc-800" : "bg-zinc-100 text-zinc-400"
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                This T-Shirt is Currently Sold Out
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-display font-black text-sm transition-all shadow-xl cursor-pointer ${
                  isSuccess
                    ? "bg-emerald-600 text-white"
                    : isDark
                    ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 active:scale-98 shadow-emerald-500/20"
                    : "bg-zinc-950 hover:bg-zinc-800 text-white active:scale-98 shadow-zinc-950/20"
                }`}
                id="add-to-cart-button"
              >
                {isSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added to Custom Order!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart • {currencySymbol}{(product.price * quantity).toLocaleString()}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
