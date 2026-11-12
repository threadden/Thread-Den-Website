import React, { useState } from "react";
import { 
  MapPin, Instagram, MessageCircle, Phone, ExternalLink, 
  Copy, Check, Clock, Globe, Building2, Sparkles, 
  ArrowUpRight, Send 
} from "lucide-react";
import BrandLogo from "./BrandLogo";

interface FooterProps {
  brandName: string;
  merchantWhatsApp: string;
  theme: "dark" | "light";
  onOpenAccountModal?: () => void;
  onOpenMerchantPortal?: () => void;
}

export default function Footer({
  brandName,
  merchantWhatsApp = "+91 97100 10989",
  theme,
  onOpenAccountModal,
}: FooterProps) {
  const isDark = theme === "dark";
  const [copiedInstagram, setCopiedInstagram] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  // Exact contact details requested by user
  const activeWhatsAppNumber = "9710010989";
  const activeWhatsAppDisplay = "+91 97100 10989";
  const whatsappUrl = `https://wa.me/91${activeWhatsAppNumber}?text=${encodeURIComponent(
    `Hi ${brandName} team! I have a question regarding streetwear batch products or custom orders.`
  )}`;

  const instagramPageName = "thread._.den";
  const instagramHandle = "@thread._.den";
  const instagramUrl = "https://www.instagram.com/thread._.den/";
  const mapSearchUrl = "https://maps.google.com/?q=No%3A18%2FB4%2C+EAR+Builders%2C+Rasathinagar+Road%2C+Nallambakkam%2C+Rattinamangalam%2C+Tamil+Nadu%2C+Chennai+-+600127";

  const handleCopyInstagram = () => {
    navigator.clipboard.writeText(instagramHandle);
    setCopiedInstagram(true);
    setTimeout(() => setCopiedInstagram(false), 2000);
  };

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(activeWhatsAppDisplay);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2000);
  };

  return (
    <footer
      className={`border-t py-14 mt-16 text-xs transition-colors duration-300 relative overflow-hidden ${
        isDark
          ? "bg-zinc-950 border-zinc-900 text-zinc-400"
          : "bg-zinc-900 text-white border-zinc-800"
      }`}
      id="main-app-footer"
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Main Footer Grid - items-stretch to equalize all 4 column heights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          
          {/* Column 1: Brand Info & Identity */}
          <div className="space-y-4 flex flex-col justify-between h-full">
            <div className="space-y-3">
              <BrandLogo brandName={brandName} theme="dark" size="md" />

              <p className="leading-relaxed text-zinc-400 text-xs">
                Curated, high-handfeel heavy cotton streetwear basics imported via premier wholesale connections and hand-distributed directly to your door.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Verified Import Partner
              </span>
            </div>
          </div>

          {/* Column 2: Physical Store Location & Hours */}
          <div className="space-y-3 flex flex-col h-full">
            <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5 h-6">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Flagship Location</span>
            </h4>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between flex-1 gap-3.5 min-h-[210px]">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-white text-xs block">Thread Den</span>
                    <span className="text-[10px] text-zinc-400 block font-mono">Flagship Store</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-zinc-300 text-[11px] leading-relaxed font-sans">
                    No: 18/B4, EAR Builders, Rasathinagar Road,<br />
                    Nallambakkam, Rattinamangalam,<br />
                    Tamil Nadu, Chennai - 600127
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono pt-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Mon - Sat: 10:00 AM – 8:00 PM IST</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-1">
                <a
                  href={mapSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-10 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-[11px] font-bold transition-all flex items-center justify-center gap-2 border border-zinc-700 shadow-sm"
                  id="footer-open-maps-btn"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Open in Google Maps</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Instagram Profile & Community */}
          <div className="space-y-3 flex flex-col h-full">
            <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5 h-6">
              <Instagram className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span>Instagram Community</span>
            </h4>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between flex-1 gap-3.5 min-h-[210px]">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-sm shrink-0">
                      <Instagram className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-white text-xs block truncate">{instagramPageName}</span>
                      <span className="text-[10px] text-zinc-400 block font-mono truncate">{instagramHandle} &bull; Community</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyInstagram}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-all shrink-0"
                    title="Copy Instagram Handle"
                    id="footer-copy-instagram-btn"
                  >
                    {copiedInstagram ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-zinc-300 text-[11px] leading-relaxed font-sans">
                    Follow us for daily fit checks, upcoming collection drops, street styling, and customer tags.
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono pt-1">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    <span>Daily Drops &amp; Community Fits</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-1">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-10 px-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-[11px] transition-all flex items-center justify-center gap-2 shadow-sm"
                  id="footer-instagram-visit-btn"
                >
                  <span>Visit Instagram</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: WhatsApp Support & Direct Query Number */}
          <div className="space-y-3 flex flex-col h-full">
            <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5 h-6">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>WhatsApp Queries &amp; Support</span>
            </h4>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between flex-1 gap-3.5 min-h-[210px]">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-white text-xs block">{activeWhatsAppDisplay}</span>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Support Online
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyWhatsApp}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-all shrink-0"
                    title="Copy Phone Number"
                    id="footer-copy-whatsapp-btn"
                  >
                    {copiedWhatsApp ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-zinc-300 text-[11px] leading-relaxed font-sans">
                    Direct chat support for sizing advice, bulk wholesale orders, delivery status, and custom garment inquiries.
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono pt-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Instant replies: 10:00 AM – 10:00 PM IST</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-10 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10 active:scale-98"
                  id="footer-whatsapp-chat-btn"
                >
                  <MessageCircle className="w-4 h-4 fill-zinc-950" />
                  <span>Chat on WhatsApp</span>
                  <Send className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Credits & Legal Footer Bar */}
        <div className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left ${
          isDark ? "border-zinc-900 text-zinc-500" : "border-zinc-800 text-zinc-400"
        }`}>
          <div className="space-y-1">
            <p className="text-xs text-zinc-400">
              © {new Date().getFullYear()} <strong className="text-white">{brandName}</strong> Storefront. Premium Streetwear Reseller Network.
            </p>
            <p className="text-[10px] text-zinc-500">
              All blank heavy-cotton tee designs are direct wholesale imports. All catalog specifications and order workflows are processed locally.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <button
              type="button"
              onClick={onOpenAccountModal}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
              id="footer-account-auth-btn"
            >
              <span>Login / Sign Up</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
