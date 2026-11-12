import React, { useState, useEffect } from "react";
import {
  X,
  User,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  Check,
  CheckCircle2,
  RefreshCw,
  Smartphone,
  ChevronLeft,
  Clock,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "../types";

// Streetwear avatar presets for customer signup
const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=250",
];

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerLogin: (user: UserProfile) => void;
  onAdminLogin: () => void;
  theme: "dark" | "light";
  brandName: string;
  initialRole?: "customer" | "admin";
  initialCustomerMode?: "signin" | "signup";
  checkoutContext?: {
    itemCount: number;
    totalAmount: number;
    currencySymbol: string;
  } | null;
}

export default function AuthModal({
  isOpen,
  onClose,
  onCustomerLogin,
  onAdminLogin,
  theme,
  brandName,
  initialRole = "customer",
  initialCustomerMode = "signin",
  checkoutContext = null,
}: AuthModalProps) {
  // Primary Role selection: "customer" vs "admin" (Defaults to "customer")
  const [role, setRole] = useState<"customer" | "admin">("customer");

  // Customer sub-mode: "signin" (Customer Login) vs "signup" (Customer Sign Up)
  const [customerMode, setCustomerMode] = useState<"signin" | "signup">("signin");

  // Sign In method: "password" vs "otp"
  const [signInMethod, setSignInMethod] = useState<"password" | "otp">("password");

  // Customer Sign In state
  const [customerLoginIdentifier, setCustomerLoginIdentifier] = useState("");
  const [customerLoginPassword, setCustomerLoginPassword] = useState("");
  const [showCustomerLoginPassword, setShowCustomerLoginPassword] = useState(false);

  // Sign In OTP state
  const [signInOtpStep, setSignInOtpStep] = useState<"enter_identifier" | "enter_otp">("enter_identifier");
  const [signInGeneratedOtp, setSignInGeneratedOtp] = useState("482910");
  const [signInEnteredOtp, setSignInEnteredOtp] = useState("");
  const [signInOtpCountdown, setSignInOtpCountdown] = useState(30);

  // Customer Sign Up state
  const [signupStep, setSignupStep] = useState<"details" | "verify_otp">("details");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);

  // Sign Up OTP Verification Channel: "mobile" vs "email"
  const [otpChannel, setOtpChannel] = useState<"mobile" | "email">("mobile");
  const [signupGeneratedOtp, setSignupGeneratedOtp] = useState("582910");
  const [signupEnteredOtp, setSignupEnteredOtp] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(30);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Admin Login state
  const [adminUsername, setAdminUsername] = useState("admin@threadden.com");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  // Feedback notifications / errors
  const [customerError, setCustomerError] = useState("");
  const [otpSentNotice, setOtpSentNotice] = useState("");

  // Whenever modal opens, reset to initial states
  useEffect(() => {
    if (isOpen) {
      setRole(initialRole);
      setCustomerMode(initialCustomerMode);
      setSignupStep("details");
      setSignInOtpStep("enter_identifier");
      setCustomerError("");
      setAdminError("");
      setOtpSentNotice("");
      setSignupEnteredOtp("");
      setSignInEnteredOtp("");
      setOtpCountdown(30);
      setSignInOtpCountdown(30);
    }
  }, [isOpen, initialRole, initialCustomerMode]);

  // Resend OTP countdown timer for Sign Up
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (signupStep === "verify_otp" && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [signupStep, otpCountdown]);

  // Resend OTP countdown timer for Sign In
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (signInOtpStep === "enter_otp" && signInOtpCountdown > 0) {
      timer = setInterval(() => {
        setSignInOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [signInOtpStep, signInOtpCountdown]);

  if (!isOpen) return null;

  const isDark = theme === "dark";

  // Generate a random 6-digit OTP
  const generateNewOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Quick Demo Customer Login
  const handleQuickDemoCustomer = () => {
    const demoUser: UserProfile = {
      id: "usr_101",
      name: "Alex Morgan",
      email: "alex.morgan@example.com",
      phone: "+91 97100 10989",
      avatarUrl: AVATAR_PRESETS[0],
      createdAt: "2025-01-15",
      isVerified: true,
      verifiedVia: "mobile",
      savedAddresses: [
        {
          id: "addr_1",
          label: "Home",
          fullName: "Alex Morgan",
          phone: "+91 97100 10989",
          streetAddress: "No: 18/B4, EAR Builders, Rasathinagar Road",
          city: "Chennai",
          state: "Tamil Nadu",
          postalCode: "600127",
          isDefault: true,
        },
      ],
      bankDetails: {
        accountHolderName: "Alex Morgan",
        bankName: "HDFC Bank",
        accountNumber: "50100234891234",
        ifscCode: "HDFC0001234",
        upiId: "alex.morgan@okhdfcbank",
        cardLast4: "4242",
      },
    };
    onCustomerLogin(demoUser);
    onClose();
  };

  // -------------------------------------------------------------
  // CUSTOMER SIGN IN: SUBMIT
  // -------------------------------------------------------------
  const handleCustomerLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerError("");

    if (!customerLoginIdentifier.trim()) {
      setCustomerError("Please enter your registered email address or mobile phone.");
      return;
    }

    if (signInMethod === "otp") {
      // Step 1 of OTP login: Send OTP
      const newOtp = generateNewOtp();
      setSignInGeneratedOtp(newOtp);
      setSignInOtpStep("enter_otp");
      setSignInOtpCountdown(30);
      setOtpSentNotice(
        `OTP sent to ${customerLoginIdentifier.trim()}! Demo code is ${newOtp}`
      );
      return;
    }

    // Password login
    const idValue = customerLoginIdentifier.trim();
    const isEmail = idValue.includes("@");
    const displayName = isEmail
      ? idValue.split("@")[0].replace(/[._]/g, " ")
      : "Verified Customer";

    const loggedUser: UserProfile = {
      id: `usr_${Date.now().toString().slice(-6)}`,
      name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
      email: isEmail ? idValue : `${idValue.replace(/[^0-9]/g, "")}@user.threadden.com`,
      phone: isEmail ? "+91 97100 10989" : idValue,
      avatarUrl: selectedAvatar,
      createdAt: new Date().toISOString().split("T")[0],
      isVerified: true,
      verifiedVia: isEmail ? "email" : "mobile",
      savedAddresses: [
        {
          id: `addr_${Date.now()}`,
          label: "Home",
          fullName: displayName,
          phone: isEmail ? "+91 97100 10989" : idValue,
          streetAddress: "No: 18/B4, EAR Builders, Rasathinagar Road",
          city: "Chennai",
          state: "Tamil Nadu",
          postalCode: "600127",
          isDefault: true,
        },
      ],
      bankDetails: {
        accountHolderName: displayName,
        bankName: "State Bank of India",
        upiId: `${displayName.toLowerCase().replace(/\s+/g, "")}@upi`,
      },
    };

    onCustomerLogin(loggedUser);
    onClose();
  };

  // Verify Sign In OTP
  const handleVerifySignInOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerError("");

    if (signInEnteredOtp.trim() !== signInGeneratedOtp.trim()) {
      setCustomerError(`Invalid OTP code entered. Please enter ${signInGeneratedOtp} or click 1-Click Fill.`);
      return;
    }

    const idValue = customerLoginIdentifier.trim();
    const isEmail = idValue.includes("@");
    const displayName = isEmail
      ? idValue.split("@")[0].replace(/[._]/g, " ")
      : "Streetwear Member";

    const loggedUser: UserProfile = {
      id: `usr_${Date.now().toString().slice(-6)}`,
      name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
      email: isEmail ? idValue : `${idValue.replace(/[^0-9]/g, "")}@user.threadden.com`,
      phone: isEmail ? "+91 97100 10989" : idValue,
      avatarUrl: selectedAvatar,
      createdAt: new Date().toISOString().split("T")[0],
      isVerified: true,
      verifiedVia: isEmail ? "email" : "mobile",
      savedAddresses: [],
      bankDetails: {},
    };

    onCustomerLogin(loggedUser);
    onClose();
  };

  // -------------------------------------------------------------
  // CUSTOMER SIGN UP: STEP 1 (Initiate OTP dispatch)
  // -------------------------------------------------------------
  const handleInitiateSignupOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerError("");

    if (!signupName.trim()) {
      setCustomerError("Please enter your full name.");
      return;
    }

    if (!signupEmail.trim() || !signupEmail.includes("@")) {
      setCustomerError("Please enter a valid email address.");
      return;
    }

    const cleanPhone = signupPhone.replace(/[^0-9+]/g, "");
    if (!cleanPhone || cleanPhone.length < 8) {
      setCustomerError("Please enter a valid mobile number (e.g. +91 97100 10989).");
      return;
    }

    setIsSendingOtp(true);
    const newOtp = generateNewOtp();
    setSignupGeneratedOtp(newOtp);

    setTimeout(() => {
      setIsSendingOtp(false);
      setSignupStep("verify_otp");
      setOtpCountdown(30);
      setSignupEnteredOtp("");
      setOtpSentNotice(
        otpChannel === "mobile"
          ? `📲 SMS OTP sent to ${signupPhone.trim()}! Demo code: ${newOtp}`
          : `✉️ Email OTP sent to ${signupEmail.trim()}! Demo code: ${newOtp}`
      );
    }, 450);
  };

  // Resend Sign Up OTP
  const handleResendSignupOtp = (channelOverride?: "mobile" | "email") => {
    const activeChannel = channelOverride || otpChannel;
    if (channelOverride) setOtpChannel(channelOverride);

    const freshOtp = generateNewOtp();
    setSignupGeneratedOtp(freshOtp);
    setOtpCountdown(30);
    setSignupEnteredOtp("");
    setCustomerError("");
    setOtpSentNotice(
      activeChannel === "mobile"
        ? `📲 New SMS OTP sent to ${signupPhone.trim()}! Demo code: ${freshOtp}`
        : `✉️ New Email OTP sent to ${signupEmail.trim()}! Demo code: ${freshOtp}`
    );
  };

  // -------------------------------------------------------------
  // CUSTOMER SIGN UP: STEP 2 (Verify OTP & Complete Account)
  // -------------------------------------------------------------
  const handleVerifySignupOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerError("");

    if (!signupEnteredOtp.trim()) {
      setCustomerError("Please enter the 6-digit OTP code.");
      return;
    }

    if (signupEnteredOtp.trim() !== signupGeneratedOtp.trim()) {
      setCustomerError(`Invalid verification code. Please enter ${signupGeneratedOtp} or use the 1-Click Fill button.`);
      return;
    }

    // Success! Create verified User Profile
    const newUser: UserProfile = {
      id: `usr_${Date.now().toString().slice(-6)}`,
      name: signupName.trim(),
      email: signupEmail.trim(),
      phone: signupPhone.trim(),
      avatarUrl: selectedAvatar,
      createdAt: new Date().toISOString().split("T")[0],
      isVerified: true,
      verifiedVia: otpChannel,
      savedAddresses: [
        {
          id: `addr_${Date.now()}`,
          label: "Home",
          fullName: signupName.trim(),
          phone: signupPhone.trim(),
          streetAddress: "No: 18/B4, EAR Builders, Rasathinagar Road",
          city: "Chennai",
          state: "Tamil Nadu",
          postalCode: "600127",
          isDefault: true,
        },
      ],
      bankDetails: {},
    };

    onCustomerLogin(newUser);
    onClose();
  };

  // -------------------------------------------------------------
  // ADMIN LOGIN SUBMIT
  // -------------------------------------------------------------
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    setIsAdminLoading(true);

    setTimeout(() => {
      const trimmed = adminPassword.trim().toLowerCase();
      if (
        trimmed === "admin123" ||
        trimmed === "admin" ||
        trimmed === "123456" ||
        trimmed === "threadadmin"
      ) {
        setIsAdminLoading(false);
        setAdminPassword("");
        onAdminLogin();
        onClose();
      } else {
        setIsAdminLoading(false);
        setAdminError("Invalid admin access key. Default test passcode is 'admin123'");
      }
    }, 350);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Unified Auth Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className={`relative w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden transition-all my-auto z-10 ${
            isDark
              ? "bg-zinc-900 border-zinc-800 text-zinc-100"
              : "bg-white border-zinc-200 text-zinc-900"
          }`}
          id="unified-auth-modal"
        >
          {/* Top Brand Header */}
          <div
            className={`px-6 py-4 border-b flex items-center justify-between ${
              isDark ? "border-zinc-800 bg-zinc-950/70" : "border-zinc-100 bg-zinc-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl p-1 flex items-center justify-center shrink-0 border overflow-hidden ${
                  role === "admin"
                    ? isDark
                      ? "bg-amber-500/15 border-amber-500/30"
                      : "bg-amber-50 border-amber-200"
                    : isDark
                    ? "bg-zinc-950 border-zinc-800"
                    : "bg-white border-zinc-200 shadow-xs"
                }`}
              >
                <img
                  src={isDark ? "/assets/aistudio/logo_monogram_white.png" : "/assets/aistudio/logo_monogram_dark.png"}
                  alt={brandName}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = "/assets/aistudio/Logo_white_35762b07.png";
                    if (isDark) target.classList.add("invert");
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-base sm:text-lg tracking-tight">
                    {brandName}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase tracking-wider ${
                      role === "admin"
                        ? "bg-amber-500 text-zinc-950 font-black"
                        : "bg-emerald-500 text-zinc-950 font-black"
                    }`}
                  >
                    {role === "admin" ? "Merchant Gate" : "Member Gate"}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {checkoutContext ? "Authenticate to finalize your checkout" : "Authentication gateway for shoppers & administrators"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl transition-all ${
                isDark
                  ? "hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  : "hover:bg-zinc-200 text-zinc-500 hover:text-zinc-950"
              }`}
              id="close-auth-modal-btn"
              title="Close window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CHECKOUT CONTEXT BANNER (Triggered when shopper clicks checkout without logging in) */}
          {checkoutContext && (
            <div className="bg-gradient-to-r from-emerald-600/20 via-emerald-500/15 to-transparent border-b border-emerald-500/20 px-6 py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <ShoppingBag className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-zinc-200 font-medium">
                  Completing order: <strong className="text-white font-mono">{checkoutContext.itemCount} items</strong> ({checkoutContext.currencySymbol}{checkoutContext.totalAmount.toLocaleString()})
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Step 1: Account Required
              </span>
            </div>
          )}

          <div className="p-5 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
            {/* 1. ROLE SELECTOR (CUSTOMER vs ADMIN) */}
            <div className="space-y-1.5">
              <label
                className={`block text-[10px] font-mono uppercase font-bold tracking-wider ${
                  isDark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Select Account Type
              </label>

              <div
                className={`grid grid-cols-2 p-1.5 rounded-2xl border ${
                  isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-100 border-zinc-200"
                }`}
                id="role-selector-container"
              >
                {/* CUSTOMER OPTION (DEFAULT) */}
                <button
                  type="button"
                  onClick={() => {
                    setRole("customer");
                    setCustomerError("");
                  }}
                  className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all relative ${
                    role === "customer"
                      ? isDark
                        ? "bg-zinc-900 text-white shadow-md border border-zinc-700/80"
                        : "bg-white text-zinc-950 shadow-md border border-zinc-200"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                  }`}
                  id="select-customer-role-btn"
                >
                  <User className={`w-4 h-4 ${role === "customer" ? "text-emerald-500" : "text-zinc-400"}`} />
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span>Customer</span>
                      {role === "customer" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <span className="text-[10px] opacity-60 block font-normal -mt-0.5">
                      Shopper &bull; OTP Verification
                    </span>
                  </div>
                </button>

                {/* ADMIN OPTION */}
                <button
                  type="button"
                  onClick={() => {
                    setRole("admin");
                    setAdminError("");
                  }}
                  className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all relative ${
                    role === "admin"
                      ? isDark
                        ? "bg-zinc-900 text-amber-400 shadow-md border border-amber-500/40"
                        : "bg-white text-zinc-950 shadow-md border border-amber-400"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                  }`}
                  id="select-admin-role-btn"
                >
                  <ShieldCheck className={`w-4 h-4 ${role === "admin" ? "text-amber-400" : "text-zinc-400"}`} />
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span>Admin Login</span>
                      {role === "admin" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                    </div>
                    <span className="text-[10px] opacity-60 block font-normal -mt-0.5">
                      Merchant Hub Back-Office
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* ============================================================== */}
            {/* VIEW A: CUSTOMER - Sign In vs Sign Up (OTP-Verified)           */}
            {/* ============================================================== */}
            {role === "customer" && (
              <motion.div
                key="customer-panel"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                {/* Customer Sign In vs Sign Up Sub-Tabs */}
                <div
                  className={`grid grid-cols-2 p-1 rounded-xl border ${
                    isDark ? "bg-zinc-950 border-zinc-850" : "bg-zinc-100/80 border-zinc-200/80"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerMode("signin");
                      setCustomerError("");
                      setOtpSentNotice("");
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      customerMode === "signin"
                        ? isDark
                          ? "bg-zinc-800 text-white shadow-xs"
                          : "bg-white text-zinc-950 shadow-xs"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                    }`}
                    id="customer-signin-tab"
                  >
                    Customer Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerMode("signup");
                      setSignupStep("details");
                      setCustomerError("");
                      setOtpSentNotice("");
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      customerMode === "signup"
                        ? isDark
                          ? "bg-zinc-800 text-white shadow-xs"
                          : "bg-white text-zinc-950 shadow-xs"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                    }`}
                    id="customer-signup-tab"
                  >
                    Sign Up with OTP
                  </button>
                </div>

                {/* Instant Demo Account Banner */}
                <div
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                    isDark
                      ? "bg-indigo-950/30 border-indigo-900/40 text-indigo-200"
                      : "bg-indigo-50/80 border-indigo-100 text-indigo-950"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold">Fast Customer Demo</h4>
                      <p className="text-[10px] opacity-75">
                        Log in immediately with preloaded address &amp; cart items
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickDemoCustomer}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 active:scale-95 cursor-pointer"
                    id="demo-customer-login-btn"
                  >
                    1-Click Login
                  </button>
                </div>

                {/* Error Banner */}
                {customerError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 font-medium"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{customerError}</span>
                  </motion.div>
                )}

                {/* Status / Success Notice */}
                {otpSentNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{otpSentNotice}</span>
                  </motion.div>
                )}

                {/* ============================================================== */}
                {/* 1. CUSTOMER SIGN IN FORM                                       */}
                {/* ============================================================== */}
                {customerMode === "signin" ? (
                  <div className="space-y-4">
                    {/* Method switch: Password vs OTP Login */}
                    <div className="flex items-center justify-between text-xs pb-1">
                      <span className="text-zinc-400 text-[11px] font-medium">Choose Login Method:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSignInMethod("password");
                            setSignInOtpStep("enter_identifier");
                            setCustomerError("");
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                            signInMethod === "password"
                              ? isDark
                                ? "bg-zinc-800 text-white border border-zinc-700"
                                : "bg-white text-zinc-950 shadow-xs border border-zinc-200"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          Password
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSignInMethod("otp");
                            setSignInOtpStep("enter_identifier");
                            setCustomerError("");
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                            signInMethod === "otp"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <Smartphone className="w-3 h-3 text-emerald-400" />
                          <span>OTP Login</span>
                        </button>
                      </div>
                    </div>

                    {signInMethod === "password" ? (
                      /* Sign In with Password */
                      <form onSubmit={handleCustomerLoginSubmit} className="space-y-4">
                        <div>
                          <label
                            className={`block text-[10px] font-mono uppercase font-bold mb-1.5 ${
                              isDark ? "text-zinc-400" : "text-zinc-600"
                            }`}
                          >
                            Email or Mobile Phone *
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                            <input
                              type="text"
                              required
                              placeholder="alex.morgan@example.com or +91..."
                              value={customerLoginIdentifier}
                              onChange={(e) => setCustomerLoginIdentifier(e.target.value)}
                              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs outline-none transition-all ${
                                isDark
                                  ? "bg-zinc-950 border-zinc-800 text-white focus:border-emerald-500"
                                  : "bg-white border-zinc-300 text-zinc-900 focus:border-zinc-950"
                              }`}
                              id="customer-login-email-input"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label
                              className={`text-[10px] font-mono uppercase font-bold ${
                                isDark ? "text-zinc-400" : "text-zinc-600"
                              }`}
                            >
                              Password
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setCustomerLoginIdentifier("alex.morgan@example.com");
                                setCustomerLoginPassword("pass123");
                              }}
                              className="text-[10px] text-emerald-500 hover:underline font-mono"
                            >
                              Quick test password
                            </button>
                          </div>
                          <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                            <input
                              type={showCustomerLoginPassword ? "text" : "password"}
                              placeholder="Enter your customer password"
                              value={customerLoginPassword}
                              onChange={(e) => setCustomerLoginPassword(e.target.value)}
                              className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-xs outline-none transition-all ${
                                isDark
                                  ? "bg-zinc-950 border-zinc-800 text-white focus:border-emerald-500"
                                  : "bg-white border-zinc-300 text-zinc-900 focus:border-zinc-950"
                              }`}
                              id="customer-login-password-input"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCustomerLoginPassword(!showCustomerLoginPassword)}
                              className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200"
                            >
                              {showCustomerLoginPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className={`w-full py-3.5 px-4 rounded-2xl font-display font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer ${
                            isDark
                              ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black shadow-emerald-500/20"
                              : "bg-zinc-950 hover:bg-zinc-800 text-white shadow-zinc-950/20"
                          }`}
                          id="submit-customer-signin-btn"
                        >
                          <span>Sign In as Customer</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>
                    ) : (
                      /* Sign In with OTP */
                      <div className="space-y-4">
                        {signInOtpStep === "enter_identifier" ? (
                          <form onSubmit={handleCustomerLoginSubmit} className="space-y-4">
                            <div>
                              <label
                                className={`block text-[10px] font-mono uppercase font-bold mb-1.5 ${
                                  isDark ? "text-zinc-400" : "text-zinc-600"
                                }`}
                              >
                                Registered Mobile Phone or Email *
                              </label>
                              <div className="relative">
                                <Smartphone className="w-4 h-4 absolute left-3 top-3 text-emerald-400" />
                                <input
                                  type="text"
                                  required
                                  placeholder="+91 97100 10989 or your email"
                                  value={customerLoginIdentifier}
                                  onChange={(e) => setCustomerLoginIdentifier(e.target.value)}
                                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs outline-none transition-all ${
                                    isDark
                                      ? "bg-zinc-950 border-zinc-800 text-white focus:border-emerald-500"
                                      : "bg-white border-zinc-300 text-zinc-900 focus:border-zinc-950"
                                  }`}
                                  id="customer-login-otp-identifier"
                                />
                              </div>
                              <p className="text-[11px] text-zinc-400 mt-1.5">
                                We'll generate an instant 6-digit login verification OTP.
                              </p>
                            </div>

                            <button
                              type="submit"
                              className="w-full py-3.5 px-4 rounded-2xl font-display font-bold text-xs flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-98 cursor-pointer"
                              id="send-signin-otp-btn"
                            >
                              <span>Send Login OTP</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </form>
                        ) : (
                          /* Enter Sign In OTP */
                          <form onSubmit={handleVerifySignInOtp} className="space-y-4">
                            <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-zinc-400">Sent to: <strong className="text-white">{customerLoginIdentifier}</strong></span>
                                <button
                                  type="button"
                                  onClick={() => setSignInOtpStep("enter_identifier")}
                                  className="text-emerald-400 hover:underline"
                                >
                                  Change
                                </button>
                              </div>

                              {/* 1-Click Fast Test Code Helper */}
                              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
                                <span className="text-xs font-mono text-emerald-300">
                                  Demo Test OTP: <strong className="text-white font-bold">{signInGeneratedOtp}</strong>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setSignInEnteredOtp(signInGeneratedOtp)}
                                  className="px-2 py-1 bg-emerald-500 text-zinc-950 font-mono font-bold text-[10px] rounded-md hover:bg-emerald-400 transition-all"
                                >
                                  1-Click Fill
                                </button>
                              </div>
                            </div>

                            <div>
                              <label
                                className={`block text-[10px] font-mono uppercase font-bold mb-1.5 ${
                                  isDark ? "text-zinc-400" : "text-zinc-600"
                                }`}
                              >
                                Enter 6-Digit Verification Code *
                              </label>
                              <input
                                type="text"
                                maxLength={6}
                                required
                                placeholder="e.g. 482910"
                                value={signInEnteredOtp}
                                onChange={(e) => setSignInEnteredOtp(e.target.value.replace(/[^0-9]/g, ""))}
                                className={`w-full py-3 px-4 text-center rounded-xl border text-lg font-mono font-bold tracking-widest outline-none transition-all ${
                                  isDark
                                    ? "bg-zinc-950 border-zinc-800 text-emerald-400 focus:border-emerald-500"
                                    : "bg-white border-zinc-300 text-zinc-900 focus:border-zinc-950"
                                }`}
                                id="signin-otp-input"
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full py-3.5 px-4 rounded-2xl font-display font-bold text-xs flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-98 cursor-pointer"
                              id="verify-signin-otp-btn"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Verify &amp; Sign In</span>
                            </button>
                          </form>
                        )}
                      </div>
                    )}

                    <p className="text-center text-xs text-zinc-500 pt-1">
                      New to {brandName}?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerMode("signup");
                          setSignupStep("details");
                          setCustomerError("");
                        }}
                        className="text-emerald-500 font-bold hover:underline"
                      >
                        Create an account with OTP
                      </button>
                    </p>
                  </div>
                ) : (
                  /* ============================================================== */
                  /* 2. CUSTOMER SIGN UP WITH MANDATORY OTP VERIFICATION            */
                  /* ============================================================== */
                  <div className="space-y-4">
                    {signupStep === "details" ? (
                      /* STAGE 1: Enter Profile Details & Pick OTP Method */
                      <form onSubmit={handleInitiateSignupOtp} className="space-y-3.5">
                        <div>
                          <label
                            className={`block text-[10px] font-mono uppercase font-bold mb-1 ${
                              isDark ? "text-zinc-400" : "text-zinc-600"
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
                              value={signupName}
                              onChange={(e) => setSignupName(e.target.value)}
                              className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs outline-none transition-all ${
                                isDark
                                  ? "bg-zinc-950 border-zinc-800 text-white focus:border-emerald-500"
                                  : "bg-white border-zinc-300 text-zinc-900 focus:border-zinc-950"
                              }`}
                              id="customer-signup-name-input"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label
                              className={`block text-[10px] font-mono uppercase font-bold mb-1 ${
                                isDark ? "text-zinc-400" : "text-zinc-600"
                              }`}
                            >
                              Mobile Phone *
                            </label>
                            <div className="relative">
                              <Phone className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                              <input
                                type="tel"
                                required
                                placeholder="+91 97100 10989"
                                value={signupPhone}
                                onChange={(e) => setSignupPhone(e.target.value)}
                                className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-none transition-all font-mono ${
                                  isDark
                                    ? "bg-zinc-950 border-zinc-800 text-white focus:border-emerald-500"
                                    : "bg-white border-zinc-300 text-zinc-900 focus:border-zinc-950"
                                }`}
                                id="customer-signup-phone-input"
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              className={`block text-[10px] font-mono uppercase font-bold mb-1 ${
                                isDark ? "text-zinc-400" : "text-zinc-600"
                              }`}
                            >
                              Email Address *
                            </label>
                            <div className="relative">
                              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                              <input
                                type="email"
                                required
                                placeholder="alex@example.com"
                                value={signupEmail}
                                onChange={(e) => setSignupEmail(e.target.value)}
                                className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-none transition-all ${
                                  isDark
                                    ? "bg-zinc-950 border-zinc-800 text-white focus:border-emerald-500"
                                    : "bg-white border-zinc-300 text-zinc-900 focus:border-zinc-950"
                                }`}
                                id="customer-signup-email-input"
                              />
                            </div>
                          </div>
                        </div>

                        {/* OTP Verification Method Selector */}
                        <div className="space-y-1.5 pt-1">
                          <label
                            className={`block text-[10px] font-mono uppercase font-bold ${
                              isDark ? "text-emerald-400" : "text-emerald-700"
                            }`}
                          >
                            Select OTP Verification Channel *
                          </label>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setOtpChannel("mobile")}
                              className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 font-medium transition-all cursor-pointer ${
                                otpChannel === "mobile"
                                  ? isDark
                                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                                    : "bg-emerald-50 border-emerald-300 text-emerald-950"
                                  : isDark
                                  ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                                  : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-900"
                              }`}
                            >
                              <Phone className={`w-4 h-4 shrink-0 ${otpChannel === "mobile" ? "text-emerald-400" : "text-zinc-500"}`} />
                              <div className="text-left">
                                <span className="font-bold block text-[11px]">Mobile Number OTP</span>
                                <span className="text-[9px] opacity-75 font-mono">SMS / WhatsApp</span>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setOtpChannel("email")}
                              className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 font-medium transition-all cursor-pointer ${
                                otpChannel === "email"
                                  ? isDark
                                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                                    : "bg-emerald-50 border-emerald-300 text-emerald-950"
                                  : isDark
                                  ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                                  : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-900"
                              }`}
                            >
                              <Mail className={`w-4 h-4 shrink-0 ${otpChannel === "email" ? "text-emerald-400" : "text-zinc-500"}`} />
                              <div className="text-left">
                                <span className="font-bold block text-[11px]">Email OTP</span>
                                <span className="text-[9px] opacity-75 font-mono">Direct Inbox Code</span>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Optional Password creation */}
                        <div>
                          <label
                            className={`block text-[10px] font-mono uppercase font-bold mb-1 ${
                              isDark ? "text-zinc-400" : "text-zinc-600"
                            }`}
                          >
                            Set Account Password (Optional)
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3 top-2 text-zinc-400" />
                            <input
                              type={showSignupPassword ? "text" : "password"}
                              placeholder="For password login (or sign in via OTP anytime)"
                              value={signupPassword}
                              onChange={(e) => setSignupPassword(e.target.value)}
                              className={`w-full pl-9 pr-10 py-1.5 rounded-xl border text-xs outline-none transition-all ${
                                isDark
                                  ? "bg-zinc-950 border-zinc-800 text-white focus:border-emerald-500"
                                  : "bg-white border-zinc-300 text-zinc-900 focus:border-zinc-950"
                              }`}
                              id="customer-signup-password-input"
                            />
                            <button
                              type="button"
                              onClick={() => setShowSignupPassword(!showSignupPassword)}
                              className="absolute right-3 top-1.5 text-zinc-400 hover:text-zinc-200"
                            >
                              {showSignupPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Avatar Picker */}
                        <div>
                          <label
                            className={`block text-[10px] font-mono uppercase font-bold mb-1.5 ${
                              isDark ? "text-zinc-400" : "text-zinc-600"
                            }`}
                          >
                            Choose Avatar
                          </label>
                          <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {AVATAR_PRESETS.map((url, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setSelectedAvatar(url)}
                                className={`relative w-8 h-8 rounded-full overflow-hidden shrink-0 transition-all border-2 ${
                                  selectedAvatar === url
                                    ? "border-emerald-500 scale-105 shadow-sm shadow-emerald-500/30"
                                    : "border-transparent opacity-60 hover:opacity-100"
                                }`}
                              >
                                <img
                                  src={url}
                                  alt={`Preset ${i + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {selectedAvatar === url && (
                                  <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSendingOtp}
                          className={`w-full py-3.5 px-4 rounded-2xl font-display font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer ${
                            isDark
                              ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black shadow-emerald-500/20"
                              : "bg-zinc-950 hover:bg-zinc-800 text-white"
                          }`}
                          id="submit-customer-signup-btn"
                        >
                          {isSendingOtp ? (
                            <span className="flex items-center gap-2">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Dispatching OTP Code...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <span>Send Verification OTP</span>
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          )}
                        </button>
                      </form>
                    ) : (
                      /* STAGE 2: Verify OTP Screen */
                      <form onSubmit={handleVerifySignupOtp} className="space-y-4 animate-in fade-in duration-200">
                        {/* Target Info & Channel Toggle */}
                        <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2.5">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-zinc-400 flex items-center gap-1.5">
                              {otpChannel === "mobile" ? (
                                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                              <span>
                                Sent to: <strong className="text-white">{otpChannel === "mobile" ? signupPhone : signupEmail}</strong>
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setSignupStep("details")}
                              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 underline"
                            >
                              Edit
                            </button>
                          </div>

                          {/* Switch Channel Quick Action */}
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-800/80 text-zinc-400">
                            <span>Prefer other channel?</span>
                            <button
                              type="button"
                              onClick={() => handleResendSignupOtp(otpChannel === "mobile" ? "email" : "mobile")}
                              className="text-emerald-400 hover:underline font-mono font-medium"
                            >
                              Switch to {otpChannel === "mobile" ? "Email OTP" : "Mobile Phone OTP"}
                            </button>
                          </div>

                          {/* 1-Click Fast Test Code Helper Box */}
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-mono uppercase text-emerald-400 block font-bold">
                                🧪 Test Simulator OTP
                              </span>
                              <span className="text-xs font-mono font-bold text-white tracking-widest">
                                {signupGeneratedOtp}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSignupEnteredOtp(signupGeneratedOtp)}
                              className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold font-mono text-[11px] rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
                              id="auto-fill-signup-otp-btn"
                            >
                              ⚡ 1-Click Fill OTP
                            </button>
                          </div>
                        </div>

                        {/* 6-Digit OTP Code Input */}
                        <div>
                          <label
                            className={`block text-[10px] font-mono uppercase font-bold mb-1.5 ${
                              isDark ? "text-zinc-400" : "text-zinc-600"
                            }`}
                          >
                            Enter 6-Digit Verification Code *
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            required
                            autoFocus
                            placeholder="• • • • • •"
                            value={signupEnteredOtp}
                            onChange={(e) => setSignupEnteredOtp(e.target.value.replace(/[^0-9]/g, ""))}
                            className={`w-full py-3.5 px-4 text-center rounded-2xl border text-xl font-mono font-bold tracking-[0.4em] outline-none transition-all ${
                              isDark
                                ? "bg-zinc-950 border-zinc-800 text-emerald-400 focus:border-emerald-500"
                                : "bg-white border-zinc-300 text-zinc-900 focus:border-zinc-950"
                            }`}
                            id="signup-otp-input"
                          />
                        </div>

                        {/* Resend OTP Timer & Actions */}
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                          <button
                            type="button"
                            onClick={() => setSignupStep("details")}
                            className="flex items-center gap-1 hover:text-white"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Back to Details</span>
                          </button>

                          {otpCountdown > 0 ? (
                            <span className="font-mono text-[11px] flex items-center gap-1 text-zinc-500">
                              <Clock className="w-3.5 h-3.5 text-zinc-500" />
                              Resend in {otpCountdown}s
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleResendSignupOtp()}
                              className="text-emerald-400 hover:underline font-mono font-semibold"
                            >
                              Resend OTP Now
                            </button>
                          )}
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3.5 px-4 rounded-2xl font-display font-bold text-xs flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-98 cursor-pointer"
                          id="verify-signup-otp-btn"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify OTP &amp; Complete Sign Up</span>
                        </button>
                      </form>
                    )}

                    <p className="text-center text-xs text-zinc-500 pt-1">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerMode("signin");
                          setCustomerError("");
                        }}
                        className="text-emerald-500 font-bold hover:underline"
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ============================================================== */}
            {/* VIEW B: ADMIN - Admin Login                                    */}
            {/* ============================================================== */}
            {role === "admin" && (
              <motion.div
                key="admin-panel"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                {/* Admin Restrict Notice */}
                <div
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                    isDark
                      ? "bg-amber-500/10 border-amber-500/25 text-amber-300"
                      : "bg-amber-50 border-amber-200 text-amber-900"
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold">Merchant Hub Administration</p>
                    <p className="text-[11px] opacity-80 leading-relaxed">
                      Admin credentials unlock wholesale catalog base costs, retail price margins, order dispatch status, and revenue analytics for {brandName}.
                    </p>
                  </div>
                </div>

                {/* Quick 1-click Test Admin Key */}
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                    isDark
                      ? "bg-zinc-950 border-zinc-800 text-zinc-400"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    Default Key: <strong className="text-amber-400 font-bold">admin123</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminPassword("admin123");
                      setAdminError("");
                    }}
                    className="text-xs text-amber-400 font-bold hover:underline cursor-pointer"
                    id="quick-fill-admin-key-btn"
                  >
                    Quick Fill
                  </button>
                </div>

                {adminError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 font-medium"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{adminError}</span>
                  </motion.div>
                )}

                <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                  <div>
                    <label
                      className={`block text-[10px] font-mono uppercase font-bold mb-1.5 ${
                        isDark ? "text-zinc-400" : "text-zinc-600"
                      }`}
                    >
                      Admin Username / ID
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                      <input
                        type="text"
                        required
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs outline-none transition-all ${
                          isDark
                            ? "bg-zinc-950 border-zinc-800 text-white focus:border-amber-400"
                            : "bg-white border-zinc-300 text-zinc-900 focus:border-zinc-950"
                        }`}
                        id="admin-login-username-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-[10px] font-mono uppercase font-bold mb-1.5 ${
                        isDark ? "text-zinc-400" : "text-zinc-600"
                      }`}
                    >
                      Admin Secret Passcode *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                      <input
                        type={showAdminPassword ? "text" : "password"}
                        required
                        placeholder="Enter admin passcode (e.g. admin123)"
                        value={adminPassword}
                        onChange={(e) => {
                          setAdminPassword(e.target.value);
                          setAdminError("");
                        }}
                        className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-xs outline-none transition-all font-mono ${
                          isDark
                            ? "bg-zinc-950 border-zinc-800 text-white focus:border-amber-400"
                            : "bg-white border-zinc-300 text-zinc-900 focus:border-zinc-950"
                        }`}
                        id="admin-login-password-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200"
                      >
                        {showAdminPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAdminLoading}
                    className="w-full py-3.5 px-4 rounded-2xl font-display font-black text-xs flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-lg shadow-amber-500/20 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                    id="submit-admin-login-btn"
                  >
                    {isAdminLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                        Authenticating Merchant...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        Sign In to Merchant Hub
                      </span>
                    )}
                  </button>

                  <p className="text-center text-xs text-zinc-500 pt-1">
                    Not an administrator?{" "}
                    <button
                      type="button"
                      onClick={() => setRole("customer")}
                      className="text-amber-400 font-bold hover:underline"
                    >
                      Switch to Customer Login
                    </button>
                  </p>
                </form>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
