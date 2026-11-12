import React, { useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  CreditCard,
  Plus,
  Trash2,
  Check,
  Edit2,
  ShieldCheck,
  LogOut,
  Camera,
  Receipt,
  Printer,
  Download,
  Lock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Smartphone,
  ChevronRight,
  Truck,
  Package,
  Clock,
  Search,
  RefreshCw,
  AlertCircle,
  Box,
  Navigation,
  ExternalLink,
  Heart,
  Eye,
  ShoppingBag,
  PhoneCall,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, SavedAddress, BankDetails, Order, Product } from "../types";
import AuthModal from "./AuthModal";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
  userOrders: Order[];
  currencySymbol: string;
  merchantWhatsApp?: string;
  theme: "dark" | "light";
  wishlistProductIds?: string[];
  allProducts?: Product[];
  onToggleWishlist?: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
  onCancelOrder?: (orderId: string) => void;
  onAdminLogin?: () => void;
  brandName?: string;
}

// Preset street style avatars for easy selection
const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=250",
];

export default function AccountModal({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  onUpdateUser,
  userOrders,
  currencySymbol,
  merchantWhatsApp = "+91 97100 10989",
  theme,
  wishlistProductIds = [],
  allProducts = [],
  onToggleWishlist,
  onSelectProduct,
  onCancelOrder,
  onAdminLogin,
  brandName = "THREAD DEN",
}: AccountModalProps) {
  const getOwnerNotifyUrl = (order: Order) => {
    let msg = `🚨 *ORDER NOTIFICATION FOR STORE OWNER*\n`;
    msg += `Order ID: ${order.id}\n`;
    msg += `Customer: ${order.customerName} (${order.customerPhone})\n`;
    msg += `Status: ${order.status.toUpperCase()}\n`;
    msg += `Items:\n`;
    order.items.forEach((item) => {
      msg += `- ${item.productName} (${item.size}, ${item.color}) x ${item.quantity} = ${currencySymbol}${item.price * item.quantity}\n`;
    });
    msg += `Total: ${currencySymbol}${order.totalAmount}\n`;
    msg += `Delivery Address: ${order.customerAddress || "Store Pickup"}\n`;
    const cleanPhone = merchantWhatsApp.replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  if (!isOpen) return null;

  // If user is not logged in, render the single unified AuthModal
  if (!currentUser) {
    return (
      <AuthModal
        isOpen={isOpen}
        onClose={onClose}
        onCustomerLogin={(user) => {
          onLogin(user);
        }}
        onAdminLogin={() => {
          if (onAdminLogin) onAdminLogin();
          onClose();
        }}
        theme={theme}
        brandName={brandName}
        initialRole="customer"
      />
    );
  }

  const isDark = theme === "dark";

  // Mode: "auth" or "settings"
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [settingsTab, setSettingsTab] = useState<"profile" | "addresses" | "bank" | "track" | "wishlist" | "orders">("track");

  // Track Order State
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState<string>("");
  const [searchTrackingQuery, setSearchTrackingQuery] = useState<string>("");
  const [isRefreshingTracking, setIsRefreshingTracking] = useState<boolean>(false);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, Order["status"]>>({});

  // Auth Form State
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);

  // Edit Profile Form State
  const [editName, setEditName] = useState(currentUser?.name || "");
  const [editEmail, setEditEmail] = useState(currentUser?.email || "");
  const [editPhone, setEditPhone] = useState(currentUser?.phone || "");
  const [editAvatarUrl, setEditAvatarUrl] = useState(currentUser?.avatarUrl || AVATAR_PRESETS[0]);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Address Form State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState("Home");
  const [addressFullName, setAddressFullName] = useState(currentUser?.name || "");
  const [addressPhone, setAddressPhone] = useState(currentUser?.phone || "");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressPostal, setAddressPostal] = useState("");

  // Bank & Payment Details Form State
  const [upiId, setUpiId] = useState(currentUser?.bankDetails?.upiId || "");
  const [bankName, setBankName] = useState(currentUser?.bankDetails?.bankName || "");
  const [accountNumber, setAccountNumber] = useState(currentUser?.bankDetails?.accountNumber || "");
  const [ifscCode, setIfscCode] = useState(currentUser?.bankDetails?.ifscCode || "");
  const [accountHolderName, setAccountHolderName] = useState(currentUser?.bankDetails?.accountHolderName || currentUser?.name || "");
  const [cardHolderName, setCardHolderName] = useState(currentUser?.bankDetails?.cardHolderName || "");
  const [cardLast4, setCardLast4] = useState(currentUser?.bankDetails?.cardLast4 || "");
  const [cardExpiry, setCardExpiry] = useState(currentUser?.bankDetails?.cardExpiry || "");
  const [bankSaveSuccess, setBankSaveSuccess] = useState(false);

  // Download Receipt Text Helper
  const handleDownloadReceiptTxt = (order: Order) => {
    const receiptText = `
===================================================
             THREAD DEN STREETWEAR
            TAX INVOICE & RECEIPT
===================================================
Order ID:        ${order.id}
Date:            ${order.createdAt}
Payment Status:  ${order.paymentStatus.toUpperCase()}
Payment Method:  ${order.paymentMethod || "Online Gateway"}
Carrier:         ${order.carrier || "Delhivery Express"}
Tracking #:      ${order.trackingNumber || `DEL-${order.id.replace("ORD-", "")}-IN`}

CUSTOMER INFORMATION:
Name:    ${order.customerName}
Phone:   ${order.customerPhone}
Address: ${order.customerAddress || "N/A"}

ORDER ITEMS:
---------------------------------------------------
${order.items
  .map(
    (item) =>
      `${item.productName.padEnd(25)} (${item.size}, ${item.color}) x${item.quantity}  ${currencySymbol}${(
        item.price * item.quantity
      ).toLocaleString()}`
  )
  .join("\n")}
---------------------------------------------------
Total Amount Paid: ${currencySymbol}${order.totalAmount.toLocaleString()}

Thank you for shopping with Thread Den Streetwear!
===================================================
    `.trim();

    const blob = new Blob([receiptText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Receipt_${order.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Selected Order for Receipt modal view inside user settings
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState<Order | null>(null);

  // Demo Login Handler
  const handleQuickDemoLogin = () => {
    const demoUser: UserProfile = {
      id: "USR-772910",
      name: "Alex Mercer",
      email: "alex.mercer@streetwear.io",
      phone: "+91 98765 43210",
      avatarUrl: AVATAR_PRESETS[0],
      createdAt: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      savedAddresses: [
        {
          id: "ADDR-1",
          label: "Home Depot",
          fullName: "Alex Mercer",
          phone: "+91 98765 43210",
          streetAddress: "42 Design Studio Lane, Urban Heights",
          city: "Bengaluru",
          state: "Karnataka",
          postalCode: "560001",
          isDefault: true,
        },
      ],
      bankDetails: {
        upiId: "alexmercer@okaxis",
        bankName: "HDFC Bank Ltd",
        accountNumber: "•••• •••• 9812",
        ifscCode: "HDFC0001234",
        accountHolderName: "Alex Mercer",
        cardHolderName: "ALEX MERCER",
        cardLast4: "4092",
        cardExpiry: "12/28",
      },
    };
    onLogin(demoUser);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === "signup") {
      if (!authName.trim() || !authEmail.trim() || !authPhone.trim()) {
        alert("Please fill in your name, email, and phone number.");
        return;
      }
      const newUser: UserProfile = {
        id: `USR-${Math.floor(100000 + Math.random() * 900000)}`,
        name: authName.trim(),
        email: authEmail.trim(),
        phone: authPhone.trim(),
        avatarUrl: selectedAvatar,
        createdAt: "Just now",
        savedAddresses: [],
        bankDetails: {},
      };
      onLogin(newUser);
    } else {
      if (!authEmail.trim()) {
        alert("Please enter your email or phone number.");
        return;
      }
      // Log in with provided details
      const existingUser: UserProfile = {
        id: `USR-${Math.floor(100000 + Math.random() * 900000)}`,
        name: authEmail.split("@")[0] || "Streetwear Fan",
        email: authEmail.includes("@") ? authEmail : `${authEmail}@user.com`,
        phone: authPhone || "+91 98765 00000",
        avatarUrl: selectedAvatar,
        createdAt: "Active Member",
        savedAddresses: [],
        bankDetails: {},
      };
      onLogin(existingUser);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      name: editName,
      email: editEmail,
      phone: editPhone,
      avatarUrl: editAvatarUrl,
    };
    onUpdateUser(updated);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 2500);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!addressStreet.trim() || !addressCity.trim() || !addressPostal.trim()) {
      alert("Please complete the address fields.");
      return;
    }

    const newAddr: SavedAddress = {
      id: `ADDR-${Date.now()}`,
      label: addressLabel || "Address",
      fullName: addressFullName || currentUser.name,
      phone: addressPhone || currentUser.phone,
      streetAddress: addressStreet,
      city: addressCity,
      state: addressState || "State",
      postalCode: addressPostal,
      isDefault: currentUser.savedAddresses.length === 0,
    };

    const updated: UserProfile = {
      ...currentUser,
      savedAddresses: [...currentUser.savedAddresses, newAddr],
    };

    onUpdateUser(updated);
    setIsAddingAddress(false);
    setAddressStreet("");
    setAddressCity("");
    setAddressPostal("");
    setAddressState("");
  };

  const handleDeleteAddress = (addrId: string) => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      savedAddresses: currentUser.savedAddresses.filter((a) => a.id !== addrId),
    };
    onUpdateUser(updated);
  };

  const handleSetDefaultAddress = (addrId: string) => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      savedAddresses: currentUser.savedAddresses.map((a) => ({
        ...a,
        isDefault: a.id === addrId,
      })),
    };
    onUpdateUser(updated);
  };

  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newBankDetails: BankDetails = {
      upiId: upiId.trim() || undefined,
      bankName: bankName.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      ifscCode: ifscCode.trim() || undefined,
      accountHolderName: accountHolderName.trim() || undefined,
      cardHolderName: cardHolderName.trim() || undefined,
      cardLast4: cardLast4.trim() ? cardLast4.trim().slice(-4) : undefined,
      cardExpiry: cardExpiry.trim() || undefined,
    };

    const updated: UserProfile = {
      ...currentUser,
      bankDetails: newBankDetails,
    };

    onUpdateUser(updated);
    setBankSaveSuccess(true);
    setTimeout(() => setBankSaveSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 backdrop-blur-md transition-opacity ${
          isDark ? "bg-zinc-950/80" : "bg-zinc-950/50"
        }`}
        onClick={onClose}
      />

      {/* Main Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`relative w-full max-w-2xl rounded-3xl shadow-2xl border overflow-hidden transition-all my-auto z-10 ${
          isDark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-5 sm:p-6 border-b flex items-center justify-between shrink-0 ${
            isDark ? "border-zinc-800 bg-zinc-900/80" : "border-zinc-150 bg-zinc-50/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shadow-xs ${
                isDark ? "bg-white text-zinc-950" : "bg-zinc-950 text-white"
              }`}
            >
              {currentUser ? (
                <img
                  src={currentUser.avatarUrl || AVATAR_PRESETS[0]}
                  alt={currentUser.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className={`font-display font-bold text-lg leading-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
                {currentUser ? currentUser.name : "Member Account"}
              </h2>
              <p className="text-xs text-zinc-400">
                {currentUser ? currentUser.email : "Access saved addresses, bank details & instant receipts"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser && (
              <>
                {onAdminLogin && (
                  <button
                    onClick={() => {
                      onClose();
                      onAdminLogin();
                    }}
                    className={`p-2 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isDark
                        ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                        : "border-amber-200 text-amber-700 hover:bg-amber-50"
                    }`}
                    title="Switch to Merchant Admin Login"
                    id="switch-to-admin-login-btn"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <span className="hidden sm:inline">Admin Portal</span>
                  </button>
                )}
                <button
                  onClick={onLogout}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isDark
                      ? "border-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                      : "border-zinc-200 text-zinc-600 hover:text-red-600 hover:bg-red-50"
                  }`}
                  title="Log Out of Account"
                  id="account-logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className={`p-2 rounded-full border transition-all ${
                isDark
                  ? "border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
                  : "border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          {!currentUser ? (
            /* ================= VIEW 1: AUTHENTICATION (LOG IN / REGISTER) ================= */
            <div className="space-y-6">
              {/* Auth Mode Toggle Tabs */}
              <div
                className={`grid grid-cols-2 p-1 rounded-2xl border ${
                  isDark ? "bg-zinc-950 border-zinc-850" : "bg-zinc-100 border-zinc-200/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setAuthMode("signin")}
                  className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                    authMode === "signin"
                      ? isDark
                        ? "bg-zinc-900 text-white shadow-xs border border-zinc-800"
                        : "bg-white text-zinc-950 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                    authMode === "signup"
                      ? isDark
                        ? "bg-zinc-900 text-white shadow-xs border border-zinc-800"
                        : "bg-white text-zinc-950 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                  }`}
                >
                  Create New Account
                </button>
              </div>

              {/* Demo Account Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                  isDark
                    ? "bg-indigo-950/40 border-indigo-900/40 text-indigo-200"
                    : "bg-indigo-50/80 border-indigo-100 text-indigo-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-indigo-500 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold">Try instant demo account</h4>
                    <p className="text-[11px] opacity-80">Pre-loaded with sample address & saved bank card</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 active:scale-95"
                >
                  One-Click Login
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === "signup" && (
                  <div>
                    <label
                      className={`block text-[10px] font-mono uppercase font-semibold mb-1 ${
                        isDark ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Mercer"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:ring-1 outline-none transition-all ${
                          isDark
                            ? "bg-zinc-950 border-zinc-800 text-white focus:border-white focus:ring-white"
                            : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-950 focus:ring-zinc-950"
                        }`}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label
                    className={`block text-[10px] font-mono uppercase font-semibold mb-1 ${
                      isDark ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                    <input
                      type="email"
                      required
                      placeholder="alex@streetwear.io"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:ring-1 outline-none transition-all ${
                        isDark
                          ? "bg-zinc-950 border-zinc-800 text-white focus:border-white focus:ring-white"
                          : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-950 focus:ring-zinc-950"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-[10px] font-mono uppercase font-semibold mb-1 ${
                      isDark ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    Phone Number {authMode === "signup" ? "*" : "(Optional)"}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                    <input
                      type="tel"
                      required={authMode === "signup"}
                      placeholder="+91 98765 43210"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:ring-1 outline-none transition-all ${
                        isDark
                          ? "bg-zinc-950 border-zinc-800 text-white focus:border-white focus:ring-white"
                          : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-950 focus:ring-zinc-950"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-[10px] font-mono uppercase font-semibold mb-1 ${
                      isDark ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    Account Password *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:ring-1 outline-none transition-all ${
                        isDark
                          ? "bg-zinc-950 border-zinc-800 text-white focus:border-white focus:ring-white"
                          : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-950 focus:ring-zinc-950"
                      }`}
                    />
                  </div>
                </div>

                {authMode === "signup" && (
                  <div>
                    <label
                      className={`block text-[10px] font-mono uppercase font-semibold mb-2 ${
                        isDark ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      Choose Profile Avatar
                    </label>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {AVATAR_PRESETS.map((imgUrl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedAvatar(imgUrl)}
                          className={`relative w-11 h-11 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                            selectedAvatar === imgUrl
                              ? "border-emerald-500 scale-105 shadow-md"
                              : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={imgUrl} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                          {selectedAvatar === imgUrl && (
                            <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center text-white">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full py-3.5 px-4 rounded-2xl font-display font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 ${
                    isDark
                      ? "bg-white hover:bg-zinc-200 text-zinc-950"
                      : "bg-zinc-950 hover:bg-zinc-800 text-white"
                  }`}
                >
                  {authMode === "signup" ? "Create Free Account" : "Sign In to Account"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            /* ================= VIEW 2: SETTINGS & PROFILE DASHBOARD ================= */
            <div className="space-y-6">
              {/* Settings Category Tabs */}
              <div
                className={`flex gap-1 overflow-x-auto p-1 rounded-2xl border ${
                  isDark ? "bg-zinc-950 border-zinc-850" : "bg-zinc-100 border-zinc-200/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSettingsTab("track")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    settingsTab === "track"
                      ? isDark
                        ? "bg-emerald-950/80 text-emerald-400 shadow-xs border border-emerald-500/30"
                        : "bg-emerald-600 text-white shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  Track Order
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </button>

                <button
                  type="button"
                  onClick={() => setSettingsTab("wishlist")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    settingsTab === "wishlist"
                      ? isDark
                        ? "bg-red-950/70 text-red-400 shadow-xs border border-red-500/30"
                        : "bg-red-50 text-red-600 shadow-xs border border-red-200"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                  }`}
                  id="tab-wishlist-trigger"
                >
                  <Heart className={`w-3.5 h-3.5 ${settingsTab === "wishlist" ? "fill-red-500 text-red-500" : "text-red-400"}`} />
                  Saved Items ({(allProducts.filter(p => wishlistProductIds.includes(p.id))).length})
                </button>

                <button
                  type="button"
                  onClick={() => setSettingsTab("profile")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    settingsTab === "profile"
                      ? isDark
                        ? "bg-zinc-900 text-white shadow-xs border border-zinc-800"
                        : "bg-white text-zinc-950 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Profile Details
                </button>

                <button
                  type="button"
                  onClick={() => setSettingsTab("addresses")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    settingsTab === "addresses"
                      ? isDark
                        ? "bg-zinc-900 text-white shadow-xs border border-zinc-800"
                        : "bg-white text-zinc-950 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Saved Addresses ({(currentUser?.savedAddresses || []).length})
                </button>

                <button
                  type="button"
                  onClick={() => setSettingsTab("bank")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    settingsTab === "bank"
                      ? isDark
                        ? "bg-zinc-900 text-white shadow-xs border border-zinc-800"
                        : "bg-white text-zinc-950 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Bank & Payments
                </button>

                <button
                  type="button"
                  onClick={() => setSettingsTab("orders")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    settingsTab === "orders"
                      ? isDark
                        ? "bg-zinc-900 text-white shadow-xs border border-zinc-800"
                        : "bg-white text-zinc-950 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  Order Receipts ({(userOrders || []).length})
                </button>
              </div>

              {/* TAB 1: PROFILE DETAILS EDIT */}
              {settingsTab === "profile" && (
                <form onSubmit={handleSaveProfile} className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-4 p-4 rounded-2xl border bg-gradient-to-r from-zinc-50 to-transparent dark:from-zinc-950 dark:to-transparent border-zinc-200 dark:border-zinc-800">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2 border-emerald-500 shadow-md">
                      <img src={editAvatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{currentUser.name}</h4>
                      <p className="text-xs text-zinc-400">{currentUser.email}</p>
                      <span className="inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-semibold mt-1">
                        Verified Member
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-[10px] font-mono uppercase font-semibold mb-2 ${
                        isDark ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      Change Profile Avatar
                    </label>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {AVATAR_PRESETS.map((imgUrl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setEditAvatarUrl(imgUrl)}
                          className={`relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                            editAvatarUrl === imgUrl
                              ? "border-emerald-500 scale-105"
                              : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={imgUrl} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Or paste custom Avatar Image URL"
                        value={editAvatarUrl}
                        onChange={(e) => setEditAvatarUrl(e.target.value)}
                        className={`w-full px-3 py-2 text-xs rounded-xl border focus:ring-1 outline-none ${
                          isDark
                            ? "bg-zinc-950 border-zinc-800 text-white focus:border-white focus:ring-white"
                            : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-950 focus:ring-zinc-950"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-[10px] font-mono uppercase font-semibold mb-1 ${
                        isDark ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      Display Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-xl border focus:ring-1 outline-none ${
                        isDark
                          ? "bg-zinc-950 border-zinc-800 text-white focus:border-white focus:ring-white"
                          : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-950 focus:ring-zinc-950"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        className={`block text-[10px] font-mono uppercase font-semibold mb-1 ${
                          isDark ? "text-zinc-400" : "text-zinc-500"
                        }`}
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className={`w-full px-3 py-2 text-xs rounded-xl border focus:ring-1 outline-none ${
                          isDark
                            ? "bg-zinc-950 border-zinc-800 text-white focus:border-white focus:ring-white"
                            : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-950 focus:ring-zinc-950"
                        }`}
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-[10px] font-mono uppercase font-semibold mb-1 ${
                          isDark ? "text-zinc-400" : "text-zinc-500"
                        }`}
                      >
                        Phone Contact
                      </label>
                      <input
                        type="tel"
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className={`w-full px-3 py-2 text-xs rounded-xl border focus:ring-1 outline-none ${
                          isDark
                            ? "bg-zinc-950 border-zinc-800 text-white focus:border-white focus:ring-white"
                            : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-950 focus:ring-zinc-950"
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-3 px-4 rounded-xl font-display font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                      profileSaveSuccess
                        ? "bg-emerald-600 text-white"
                        : isDark
                        ? "bg-white hover:bg-zinc-200 text-zinc-950"
                        : "bg-zinc-950 hover:bg-zinc-800 text-white"
                    }`}
                  >
                    {profileSaveSuccess ? (
                      <>
                        <Check className="w-4 h-4" /> Profile Updated Successfully!
                      </>
                    ) : (
                      "Save Profile Changes"
                    )}
                  </button>
                </form>
              )}

              {/* TAB 2: SAVED ADDRESSES */}
              {settingsTab === "addresses" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Saved Delivery Destinations
                    </h3>
                    {!isAddingAddress && (
                      <button
                        type="button"
                        onClick={() => {
                          setAddressFullName(currentUser.name);
                          setAddressPhone(currentUser.phone);
                          setIsAddingAddress(true);
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1 border transition-all ${
                          isDark
                            ? "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-750"
                            : "bg-zinc-950 border-zinc-950 text-white hover:bg-zinc-800"
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add New Address
                      </button>
                    )}
                  </div>

                  {isAddingAddress ? (
                    <form onSubmit={handleAddAddress} className="p-4 rounded-2xl border space-y-3 bg-zinc-950/20">
                      <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                        <h4 className="text-xs font-bold">New Shipping Address</h4>
                        <button
                          type="button"
                          onClick={() => setIsAddingAddress(false)}
                          className="text-xs text-zinc-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-mono text-zinc-400 mb-1">Label</label>
                          <input
                            type="text"
                            placeholder="Home / Work / Studio"
                            value={addressLabel}
                            onChange={(e) => setAddressLabel(e.target.value)}
                            className={`w-full px-3 py-1.5 text-xs rounded-xl border ${
                              isDark ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-200"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-zinc-400 mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            value={addressFullName}
                            onChange={(e) => setAddressFullName(e.target.value)}
                            className={`w-full px-3 py-1.5 text-xs rounded-xl border ${
                              isDark ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-200"
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 mb-1">Street Address</label>
                        <input
                          type="text"
                          required
                          placeholder="House No, Street, Landmark"
                          value={addressStreet}
                          onChange={(e) => setAddressStreet(e.target.value)}
                          className={`w-full px-3 py-1.5 text-xs rounded-xl border ${
                            isDark ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-200"
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-mono text-zinc-400 mb-1">City</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Mumbai"
                            value={addressCity}
                            onChange={(e) => setAddressCity(e.target.value)}
                            className={`w-full px-3 py-1.5 text-xs rounded-xl border ${
                              isDark ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-200"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-zinc-400 mb-1">State</label>
                          <input
                            type="text"
                            placeholder="State"
                            value={addressState}
                            onChange={(e) => setAddressState(e.target.value)}
                            className={`w-full px-3 py-1.5 text-xs rounded-xl border ${
                              isDark ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-200"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-zinc-400 mb-1">PIN Code</label>
                          <input
                            type="text"
                            required
                            placeholder="400001"
                            value={addressPostal}
                            onChange={(e) => setAddressPostal(e.target.value)}
                            className={`w-full px-3 py-1.5 text-xs rounded-xl border ${
                              isDark ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-200"
                            }`}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                      >
                        Save Address to Profile
                      </button>
                    </form>
                  ) : (!currentUser?.savedAddresses || currentUser.savedAddresses.length === 0) ? (
                    <div className="text-center py-8 border border-dashed rounded-2xl p-6">
                      <MapPin className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-50" />
                      <p className="text-xs text-zinc-400">No saved addresses yet.</p>
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(true)}
                        className="mt-3 px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl"
                      >
                        + Add Your First Address
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(currentUser?.savedAddresses || []).map((addr) => (
                        <div
                          key={addr.id}
                          className={`p-4 rounded-2xl border transition-all flex justify-between items-start ${
                            addr.isDefault
                              ? isDark
                                ? "bg-zinc-950 border-emerald-500/60"
                                : "bg-emerald-50/40 border-emerald-300"
                              : isDark
                              ? "bg-zinc-950/60 border-zinc-800"
                              : "bg-zinc-50 border-zinc-200"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs">{addr.label}</span>
                              {addr.isDefault && (
                                <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-medium">{addr.fullName} • {addr.phone}</p>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              {addr.streetAddress}, {addr.city}, {addr.state} - {addr.postalCode}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {!addr.isDefault && (
                              <button
                                type="button"
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                className="px-2.5 py-1 text-[10px] font-bold border rounded-lg hover:bg-zinc-800 hover:text-white"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="p-1.5 text-zinc-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: BANK & PAYMENT DETAILS */}
              {settingsTab === "bank" && (
                <form onSubmit={handleSaveBankDetails} className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-3 rounded-2xl border bg-gradient-to-r from-indigo-950/30 to-purple-950/20 border-indigo-900/30 text-xs flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-indigo-300">Encrypted Auto-Fill Wallet</span>
                      <span className="text-[10px] text-zinc-400">
                        Saved bank details are encrypted and automatically populate the payment gateway for 1-click checkout.
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">UPI Digital Identifier</h4>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 mb-1">Primary VPA / UPI ID</label>
                      <div className="relative">
                        <Smartphone className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                        <input
                          type="text"
                          placeholder="e.g. name@okaxis or phone@paytm"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border ${
                            isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 border-t pt-3 border-zinc-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Card Payment Auto-Fill</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="ALEX MERCER"
                          value={cardHolderName}
                          onChange={(e) => setCardHolderName(e.target.value)}
                          className={`w-full px-3 py-2 text-xs rounded-xl border ${
                            isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 mb-1">Last 4 Digits of Card</label>
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="4092"
                          value={cardLast4}
                          onChange={(e) => setCardLast4(e.target.value)}
                          className={`w-full px-3 py-2 text-xs rounded-xl border font-mono ${
                            isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 border-t pt-3 border-zinc-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Bank Account Details (NetBanking)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 mb-1">Bank Name</label>
                        <input
                          type="text"
                          placeholder="HDFC Bank / ICICI Bank"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className={`w-full px-3 py-2 text-xs rounded-xl border ${
                            isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 mb-1">IFSC Code</label>
                        <input
                          type="text"
                          placeholder="HDFC0001234"
                          value={ifscCode}
                          onChange={(e) => setIfscCode(e.target.value)}
                          className={`w-full px-3 py-2 text-xs rounded-xl border font-mono ${
                            isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-3 px-4 rounded-xl font-display font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                      bankSaveSuccess
                        ? "bg-emerald-600 text-white"
                        : isDark
                        ? "bg-white hover:bg-zinc-200 text-zinc-950"
                        : "bg-zinc-950 hover:bg-zinc-800 text-white"
                    }`}
                  >
                    {bankSaveSuccess ? (
                      <>
                        <Check className="w-4 h-4" /> Payment Details Saved!
                      </>
                    ) : (
                      "Save Encrypted Bank Details"
                    )}
                  </button>
                </form>
              )}

              {/* TAB 4: REAL-TIME TRACK ORDER SECTION */}
              {settingsTab === "track" && (() => {
                const availableOrders = userOrders || [];
                const filteredOrders = availableOrders.filter((ord) => {
                  if (!searchTrackingQuery.trim()) return true;
                  const q = searchTrackingQuery.toLowerCase();
                  return (
                    ord.id.toLowerCase().includes(q) ||
                    ord.customerName.toLowerCase().includes(q) ||
                    ord.customerPhone.toLowerCase().includes(q) ||
                    ord.items.some((i) => i.productName.toLowerCase().includes(q))
                  );
                });

                const activeOrder =
                  filteredOrders.find((o) => o.id === selectedTrackingOrderId) ||
                  filteredOrders[0] ||
                  availableOrders[0];

                const effectiveStatus: Order["status"] =
                  activeOrder && statusOverrides[activeOrder.id]
                    ? statusOverrides[activeOrder.id]
                    : activeOrder?.status || "confirmed";

                const getStepIndex = (st: Order["status"]) => {
                  if (st === "pending" || st === "confirmed") return 0;
                  if (st === "processing") return 1;
                  if (st === "shipped") return 2;
                  if (st === "completed") return 3;
                  if (st === "cancelled") return -1;
                  return 1;
                };

                const currentStepIdx = getStepIndex(effectiveStatus);

                const milestones = [
                  {
                    title: "Order Placed",
                    subtitle: "Confirmed & Verified",
                    detail: "Order details received & payment processed.",
                    icon: CheckCircle2,
                  },
                  {
                    title: "Processing",
                    subtitle: "Printing & Neck Tagging",
                    detail: "Precision screen-printing & quality inspection.",
                    icon: Package,
                  },
                  {
                    title: "Shipped",
                    subtitle: "Out for Delivery",
                    detail: "Handed over to local courier express.",
                    icon: Truck,
                  },
                  {
                    title: "Delivered",
                    subtitle: "Handed to Recipient",
                    detail: "Package arrived safely at destination.",
                    icon: CheckCircle2,
                  },
                ];

                const handleRefreshTelemetry = () => {
                  setIsRefreshingTracking(true);
                  setTimeout(() => {
                    setIsRefreshingTracking(false);
                  }, 650);
                };

                const handleAdvanceStatus = () => {
                  if (!activeOrder) return;
                  const flow: Order["status"][] = ["confirmed", "processing", "shipped", "completed"];
                  const curIdx = flow.indexOf(effectiveStatus);
                  const nextStatus = curIdx >= 0 && curIdx < flow.length - 1 ? flow[curIdx + 1] : "confirmed";
                  setStatusOverrides((prev) => ({ ...prev, [activeOrder.id]: nextStatus }));
                };

                return (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-zinc-200 dark:border-zinc-800">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                          <Truck className="w-4 h-4" /> Live Order Tracking Telemetry
                        </h3>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Real-time status updates and delivery progress for your streetwear packages.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleRefreshTelemetry}
                        disabled={isRefreshingTracking}
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                          isDark
                            ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700"
                            : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                        }`}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingTracking ? "animate-spin text-emerald-500" : ""}`} />
                        {isRefreshingTracking ? "Refreshing GPS..." : "Refresh Live GPS"}
                      </button>
                    </div>

                    {/* Search & Selector Bar */}
                    {availableOrders.length > 0 && (
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
                          <input
                            type="text"
                            placeholder="Search by Order ID (e.g. ORD-995201), item name or phone..."
                            value={searchTrackingQuery}
                            onChange={(e) => setSearchTrackingQuery(e.target.value)}
                            className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none transition-all ${
                              isDark
                                ? "bg-zinc-950 border-zinc-800 text-white focus:border-emerald-500"
                                : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-emerald-600"
                            }`}
                          />
                        </div>

                        {/* Quick Order Select Pills */}
                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                          {filteredOrders.map((ord) => {
                            const isSelected = activeOrder?.id === ord.id;
                            const ordStatus = statusOverrides[ord.id] || ord.status;
                            return (
                              <button
                                key={ord.id}
                                type="button"
                                onClick={() => setSelectedTrackingOrderId(ord.id)}
                                className={`text-[11px] font-mono px-3 py-1.5 rounded-xl border shrink-0 flex items-center gap-1.5 transition-all ${
                                  isSelected
                                    ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-500 font-bold shadow-xs"
                                    : isDark
                                    ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                                    : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200"
                                }`}
                              >
                                <span>{ord.id}</span>
                                <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                                  ordStatus === "completed"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : ordStatus === "shipped"
                                    ? "bg-blue-500/20 text-blue-400 animate-pulse"
                                    : ordStatus === "processing"
                                    ? "bg-amber-500/20 text-amber-400"
                                    : ordStatus === "cancelled"
                                    ? "bg-rose-500/20 text-rose-400"
                                    : "bg-zinc-500/20 text-zinc-400"
                                }`}>
                                  {ordStatus}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Active Order Tracking Display */}
                    {!activeOrder ? (
                      <div className="text-center py-10 border border-dashed rounded-2xl p-6">
                        <Truck className="w-10 h-10 text-zinc-400 mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-bold text-zinc-400">No matching orders found for tracking.</p>
                        <p className="text-[11px] text-zinc-500 mt-1">
                          Place a street tee order from the cart or search by another Order ID!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {/* Summary Header Card */}
                        <div
                          className={`p-4 rounded-2xl border relative overflow-hidden transition-all ${
                            isDark
                              ? "bg-zinc-950/80 border-zinc-800 bg-gradient-to-br from-zinc-900/50 to-zinc-950"
                              : "bg-white border-zinc-200/80 shadow-xs"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b pb-3 border-zinc-800/40">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-sm text-emerald-500">
                                  {activeOrder.id}
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                                  {activeOrder.deliveryMethod === "delivery" ? "Local Courier Delivery" : "Store Pickup"}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-400 mt-1">
                                Placed on: <span className="text-zinc-200 font-medium">{activeOrder.createdAt}</span>
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {(effectiveStatus === "pending" || activeOrder.status === "pending") && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to cancel order ${activeOrder.id}? Items will be restocked to inventory.`)) {
                                      if (onCancelOrder) {
                                        onCancelOrder(activeOrder.id);
                                      }
                                      setStatusOverrides((prev) => ({ ...prev, [activeOrder.id]: "cancelled" }));
                                    }
                                  }}
                                  className="text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all flex items-center gap-1.5 shadow-2xs"
                                  id={`cancel-order-btn-${activeOrder.id}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Cancel Order
                                </button>
                              )}
                              <a
                                href={getOwnerNotifyUrl(activeOrder)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1.5 shadow-2xs"
                                id={`notify-owner-btn-${activeOrder.id}`}
                              >
                                <PhoneCall className="w-3.5 h-3.5" /> Notify Owner
                              </a>
                              <button
                                type="button"
                                onClick={() => setSelectedOrderReceipt(activeOrder)}
                                className="text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white transition-all flex items-center gap-1.5 shadow-2xs"
                                id={`download-pdf-receipt-btn-${activeOrder.id}`}
                              >
                                <Download className="w-3.5 h-3.5 text-emerald-400" /> Download PDF Receipt
                              </button>
                              <button
                                type="button"
                                onClick={handleAdvanceStatus}
                                className="text-[10px] font-mono font-semibold px-2.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1"
                                title="Simulate advancing real-time order status"
                              >
                                <Sparkles className="w-3 h-3" /> Advance Milestone
                              </button>
                            </div>
                          </div>

                          {/* Carrier & Tracking Info Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 text-xs">
                            <div>
                              <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-0.5">Carrier Partner</span>
                              <span className="font-semibold text-zinc-200 flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5 text-emerald-500" />
                                {activeOrder.carrier || "Delhivery Express"}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-0.5">Tracking Number</span>
                              <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                                {activeOrder.trackingNumber || `DEL-${activeOrder.id.replace("ORD-", "")}-IN`}
                              </span>
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                              <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-0.5">Estimated Delivery</span>
                              <span className="font-semibold text-amber-400 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {activeOrder.estimatedDelivery || "Within 1-2 Business Days"}
                              </span>
                            </div>
                          </div>

                          {activeOrder.customerAddress && (
                            <div className="mt-3 pt-2.5 border-t border-zinc-800/40 text-[11px] text-zinc-400 flex items-start gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                              <span>
                                <strong className="text-zinc-300">Destination:</strong> {activeOrder.customerAddress}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* VISUAL PROGRESS STEPPER */}
                        <div className={`p-5 rounded-2xl border ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
                          <h4 className="text-xs font-mono uppercase font-bold text-zinc-400 mb-6 flex items-center gap-2">
                            <span>Order Milestone Progress Stepper</span>
                            <span className="h-px flex-1 bg-zinc-800" />
                          </h4>

                          {effectiveStatus === "cancelled" ? (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
                              <AlertCircle className="w-6 h-6 shrink-0" />
                              <div>
                                <h5 className="font-bold text-xs">Order Cancelled</h5>
                                <p className="text-[11px] text-red-300/80 mt-0.5">
                                  This order was cancelled. Please contact customer support for refund assistance.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="relative my-2">
                              {/* Connecting Line (Desktop) */}
                              <div className="hidden sm:block absolute top-5 left-[12%] right-[12%] h-1 bg-zinc-800 rounded-full z-0">
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.max(0, Math.min(100, (currentStepIdx / 3) * 100))}%`,
                                  }}
                                />
                              </div>

                              {/* Stepper Nodes */}
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-2 relative z-10">
                                {milestones.map((ms, idx) => {
                                  const IconComponent = ms.icon;
                                  const isDone = idx < currentStepIdx;
                                  const isCurrent = idx === currentStepIdx;

                                  return (
                                    <div key={idx} className="flex sm:flex-col items-center sm:text-center gap-3.5 sm:gap-2">
                                      {/* Circle */}
                                      <div
                                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold transition-all ${
                                          isDone
                                            ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                                            : isCurrent
                                            ? "bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-500/10 scale-110"
                                            : isDark
                                            ? "bg-zinc-900 border border-zinc-800 text-zinc-600"
                                            : "bg-zinc-200 border border-zinc-300 text-zinc-400"
                                        }`}
                                      >
                                        <IconComponent className="w-5 h-5" />
                                      </div>

                                      {/* Details */}
                                      <div className="sm:mt-1">
                                        <div className="flex items-center sm:justify-center gap-1.5">
                                          <h5
                                            className={`text-xs font-bold ${
                                              isDone || isCurrent ? (isDark ? "text-white" : "text-zinc-900") : "text-zinc-500"
                                            }`}
                                          >
                                            {ms.title}
                                          </h5>
                                          {isCurrent && (
                                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold animate-pulse">
                                              LIVE
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-[10px] text-zinc-400 font-medium">{ms.subtitle}</p>
                                        <p className="text-[10px] text-zinc-500 mt-0.5 max-w-[150px] sm:mx-auto hidden sm:block">
                                          {ms.detail}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* LIVE SHIPMENT ACTIVITY TIMELINE */}
                        <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
                          <h4 className="text-xs font-mono uppercase font-bold text-zinc-400 flex items-center justify-between">
                            <span>Shipment Activity Timeline</span>
                            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Synchronized
                            </span>
                          </h4>

                          <div className="space-y-3 pt-1 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                            {currentStepIdx >= 3 && (
                              <div className="pl-7 relative">
                                <div className="absolute left-1 top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-zinc-950">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                                <div className="text-xs font-bold text-emerald-400">Package Delivered Successfully</div>
                                <div className="text-[10px] text-zinc-400">Recipient signed for package at destination address.</div>
                              </div>
                            )}

                            {currentStepIdx >= 2 && (
                              <div className="pl-7 relative">
                                <div className="absolute left-1 top-0.5 w-3.5 h-3.5 rounded-full bg-blue-500/20 border border-blue-500 text-blue-400 flex items-center justify-center">
                                  <Truck className="w-2 h-2" />
                                </div>
                                <div className="text-xs font-bold text-zinc-200">Out for Delivery - Delhi Distribution Hub</div>
                                <div className="text-[10px] text-zinc-400">Handed over to courier rider. Delivery in progress.</div>
                              </div>
                            )}

                            {currentStepIdx >= 1 && (
                              <div className="pl-7 relative">
                                <div className="absolute left-1 top-0.5 w-3.5 h-3.5 rounded-full bg-amber-500/20 border border-amber-500 text-amber-400 flex items-center justify-center">
                                  <Package className="w-2 h-2" />
                                </div>
                                <div className="text-xs font-bold text-zinc-200">Custom Screen Printing & Quality Inspection</div>
                                <div className="text-[10px] text-zinc-400">Heavyweight tee printed, neck tag attached, sealed in eco polybag.</div>
                              </div>
                            )}

                            <div className="pl-7 relative">
                              <div className="absolute left-1 top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center">
                                <Check className="w-2 h-2" />
                              </div>
                              <div className="text-xs font-bold text-zinc-200">Order Confirmed & Payment Verified</div>
                              <div className="text-[10px] text-zinc-400">{activeOrder.createdAt} • Online Gateway</div>
                            </div>
                          </div>
                        </div>

                        {/* TRACKED ITEMS SUMMARY */}
                        <div className={`p-4 rounded-2xl border space-y-2.5 ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
                          <h4 className="text-xs font-mono uppercase font-bold text-zinc-400">
                            Items in this Package ({activeOrder.items.reduce((s, i) => s + i.quantity, 0)})
                          </h4>

                          <div className="space-y-2">
                            {activeOrder.items.map((it, idx) => (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                                  isDark ? "bg-zinc-900/60 border-zinc-800/80" : "bg-white border-zinc-200"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-zinc-800/50 flex items-center justify-center text-zinc-300 font-bold text-[10px]">
                                    {it.size}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-zinc-200 block">{it.productName}</span>
                                    <span className="text-[10px] text-zinc-400">
                                      Color: {it.color} • Qty: {it.quantity}
                                    </span>
                                  </div>
                                </div>

                                <span className="font-bold text-emerald-500">
                                  {currencySymbol}{(it.price * it.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* TAB: SAVED ITEMS / WISHLIST */}
              {settingsTab === "wishlist" && (() => {
                const savedProducts = (allProducts || []).filter((p) =>
                  (wishlistProductIds || []).includes(p.id)
                );

                return (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-zinc-200 dark:border-zinc-800">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                          <Heart className="w-4 h-4 fill-red-500/20" /> Your Saved Wishlist Items
                        </h3>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Keep track of your favorite heavyweight tees and customized streetwear drops.
                        </p>
                      </div>

                      {savedProducts.length > 0 && (
                        <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-bold self-start sm:self-auto">
                          {savedProducts.length} Saved {savedProducts.length === 1 ? "Item" : "Items"}
                        </span>
                      )}
                    </div>

                    {savedProducts.length === 0 ? (
                      <div className="text-center py-12 border border-dashed rounded-2xl p-6 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500">
                          <Heart className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-zinc-200">Your Wishlist is Empty</h4>
                          <p className="text-[11px] text-zinc-400 max-w-sm mx-auto mt-1">
                            Browse our heavyweight streetwear catalog and tap the heart icon on any product card to save items here for quick ordering later!
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={onClose}
                          className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all shadow-sm"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
                          Explore Streetwear Catalog
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {savedProducts.map((prod) => {
                          const isOutOfStock = prod.stockCount === 0 || !prod.isAvailable;
                          return (
                            <div
                              key={prod.id}
                              className={`rounded-2xl border p-3 flex gap-3 transition-all ${
                                isDark
                                  ? "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                                  : "bg-white border-zinc-200 shadow-3xs hover:border-zinc-300"
                              }`}
                            >
                              {/* Thumbnail image */}
                              <div className="w-24 h-28 rounded-xl overflow-hidden bg-zinc-900 shrink-0 relative">
                                <img
                                  src={prod.images[0]}
                                  alt={prod.name}
                                  className="w-full h-full object-cover object-center"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="absolute top-1 left-1 backdrop-blur-md bg-zinc-950/80 text-[8px] font-mono font-bold text-zinc-300 px-1.5 py-0.5 rounded">
                                  {prod.category}
                                </span>
                              </div>

                              {/* Details */}
                              <div className="flex flex-col justify-between flex-1 min-w-0">
                                <div>
                                  <div className="flex items-start justify-between gap-1">
                                    <h4 className="font-bold text-xs line-clamp-1 text-zinc-100">{prod.name}</h4>
                                    <button
                                      type="button"
                                      onClick={() => onToggleWishlist?.(prod)}
                                      className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                                      title="Remove from saved items"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <span className="font-mono font-bold text-xs text-emerald-500 mt-0.5 block">
                                    {currencySymbol}{prod.price.toLocaleString()}
                                  </span>

                                  <div className="flex items-center gap-1 mt-1.5">
                                    {prod.colors.slice(0, 3).map((c) => (
                                      <span
                                        key={c.name}
                                        className="w-2.5 h-2.5 rounded-full border border-zinc-700 block"
                                        style={{ backgroundColor: c.hex }}
                                        title={c.name}
                                      />
                                    ))}
                                    <span className="text-[9px] text-zinc-400 font-mono ml-1">
                                      {prod.sizes.join(", ")}
                                    </span>
                                  </div>
                                </div>

                                <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-800/40">
                                  <span className={`text-[9px] font-mono uppercase font-bold ${
                                    isOutOfStock ? "text-red-400" : "text-emerald-400"
                                  }`}>
                                    {isOutOfStock ? "Sold Out" : `In Stock (${prod.stockCount})`}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (onSelectProduct) {
                                        onSelectProduct(prod);
                                        onClose();
                                      }
                                    }}
                                    disabled={isOutOfStock}
                                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all flex items-center gap-1 shrink-0 disabled:opacity-50"
                                  >
                                    <Eye className="w-3 h-3" /> Quick Customise
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* TAB 5: MY ORDERS & RECEIPTS */}
              {settingsTab === "orders" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Your Order History & Digital Invoices
                    </h3>
                  </div>

                  {(!userOrders || userOrders.length === 0) ? (
                    <div className="text-center py-10 border border-dashed rounded-2xl p-6">
                      <Receipt className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-50" />
                      <p className="text-xs text-zinc-400">You haven't placed any orders with this account yet.</p>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        When you complete an online payment, tax invoice receipts will appear here automatically!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(userOrders || []).map((order) => (
                        <div
                          key={order.id}
                          className={`p-4 rounded-2xl border transition-all space-y-3 ${
                            isDark ? "bg-zinc-950 border-zinc-850" : "bg-zinc-50 border-zinc-200"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs">{order.id}</span>
                                <span
                                  className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                                    order.paymentStatus === "paid"
                                      ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/20"
                                      : "bg-amber-500/15 text-amber-500"
                                  }`}
                                >
                                  {order.paymentStatus === "paid" ? "Paid Online ✓" : "Pending"}
                                </span>
                              </div>
                              <span className="text-[10px] text-zinc-400 block mt-0.5">{order.createdAt}</span>
                            </div>

                            <span className="font-display font-bold text-sm text-emerald-500">
                              {currencySymbol}{order.totalAmount.toLocaleString()}
                            </span>
                          </div>

                          {/* Order items mini list */}
                          <div className="text-xs space-y-1 border-t border-b py-2 border-zinc-800/40">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-[11px] text-zinc-400">
                                <span>
                                  {item.productName} ({item.size}) x {item.quantity}
                                </span>
                                <span>{currencySymbol}{(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-1">
                            <span>Payment: {order.paymentMethod || "Online Gateway"}</span>
                            <div className="flex items-center gap-2">
                              {((statusOverrides[order.id] || order.status) === "pending") && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to cancel order ${order.id}? Items will be restocked to inventory.`)) {
                                      if (onCancelOrder) {
                                        onCancelOrder(order.id);
                                      }
                                      setStatusOverrides((prev) => ({ ...prev, [order.id]: "cancelled" }));
                                    }
                                  }}
                                  className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 rounded-lg hover:bg-rose-500/20 transition-all"
                                  id={`history-cancel-order-btn-${order.id}`}
                                >
                                  <Trash2 className="w-3 h-3" /> Cancel
                                </button>
                              )}
                              <a
                                href={getOwnerNotifyUrl(order)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 rounded-lg hover:bg-emerald-500/20 transition-all"
                                id={`history-notify-owner-btn-${order.id}`}
                              >
                                <PhoneCall className="w-3 h-3" /> Notify Owner
                              </a>
                              <button
                                type="button"
                                onClick={() => setSelectedOrderReceipt(order)}
                                className="text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1 border border-zinc-800 bg-zinc-900 px-2 py-1 rounded-lg hover:bg-zinc-800 transition-all"
                                id={`order-pdf-receipt-btn-${order.id}`}
                              >
                                <Download className="w-3 h-3 text-emerald-400" /> PDF Receipt
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTrackingOrderId(order.id);
                                  setSettingsTab("track");
                                }}
                                className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1"
                              >
                                <Truck className="w-3.5 h-3.5" /> Track Package →
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* SELECTED ORDER PRINT-FRIENDLY PDF RECEIPT MODAL OVERLAY */}
      {selectedOrderReceipt && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`relative w-full max-w-lg rounded-3xl border p-6 shadow-2xl space-y-5 transition-all print:border-none print:shadow-none print:bg-white print:text-black ${
              isDark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
            }`}
            id={`receipt-modal-${selectedOrderReceipt.id}`}
          >
            {/* Receipt Header */}
            <div className="flex items-start justify-between border-b pb-4 border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-display font-bold text-base uppercase tracking-wider">
                    Thread Den Streetwear
                  </h3>
                </div>
                <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                  Official Tax Invoice & Order Receipt
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrderReceipt(null)}
                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all print:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoice Meta Grid */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 font-mono text-xs grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase">Invoice No</span>
                <span className="font-bold text-emerald-400">{selectedOrderReceipt.id}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase">Order Date</span>
                <span className="font-bold">{selectedOrderReceipt.createdAt}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase">Payment Status</span>
                <span className="font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> PAID
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase">Payment Method</span>
                <span className="font-bold">{selectedOrderReceipt.paymentMethod || "Online Gateway"}</span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="text-xs space-y-1">
              <h4 className="font-mono text-[10px] uppercase font-bold text-zinc-400">Billed To & Destination</h4>
              <p className="font-bold text-zinc-200">{selectedOrderReceipt.customerName} • {selectedOrderReceipt.customerPhone}</p>
              {selectedOrderReceipt.customerAddress && (
                <p className="text-[11px] text-zinc-400 leading-snug">{selectedOrderReceipt.customerAddress}</p>
              )}
            </div>

            {/* Items Breakdown Table */}
            <div className="space-y-2">
              <h4 className="font-mono text-[10px] uppercase font-bold text-zinc-400">Purchased Streetwear Items</h4>
              <div className="border rounded-2xl overflow-hidden border-zinc-800 divide-y divide-zinc-800">
                <div className="bg-zinc-950/60 p-2.5 grid grid-cols-12 text-[10px] font-mono uppercase text-zinc-400 font-bold">
                  <span className="col-span-6">Item</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-4 text-right">Price</span>
                </div>
                {selectedOrderReceipt.items.map((item, i) => (
                  <div key={i} className="p-2.5 grid grid-cols-12 text-xs items-center">
                    <div className="col-span-6">
                      <span className="font-bold block">{item.productName}</span>
                      <span className="text-[10px] text-zinc-400">Size: {item.size} • Color: {item.color}</span>
                    </div>
                    <span className="col-span-2 text-center font-mono">{item.quantity}</span>
                    <span className="col-span-4 text-right font-mono font-bold text-emerald-400">
                      {currencySymbol}{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800 text-xs font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>{currencySymbol}{selectedOrderReceipt.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Shipping & Courier Handling</span>
                <span className="text-emerald-400">FREE</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Taxes & GST (Included)</span>
                <span>{currencySymbol}0</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-emerald-400 pt-2 border-t border-zinc-800">
                <span>Grand Total Paid</span>
                <span>{currencySymbol}{selectedOrderReceipt.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Receipt Action Buttons */}
            <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2 print:hidden">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      window.print();
                    } catch (e) {
                      console.warn(e);
                    }
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-md"
                  id="print-receipt-btn"
                >
                  <Printer className="w-4 h-4" /> Print / Save as PDF
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadReceiptTxt(selectedOrderReceipt)}
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-all flex items-center gap-1.5 border border-zinc-700"
                  id="download-text-receipt-btn"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" /> Export Summary
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrderReceipt(null)}
                className="px-3.5 py-2 text-xs font-bold text-zinc-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
