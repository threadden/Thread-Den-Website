import React from "react";
import { Star, Quote, ShieldCheck } from "lucide-react";
// @ts-ignore
import avatarMale from "../assets/images/avatar_male_streetwear_1783574054040.jpg";
// @ts-ignore
import avatarFemale1 from "../assets/images/avatar_female_streetwear_1_1783574073496.jpg";
// @ts-ignore
import avatarFemale2 from "../assets/images/avatar_urban_fashion_2_1783574085843.jpg";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  content: string;
  verified: boolean;
  highlight: string;
}

interface TestimonialsProps {
  theme: "dark" | "light";
}

export default function Testimonials({ theme }: TestimonialsProps) {
  const isDark = theme === "dark";

  const list: Testimonial[] = [
    {
      id: "test-1",
      name: "Marcus Thorne",
      role: "Creative Director",
      company: "Aether Label",
      avatar: avatarMale,
      rating: 5,
      content: "Finding blank blanks with this level of handfeel was incredibly rare until now. The 280GSM slub fabric has an impeccable boxy drape that holds after dozens of industrial washes. Our customers literally buy our graphic drops purely for the base fit. Excellent service!",
      verified: true,
      highlight: "Boxy fit is absolute perfection"
    },
    {
      id: "test-2",
      name: "Sienna Rodriguez",
      role: "Brand Founder",
      company: "Nova Streetwear",
      avatar: avatarFemale1,
      rating: 5,
      content: "The wholesale calculator has saved us hours. We calculated our resell pricing structure right here, ordered on WhatsApp, and picked up our custom bulk order the very next day. The customer feedback on the heavyweight mock neck has been outstanding.",
      verified: true,
      highlight: "Amazing texture & boxy drape"
    },
    {
      id: "test-3",
      name: "Kenji Takahashi",
      role: "Merchandising Lead",
      company: "Grid Studio",
      avatar: avatarFemale2,
      rating: 5,
      content: "We print premium screen-print designs, so base garment shrink resistance is vital. These heavyweight premium blends are the best blanks we have found in the local market. Standard collar stitch ribbing is incredibly clean. Five stars all around.",
      verified: true,
      highlight: "Premium print-ready blanks"
    }
  ];

  return (
    <section className={`border-y py-16 sm:py-24 transition-colors duration-300 ${
      isDark ? "bg-zinc-950 border-zinc-900" : "bg-white border-zinc-200/80"
    }`} id="testimonials-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className={`inline-flex items-center gap-1.5 border px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
            isDark 
              ? "bg-zinc-900 border-zinc-850 text-zinc-400" 
              : "bg-zinc-50 border-zinc-200 text-zinc-600"
          }`}>
            <ShieldCheck className={`w-3.5 h-3.5 ${isDark ? "text-white" : "text-zinc-950"}`} />
            Verified Customer Reviews
          </div>
          <h2 className={`font-display font-black text-2xl sm:text-4xl tracking-tight ${
            isDark ? "text-white" : "text-zinc-900"
          }`}>
            Loved by Brands & Creators
          </h2>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            See how boutique streetwear clothing labels and screen-print designers are building their collections on our direct-import heavyweight blanks.
          </p>
        </div>

        {/* Testimonials Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          {list.map((item) => (
            <div 
              key={item.id} 
              className={`border rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 hover:shadow-2xs relative group ${
                isDark 
                  ? "bg-zinc-900/40 hover:bg-zinc-900 border-zinc-800/80 hover:shadow-zinc-950/20" 
                  : "bg-zinc-50/60 hover:bg-zinc-50 border-zinc-200/80"
              }`}
              id={`testimonial-card-${item.id}`}
            >
              <Quote className={`absolute right-6 top-6 w-10 h-10 transition-colors pointer-events-none ${
                isDark ? "text-zinc-800/30 group-hover:text-zinc-800/50" : "text-zinc-200/50 group-hover:text-zinc-200/80"
              }`} />

              <div className="space-y-4">
                {/* Rating & Highlight */}
                <div className="space-y-2">
                  <div className="flex gap-0.5 text-amber-500">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className={`font-display font-extrabold text-sm tracking-tight ${
                    isDark ? "text-zinc-100" : "text-zinc-900"
                  }`}>
                    "{item.highlight}"
                  </p>
                </div>

                {/* Review Text Body */}
                <p className={`text-xs sm:text-[13px] leading-relaxed ${
                  isDark ? "text-zinc-300" : "text-zinc-600"
                }`}>
                  {item.content}
                </p>
              </div>

              {/* Customer Info footer */}
              <div className={`flex items-center gap-3.5 mt-8 pt-6 border-t ${
                isDark ? "border-zinc-800/60" : "border-zinc-200/60"
              }`}>
                <div className="relative shrink-0">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className={`w-11 h-11 rounded-full object-cover border-2 ring-1 shadow-3xs ${
                      isDark ? "border-zinc-800 ring-zinc-900" : "border-white ring-zinc-200"
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  {item.verified && (
                    <span 
                      className={`absolute -bottom-1 -right-1 rounded-full p-0.5 border-2 ${
                        isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-zinc-950 border-white text-white"
                      }`}
                      title="Verified Purchaser"
                    >
                      <ShieldCheck className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                <div>
                  <h4 className={`font-display font-bold text-xs flex items-center gap-1.5 ${
                    isDark ? "text-white" : "text-zinc-950"
                  }`}>
                    {item.name}
                  </h4>
                  <p className="text-[10px] font-mono text-zinc-400 mt-0.5 font-medium">
                    {item.role} at <strong className={isDark ? "text-zinc-300 font-semibold" : "text-zinc-600 font-semibold"}>{item.company}</strong>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Brand stats ribbon */}
        <div className={`pt-8 border-t flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-center ${
          isDark ? "border-zinc-900" : "border-zinc-100"
        }`}>
          <div className="space-y-1">
            <span className={`font-mono text-xl sm:text-2xl font-black ${isDark ? "text-white" : "text-zinc-900"}`}>100%</span>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Premium Cotton</p>
          </div>
          <div className={`h-6 w-px hidden sm:block ${isDark ? "bg-zinc-850" : "bg-zinc-200"}`}></div>
          <div className="space-y-1">
            <span className={`font-mono text-xl sm:text-2xl font-black ${isDark ? "text-white" : "text-zinc-900"}`}>40+</span>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Active Labels</p>
          </div>
          <div className={`h-6 w-px hidden sm:block ${isDark ? "bg-zinc-850" : "bg-zinc-200"}`}></div>
          <div className="space-y-1">
            <span className={`font-mono text-xl sm:text-2xl font-black ${isDark ? "text-white" : "text-zinc-900"}`}>24hr</span>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Local Pickup Delivery</p>
          </div>
        </div>

      </div>
    </section>
  );
}
