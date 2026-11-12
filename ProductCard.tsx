import React, { useState } from "react";
import { ArrowUpRight, Ban, Eye, Heart, Flame, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Product } from "../types";
import { getProductColorImage } from "../data";

interface ProductCardProps {
  product: Product;
  currencySymbol: string;
  onSelect: (product: Product) => void;
  onVisualizeWithAiStylist?: (product: Product, color?: { name: string; hex: string }) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
  key?: React.Key;
  theme: "dark" | "light";
}

export default function ProductCard({
  product,
  currencySymbol,
  onSelect,
  onVisualizeWithAiStylist,
  isWishlisted = false,
  onToggleWishlist,
  theme,
}: ProductCardProps) {
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string }>(
    product.colors && product.colors.length > 0 ? product.colors[0] : { name: "", hex: "" }
  );

  const isOutOfStock = product.stockCount === 0 || !product.isAvailable;
  const isDark = theme === "dark";

  // Dynamic image matching the selected color
  const activeImage = getProductColorImage(product, selectedColor.name);

  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        y: -6,
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      onClick={() => onSelect({ ...product, images: [activeImage, ...product.images.filter(i => i !== activeImage)] })}
      className={`group cursor-pointer rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col h-full ${
        isDark
          ? "bg-zinc-900 border-zinc-800/80 hover:border-emerald-500/30 shadow-md shadow-black/40 hover:shadow-2xl hover:shadow-black/80"
          : "bg-white border-zinc-200/80 hover:border-emerald-500/30 shadow-sm shadow-zinc-200/60 hover:shadow-2xl hover:shadow-zinc-400/30"
      }`}
      id={`product-card-${product.id}`}
    >
      {/* Product Image Stage */}
      <div className={`relative aspect-[3/4] overflow-hidden ${isDark ? "bg-zinc-950" : "bg-zinc-100"}`}>
        <img
          src={activeImage}
          alt={`${product.name} in ${selectedColor.name || "Default"}`}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-all duration-500 ease-out"
          referrerPolicy="no-referrer"
        />

        {/* Category Tag */}
        <div className={`absolute top-3 left-3 backdrop-blur-xs text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg border shadow-3xs ${
          isDark 
            ? "bg-zinc-950/95 text-zinc-300 border-zinc-800" 
            : "bg-white/95 text-zinc-800 border-zinc-100 shadow-xs"
        }`}>
          {product.category}
        </div>

        {/* Wishlist Heart Button */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleWishlist) onToggleWishlist(product);
          }}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md border shadow-md transition-all ${
            isWishlisted
              ? "bg-red-500/20 border-red-500/50 text-red-500"
              : isDark
              ? "bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/40"
              : "bg-white/80 border-zinc-200 text-zinc-500 hover:text-red-500 hover:border-red-300"
          }`}
          title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
          id={`wishlist-button-${product.id}`}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
        </motion.button>

        {/* Status indicator overlay */}
        {isOutOfStock ? (
          <div className={`absolute inset-0 backdrop-blur-3xs flex flex-col items-center justify-center gap-1.5 p-4 ${
            isDark ? "bg-zinc-950/75" : "bg-white/70"
          }`}>
            <Ban className="w-6 h-6 text-zinc-500" />
            <span className={`font-display font-bold text-xs uppercase tracking-wider ${isDark ? "text-zinc-400" : "text-zinc-700"}`}>Sold Out</span>
          </div>
        ) : product.stockCount < 5 ? (
          <div
            id={`running-low-badge-${product.id}`}
            className="absolute top-12 right-3 bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 text-white text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md z-10 flex items-center gap-1 border border-red-400/30 animate-pulse"
          >
            <Flame className="w-3 h-3 fill-white shrink-0" />
            <span>Running Low ({product.stockCount} left)</span>
          </div>
        ) : product.stockCount < 10 ? (
          <div className="absolute top-12 right-3 bg-amber-500 text-white text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg shadow-3xs z-10">
            Only {product.stockCount} left
          </div>
        ) : null}

        {/* Quick View Hover Indicator */}
        {!isOutOfStock && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/30 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center">
            <span className="flex items-center gap-1.5 bg-white text-zinc-950 font-display font-bold text-xs px-4 py-2 rounded-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              Quick Customise
            </span>
          </div>
        )}
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-3">
        <div className="space-y-1">
          <h3 className={`font-display font-bold text-base transition-colors line-clamp-1 ${
            isDark ? "text-zinc-100 group-hover:text-white" : "text-zinc-900 group-hover:text-zinc-700"
          }`}>
            {product.name}
          </h3>
          <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            {product.description}
          </p>
        </div>

        <div className={`flex items-center justify-between pt-2 border-t ${isDark ? "border-zinc-800/80" : "border-zinc-100"}`}>
          {/* Swatches & Info */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <span>Colours:</span>
              <strong className="text-zinc-200 capitalize font-bold">{selectedColor.name || "Default"}</strong>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {product.colors.map((color) => {
                const isSelected = selectedColor.name === color.name;
                return (
                  <button
                    key={color.name}
                    type="button"
                    title={`View in ${color.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedColor(color);
                    }}
                    className={`w-4 h-4 rounded-full border shadow-3xs block cursor-pointer transition-all transform ${
                      isSelected
                        ? isDark
                          ? "ring-2 ring-emerald-400 scale-125 border-white shadow-md shadow-emerald-500/20"
                          : "ring-2 ring-zinc-950 scale-125 border-zinc-950 shadow-md"
                        : isDark
                        ? "border-zinc-700 hover:scale-115 opacity-70 hover:opacity-100"
                        : "border-zinc-300 hover:scale-115 opacity-70 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                );
              })}
            </div>
          </div>

          {/* Pricing Display */}
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 font-mono uppercase block tracking-wider">Price</span>
            <span className={`font-mono font-bold text-base ${isDark ? "text-zinc-100" : "text-zinc-950"}`}>
              {currencySymbol}{product.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* VISUALIZE WITH AI STYLIST ACTION BUTTON */}
        <div className="pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onVisualizeWithAiStylist) {
                onVisualizeWithAiStylist(product, selectedColor);
              } else {
                onSelect(product);
              }
            }}
            className={`w-full py-2.5 px-3 rounded-xl font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-97 cursor-pointer ${
              isDark
                ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/35 hover:border-emerald-400/50"
                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300"
            }`}
            id={`visualize-with-stylist-${product.id}`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Visualize with AI Stylist</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
