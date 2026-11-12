import React from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  brandName?: string;
  tagline?: string;
  theme?: "dark" | "light";
  className?: string;
  variant?: "badge" | "full" | "icon";
}

export default function BrandLogo({
  size = "md",
  showText = true,
  brandName = "THREAD DEN",
  tagline = "WEAR YOUR STORY",
  theme = "dark",
  className = "",
  variant = "badge",
}: BrandLogoProps) {
  const isDark = theme === "dark";

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  }[size];

  // Official user uploaded logo asset path in workspace
  const originalLogoPath = "/assets/aistudio/Logo_white_35762b07.png";
  const logoWhiteSrc = "/assets/aistudio/logo_monogram_white.png";
  const logoDarkSrc = "/assets/aistudio/logo_monogram_dark.png";

  if (variant === "full") {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <img
          src={isDark ? "/assets/aistudio/logo_white.png" : originalLogoPath}
          alt={brandName}
          className={`h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 ${
            isDark ? "" : "mix-blend-multiply"
          }`}
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Official Emblem Badge featuring user's uploaded Thread Den TD needle monogram */}
      <div
        className={`relative ${sizeClasses} rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-105 overflow-hidden shrink-0 border p-1 ${
          isDark
            ? "bg-zinc-900 border-zinc-800 text-white shadow-black/50"
            : "bg-white border-zinc-200 text-zinc-950 shadow-zinc-200/50"
        }`}
      >
        <img
          src={isDark ? logoWhiteSrc : logoDarkSrc}
          alt={`${brandName} Logo`}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:rotate-1"
          onError={(e) => {
            // High reliability fallback to direct original uploaded logo
            const target = e.currentTarget;
            target.src = originalLogoPath;
            if (isDark) {
              target.classList.add("invert");
            }
          }}
        />

        {/* Ambient subtle gradient glow overlay */}
        <div
          className={`absolute inset-0 opacity-10 pointer-events-none ${
            isDark
              ? "bg-gradient-to-tr from-emerald-500 via-transparent to-amber-400"
              : "bg-gradient-to-tr from-amber-400 via-transparent to-emerald-500"
          }`}
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-display font-black tracking-wider text-base sm:text-lg uppercase leading-tight ${
                isDark ? "text-white" : "text-zinc-950"
              }`}
            >
              {brandName}
            </span>
          </div>
          <span
            className={`font-mono text-[9px] uppercase tracking-[0.25em] font-semibold mt-0.5 ${
              isDark ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            {tagline}
          </span>
        </div>
      )}
    </div>
  );
}
