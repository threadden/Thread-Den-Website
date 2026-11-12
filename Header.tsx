import React from "react";
import { ShoppingBag, Sliders, User, Sparkles, Sun, Moon, Settings, Lock, ShieldCheck, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { CartItem, UserProfile } from "../types";
import BrandLogo from "./BrandLogo";

interface HeaderProps {
  brandName: string;
  currencySymbol: string;
  currentMode: "customer" | "merchant";
  onModeChange: (mode: "customer" | "merchant") => void;
  cart: CartItem[];
  onOpenCart: () => void;
  merchantPasscodeRequired?: boolean;
  theme: "dark" | "light";
  onThemeToggle: () => void;
  currentUser: UserProfile | null;
  onOpenAccountModal: () => void;
  isAdminAuthenticated?: boolean;
  onAdminSignOut?: () => void;
  onOpenChatbot?: () => void;
  onOpenAiStylist?: () => void;
}

export default function Header({
  brandName,
  currencySymbol,
  currentMode,
  onModeChange,
  cart,
  onOpenCart,
  theme,
  onThemeToggle,
  currentUser,
  onOpenAccountModal,
  isAdminAuthenticated = false,
  onAdminSignOut,
  onOpenChatbot,
  onOpenAiStylist,
}: HeaderProps) {
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartValue = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const isDark = theme === "dark";

  const handleOpenStylist = onOpenAiStylist || onOpenChatbot;

  return (
    <header className={`sticky top-0 z-45 backdrop-blur-md border-b px-4 sm:px-6 py-3.5 transition-all duration-300 ${
      isDark 
        ? "bg-zinc-950/90 border-zinc-900/80 text-zinc-100" 
        : "bg-white/90 border-zinc-100 text-zinc-950"
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo / Name */}
        <div 
          onClick={() => onModeChange("customer")}
          className="flex items-center gap-2 cursor-pointer group"
          id="brand-logo"
        >
          <BrandLogo brandName={brandName} theme={theme} size="md" />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3" id="header-actions">
          {/* 1. Theme switcher toggle (FIRST) */}
          <button
            onClick={onThemeToggle}
            className={`p-2 rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
              isDark
                ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-850"
                : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
            id="theme-toggle-button"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden lg:inline font-mono text-[9px] font-bold tracking-wider uppercase text-zinc-400">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-500" />
                <span className="hidden lg:inline font-mono text-[9px] font-bold tracking-wider uppercase text-zinc-500">Dark</span>
              </>
            )}
          </button>

          {/* AI Stylist & Miniature Try-On Trigger */}
          {handleOpenStylist && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleOpenStylist}
              className={`p-2 sm:px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isDark
                  ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/40"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300"
              }`}
              id="header-ai-stylist-btn"
              title="Virtual Miniature Try-On & AI Stylist"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="font-display">AI Stylist (Try-On)</span>
            </motion.button>
          )}

          {/* 2. Cart Trigger Button (SECOND) - Hidden in Merchant Mode */}
          {currentMode === "customer" && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenCart}
              className={`relative p-2.5 rounded-xl transition-all flex items-center gap-2 border ${
                isDark
                  ? "text-zinc-200 hover:text-white hover:bg-zinc-900 border-zinc-800"
                  : "text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border-zinc-200 shadow-xs"
              }`}
              id="cart-trigger-button"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-500" />
              {totalCartItems > 0 && (
                <span className={`absolute -top-1 -right-1 font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold ring-2 ${
                  isDark ? "bg-white text-zinc-950 ring-zinc-950" : "bg-zinc-950 text-white ring-white"
                }`}>
                  {totalCartItems}
                </span>
              )}
              <span className="hidden md:inline font-mono text-xs font-bold">
                {currencySymbol}{totalCartValue.toLocaleString()}
              </span>
            </motion.button>
          )}

          {/* 3. User Account / Profile Button (THIRD) */}
          {currentMode === "customer" && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenAccountModal}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                currentUser
                  ? isDark
                    ? "bg-zinc-900 border-emerald-500/50 text-white hover:border-emerald-400"
                    : "bg-white border-emerald-500/60 text-zinc-900 hover:border-emerald-600 shadow-xs"
                  : isDark
                  ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
                  : "bg-white border-zinc-200 text-zinc-700 hover:text-zinc-950 shadow-xs"
              }`}
              id="user-account-trigger"
              title={currentUser ? "User Profile & Account Settings" : "Sign In or Register"}
            >
              {currentUser ? (
                <>
                  <div className="relative w-6 h-6 rounded-lg overflow-hidden shrink-0 border border-emerald-500/60">
                    <img
                      src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="hidden md:inline font-bold max-w-[100px] truncate">
                    {currentUser.name}
                  </span>
                  <Settings className="w-3.5 h-3.5 text-zinc-400" />
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-bold text-xs whitespace-nowrap">Login / Sign Up</span>
                </>
              )}
            </motion.button>
          )}

          {/* 4. Merchant Admin Controls (Visible ONLY when Admin is Authenticated) */}
          {isAdminAuthenticated && (
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-xl flex items-center gap-1 ${isDark ? "bg-zinc-900 border border-zinc-800" : "bg-zinc-100 border border-zinc-200"}`}>
                <button
                  onClick={() => onModeChange("customer")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    currentMode === "customer"
                      ? isDark 
                        ? "bg-zinc-800 text-white shadow-xs font-bold"
                        : "bg-white text-zinc-950 shadow-xs font-bold"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                  id="toggle-storefront"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Storefront</span>
                </button>
                
                <button
                  onClick={() => onModeChange("merchant")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    currentMode === "merchant"
                      ? isDark
                        ? "bg-amber-400 text-zinc-950 shadow-xs font-extrabold"
                        : "bg-zinc-950 text-white shadow-xs font-extrabold"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                  id="toggle-merchant-hub"
                  title="Merchant Admin Portal Active"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Merchant Hub</span>
                </button>
              </div>

              {/* Lock / Exit Admin Button */}
              {onAdminSignOut && (
                <button
                  onClick={onAdminSignOut}
                  className={`p-2 rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                    isDark
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                      : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                  }`}
                  title="Lock & Exit Admin Portal"
                  id="lock-admin-btn"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-mono text-[10px] font-bold uppercase">Lock Admin</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
