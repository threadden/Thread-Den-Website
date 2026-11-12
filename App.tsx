import React, { useState, useEffect, useRef } from "react";
import { 
  Filter, Sparkles, AlertCircle, ShoppingBag, ArrowRight, Settings, 
  HelpCircle, ChevronRight, Sliders, Smartphone, SlidersHorizontal, X, RotateCcw,
  Lock, ShieldCheck, KeyRound
} from "lucide-react";
import { Product, CartItem, Order, ResellerCalculator, UserProfile, BrandPartner } from "./types";
import { DEFAULT_PRODUCTS, CATEGORIES, DEFAULT_CALCULATOR, DEFAULT_ORDERS, DEFAULT_BRAND_PARTNERS } from "./data";

// Component imports
import Header from "./components/Header";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import ProductDetailModal from "./components/ProductDetailModal";
import CartSidebar from "./components/CartSidebar";
import MerchantPortal from "./components/MerchantPortal";
import Testimonials from "./components/Testimonials";
import PushNotificationCenter, { PushNotification } from "./components/PushNotificationCenter";
import AccountModal from "./components/AccountModal";
import PriceRangeFilter from "./components/PriceRangeFilter";
import FilterModal from "./components/FilterModal";
import AuthModal from "./components/AuthModal";
import GeminiChatbot from "./components/GeminiChatbot";
import AiStylistModal from "./components/AiStylistModal";
import Footer from "./components/Footer";

export default function App() {
  // --- 1. LOCAL PERSISTENCE STATE ENGINE ---
  // Merchant Hub is CLOSED by default: Storefront is the default viewport
  const [currentMode, setCurrentMode] = useState<"customer" | "merchant">("customer");

  // Admin Auth State: False by default so merchant hub is locked and closed
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);

  // AI Stylist Miniature Fitting Room State
  const [isStylistOpen, setIsStylistOpen] = useState<boolean>(false);
  const [stylistTargetProduct, setStylistTargetProduct] = useState<Product | null>(null);
  const [stylistTargetColor, setStylistTargetColor] = useState<{ name: string; hex: string } | undefined>(undefined);

  const handleOpenStylist = (product?: Product, color?: { name: string; hex: string }) => {
    if (product) {
      setStylistTargetProduct(product);
      setStylistTargetColor(color);
    } else if (!stylistTargetProduct && products.length > 0) {
      setStylistTargetProduct(products[0]);
    }
    setIsStylistOpen(true);
  };

  // Enforce that merchant mode is NEVER open if not admin authenticated
  useEffect(() => {
    if (currentMode === "merchant" && !isAdminAuthenticated) {
      setCurrentMode("customer");
    }
  }, [currentMode, isAdminAuthenticated]);

  const handleModeChange = (mode: "customer" | "merchant") => {
    if (mode === "merchant" && !isAdminAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentMode(mode);
  };

  const handleAdminSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsAuthModalOpen(false);
    setCurrentMode("merchant");
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title: "🛡️ Admin Authenticated",
        body: "Welcome to the Reseller Merchant Hub Back-Office.",
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      },
      ...prev,
    ]);
  };

  const handleAdminSignOut = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem("tshirt_reseller_admin_auth");
    setCurrentMode("customer");
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title: "🔒 Admin Portal Locked",
        body: "You have signed out of the Merchant Admin Portal.",
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      },
      ...prev,
    ]);
  };

  // User Profile / Customer Auth state: null by default so "Login / Sign Up" shows by default
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Auth Modal contextual modes (e.g. checkout interception vs manual login)
  const [authModalInitialMode, setAuthModalInitialMode] = useState<"signin" | "signup">("signin");
  const [authModalCheckoutContext, setAuthModalCheckoutContext] = useState<{
    itemCount: number;
    totalAmount: number;
    currencySymbol: string;
  } | null>(null);

  const handleCustomerLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setAuthModalCheckoutContext(null);
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title: `👋 Welcome, ${user.name}`,
        body: user.isVerified
          ? `Verified via ${user.verifiedVia === "email" ? "Email" : "Mobile Phone"} OTP. Ready for checkout!`
          : "Signed in successfully as Customer.",
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      },
      ...prev,
    ]);
  };

  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("tshirt_reseller_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("tshirt_reseller_user");
    }
  }, [currentUser]);

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("tshirt_reseller_products");
    if (saved) {
      try {
        const parsed: Product[] = JSON.parse(saved);
        const hasAnyFeatured = parsed.some((p) => p.isFeatured === true);
        if (!hasAnyFeatured && parsed.length > 0) {
          return parsed.map((p, idx) => ({
            ...p,
            isFeatured: idx < 4,
          }));
        }
        return parsed;
      } catch (e) {
        return DEFAULT_PRODUCTS;
      }
    }
    return DEFAULT_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("tshirt_reseller_orders");
    return saved ? JSON.parse(saved) : DEFAULT_ORDERS;
  });

  const [brandPartners, setBrandPartners] = useState<BrandPartner[]>(() => {
    const saved = localStorage.getItem("tshirt_reseller_brand_partners");
    return saved ? JSON.parse(saved) : DEFAULT_BRAND_PARTNERS;
  });

  useEffect(() => {
    localStorage.setItem("tshirt_reseller_brand_partners", JSON.stringify(brandPartners));
  }, [brandPartners]);

  const [calculator, setCalculator] = useState<ResellerCalculator>(() => {
    const saved = localStorage.getItem("tshirt_reseller_calculator");
    return saved ? JSON.parse(saved) : DEFAULT_CALCULATOR;
  });

  const [brandName, setBrandName] = useState<string>(() => {
    return localStorage.getItem("tshirt_reseller_brand") || "THREAD DEN";
  });

  const [merchantWhatsApp, setMerchantWhatsApp] = useState<string>(() => {
    const saved = localStorage.getItem("tshirt_reseller_whatsapp");
    if (!saved || saved.includes("98765 43210")) {
      return "+91 97100 10989";
    }
    return saved;
  });

  const [currencySymbol, setCurrencySymbol] = useState<string>(() => {
    return localStorage.getItem("tshirt_reseller_currency") || "₹";
  });

  // Global Theme State & Persistence (Default is 'dark')
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("tshirt_reseller_theme");
    return (saved as "dark" | "light") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("tshirt_reseller_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const isDark = theme === "dark";

  // Wishlist / Saved Items State & Persistence
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("tshirt_reseller_wishlist");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return ["prod_1", "prod_3"];
      }
    }
    return ["prod_1", "prod_3"];
  });

  useEffect(() => {
    localStorage.setItem("tshirt_reseller_wishlist", JSON.stringify(wishlistProductIds));
  }, [wishlistProductIds]);

  const handleToggleWishlist = (product: Product) => {
    setWishlistProductIds((prev) => {
      const exists = prev.includes(product.id);
      return exists ? prev.filter((id) => id !== product.id) : [...prev, product.id];
    });
  };

  // Price Drop Alert Subscriptions State & Persistence
  const [priceAlertProductIds, setPriceAlertProductIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("tshirt_reseller_price_alerts");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return ["prod_1"];
      }
    }
    return ["prod_1"];
  });

  useEffect(() => {
    localStorage.setItem("tshirt_reseller_price_alerts", JSON.stringify(priceAlertProductIds));
  }, [priceAlertProductIds]);

  const playNotificationChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        const playTone = (freq: number, startTime: number, duration: number) => {
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, startTime);
          gainNode.gain.setValueAtTime(0.12, startTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          osc.start(startTime);
          osc.stop(startTime + duration);
        };
        const now = audioCtx.currentTime;
        playTone(523.25, now, 0.15); // C5
        playTone(659.25, now + 0.1, 0.15); // E5
        playTone(783.99, now + 0.2, 0.25); // G5
      }
    } catch (err) {
      console.warn("Chime failed:", err);
    }
  };

  const handleTogglePriceAlert = (product: Product) => {
    setPriceAlertProductIds((prev) => {
      const isSubscribed = prev.includes(product.id);
      const next = isSubscribed ? prev.filter((id) => id !== product.id) : [...prev, product.id];

      if (!isSubscribed) {
        const timestamp = new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        const newNotif: PushNotification = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          title: "📉 Price Drop Alerts Active!",
          body: `You are now subscribed to automatic price change notifications for "${product.name}".`,
          productId: product.id,
          productName: product.name,
          timestamp,
        };

        setNotifications((prevNotifs) => [newNotif, ...prevNotifs]);
        playNotificationChime();
      }

      return next;
    });
  };

  const handleSimulatePriceDrop = (product: Product) => {
    const oldPrice = product.price;
    const discountedPrice = Math.max(10, Math.round(oldPrice * 0.85)); // 15% price cut

    // Update product price in state
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, price: discountedPrice } : p))
    );

    // If selected product is currently opened, update its price in state as well
    if (selectedProduct && selectedProduct.id === product.id) {
      setSelectedProduct((prev) => (prev ? { ...prev, price: discountedPrice } : null));
    }

    const timestamp = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const newNotif: PushNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: "🔥 PRICE DROP ALERT!",
      body: `"${product.name}" dropped from ${currencySymbol}${oldPrice.toLocaleString()} to ${currencySymbol}${discountedPrice.toLocaleString()}! Limited time price event.`,
      productId: product.id,
      productName: product.name,
      timestamp,
    };

    setNotifications((prevNotifs) => [newNotif, ...prevNotifs]);
    playNotificationChime();

    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        new Notification("THREAD DEN - Price Drop Alert!", {
          body: `"${product.name}" is now on sale for ${currencySymbol}${discountedPrice}!`,
        });
      } catch (e) {
        console.warn("Native Notification failed:", e);
      }
    }
  };

  // Active Customer Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Dynamic Catalog Price Range Calculation
  const catalogMinPrice = React.useMemo(() => {
    if (!products || products.length === 0) return 0;
    return Math.min(...products.map((p) => p.price));
  }, [products]);

  const catalogMaxPrice = React.useMemo(() => {
    if (!products || products.length === 0) return 3000;
    return Math.max(...products.map((p) => p.price));
  }, [products]);

  const [minPriceFilter, setMinPriceFilter] = useState<number>(0);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(3000);

  // Auto-sync initial max price when products load
  const priceInitializedRef = useRef<boolean>(false);
  useEffect(() => {
    if (catalogMaxPrice > 0 && !priceInitializedRef.current) {
      setMinPriceFilter(catalogMinPrice);
      setMaxPriceFilter(catalogMaxPrice);
      priceInitializedRef.current = true;
    }
  }, [catalogMinPrice, catalogMaxPrice]);

  // Cart & UI Modal States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

  // Sync state modifications to LocalStorage
  useEffect(() => {
    localStorage.setItem("tshirt_reseller_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("tshirt_reseller_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("tshirt_reseller_calculator", JSON.stringify(calculator));
  }, [calculator]);

  // --- PUSH NOTIFICATION SIMULATOR STATE & LOGIC ---
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(() => {
    return typeof Notification !== "undefined" ? Notification.permission : "default";
  });

  // Track product stock alerts to avoid duplicate alerts
  const alertTriggeredRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    products.forEach((p) => {
      const isLow = p.stockCount < 2;
      const alreadyAlerted = alertTriggeredRef.current[p.id];

      if (isLow && !alreadyAlerted) {
        // Trigger alert!
        const timestamp = new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });

        const newNotif: PushNotification = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          title: "Low Stock Triggered!",
          body: `Product "${p.name}" has dropped below 2 units! Current stock is ${p.stockCount}. Prioritize restocking.`,
          productId: p.id,
          productName: p.name,
          timestamp,
        };

        setNotifications((prev) => [newNotif, ...prev]);

        // Synthesize a beautiful double-beep push notification audio chime
        if (soundEnabled) {
          try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
              const audioCtx = new AudioContextClass();
              const playChimeTone = (freq: number, startTime: number, duration: number) => {
                const osc = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, startTime);
                gainNode.gain.setValueAtTime(0.12, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
                osc.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                osc.start(startTime);
                osc.stop(startTime + duration);
              };
              const now = audioCtx.currentTime;
              playChimeTone(587.33, now, 0.15); // D5
              playChimeTone(880.00, now + 0.1, 0.25); // A5
            }
          } catch (err) {
            console.warn("Chime playback failed:", err);
          }
        }

        // Trigger native notification if granted
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          try {
            new Notification("THREAD DEN - Low Stock!", {
              body: `"${p.name}" is down to ${p.stockCount} units.`,
            });
          } catch (e) {
            console.warn("Native Notification failed:", e);
          }
        }

        alertTriggeredRef.current[p.id] = true;
      } else if (!isLow && alreadyAlerted) {
        // Reset low stock alert trigger when restocked
        alertTriggeredRef.current[p.id] = false;
      }
    });
  }, [products, soundEnabled]);

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleQuickRestock = (productId: string) => {
    setProducts((prev) => {
      return prev.map((p) => {
        if (p.id === productId) {
          const nextStock = p.stockCount + 50;
          return {
            ...p,
            stockCount: nextStock,
            isAvailable: nextStock > 0,
          };
        }
        return p;
      });
    });
  };

  const handleViewProductStock = (productId: string) => {
    if (!isAdminAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentMode("merchant");
    // Scrolls smoothly to the inventory section inside merchant portal
    setTimeout(() => {
      const el = document.getElementById("inventory-management-table") || document.getElementById("merchant-dashboard-view");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleRequestNotificationPermission = () => {
    if (typeof Notification !== "undefined") {
      Notification.requestPermission().then((status) => {
        setPermissionStatus(status);
      });
    }
  };

  // Synchronize product prices if the merchant updates the wholesale target retail price
  const handleUpdateCalculator = (newCalc: ResellerCalculator) => {
    setCalculator(newCalc);
    // Optionally update default pricing across standard products
    const updatedProducts = products.map((p) => {
      // If it is one of our default products, update its pricing structure
      if (p.id.startsWith("prod_")) {
        return { ...p, price: newCalc.targetRetailPrice };
      }
      return p;
    });
    setProducts(updatedProducts);
  };

  const handleUpdateBrandConfig = (newBrand: string, newWhatsApp: string) => {
    setBrandName(newBrand);
    setMerchantWhatsApp(newWhatsApp);
    localStorage.setItem("tshirt_reseller_brand", newBrand);
    localStorage.setItem("tshirt_reseller_whatsapp", newWhatsApp);
  };

  // --- 2. SHOPPING CART LOGIC ---
  const handleAddToCart = (
    product: Product,
    size: string,
    color: { name: string; hex: string },
    quantity: number
  ) => {
    const compositeId = `${product.id}_${size}_${color.name}`;
    
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === compositeId);
      
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        const newItem: CartItem = {
          id: compositeId,
          product,
          selectedSize: size,
          selectedColor: color,
          quantity,
        };
        return [...prevCart, newItem];
      }
    });
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Order Submission & Cart Clearance
  const handleOrderSubmitted = (orderData: Omit<Order, "id" | "createdAt" | "status"> & { status?: Order["status"] }) => {
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      createdAt: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: orderData.status || "pending",
    };

    setOrders((prev) => [newOrder, ...prev]);
    
    // Deduct from Stock Count
    setProducts((prevProducts) => {
      return prevProducts.map((p) => {
        const orderedItem = orderData.items.find((item) => item.productId === p.id);
        if (orderedItem) {
          const nextStock = Math.max(0, p.stockCount - orderedItem.quantity);
          return {
            ...p,
            stockCount: nextStock,
            isAvailable: nextStock > 0,
          };
        }
        return p;
      });
    });

    // Clear cart upon successful reservation
    setCart([]);

    // Push Notification alert for Store Owner Message Dispatch
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "🚨 New Order Placed! Owner Notified",
        message: `Order #${orderId} (${currencySymbol}${orderData.totalAmount}) by ${orderData.customerName}. SMS/WhatsApp message generated for Store Owner at ${merchantWhatsApp}.`,
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        type: "order",
      },
      ...prev,
    ]);
  };

  // Order Cancellation & Stock Restock Handler
  const handleCancelOrder = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    if (targetOrder.status !== "pending") {
      alert(`Order ${orderId} cannot be cancelled as it is already ${targetOrder.status}.`);
      return;
    }

    // 1. Update Order Status to 'cancelled'
    setOrders((prevOrders) =>
      prevOrders.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
    );

    // 2. Add items back to product inventory stock
    setProducts((prevProducts) => {
      return prevProducts.map((p) => {
        const cancelledItems = targetOrder.items.filter((item) => item.productId === p.id);
        if (cancelledItems.length > 0) {
          const returnedQty = cancelledItems.reduce((sum, item) => sum + item.quantity, 0);
          const nextStock = p.stockCount + returnedQty;
          return {
            ...p,
            stockCount: nextStock,
            isAvailable: nextStock > 0,
          };
        }
        return p;
      });
    });

    // 3. Dispatch Push Notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "Order Cancelled & Restocked",
        message: `Order ${orderId} was cancelled. Inventory items were added back to stock count.`,
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        type: "stock",
      },
      ...prev,
    ]);
  };

  // --- 3. FILTER LOGIC FOR CUSTOMERS ---
  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPrice = p.price >= minPriceFilter && p.price <= maxPriceFilter;
    return matchCategory && matchSearch && matchPrice;
  });

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col font-sans selection:bg-zinc-950 selection:text-white ${
      isDark ? "bg-zinc-950 text-zinc-100" : "bg-slate-50 text-zinc-950"
    }`}>
      
      {/* Universal Sticky Header Navigation */}
      <Header
        brandName={brandName}
        currencySymbol={currencySymbol}
        currentMode={currentMode}
        onModeChange={handleModeChange}
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
        theme={theme}
        onThemeToggle={toggleTheme}
        currentUser={currentUser}
        onOpenAccountModal={() => {
          if (currentUser) {
            setIsAccountOpen(true);
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        isAdminAuthenticated={isAdminAuthenticated}
        onAdminSignOut={handleAdminSignOut}
        onOpenChatbot={() => handleOpenStylist()}
        onOpenAiStylist={() => handleOpenStylist()}
      />

      <main className="flex-grow">
        {currentMode === "customer" ? (
          /* ================= CUSTOMER VIEWPORT ================= */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Elegant Hero Visual Section with Trending Slideshow */}
            <Hero
              brandName={brandName}
              theme={theme}
              products={products}
              currencySymbol={currencySymbol}
              onSelectProduct={(product) => setSelectedProduct(product)}
            />

            {/* Catalog Filter controls */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
                isDark ? "border-zinc-900" : "border-zinc-200/60"
              }`}>
                <div>
                  <h2 className={`font-display font-bold text-2xl ${isDark ? "text-white" : "text-zinc-900"}`}>Sourced Blank Streetwear</h2>
                  <p className="text-zinc-500 text-xs mt-1">Select from our direct-imported heavyweight t-shirt batch drops.</p>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Filter Button */}
                  <button
                    type="button"
                    onClick={() => setIsFilterModalOpen(true)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 shadow-xs cursor-pointer ${
                      (selectedCategory !== "All" || minPriceFilter > catalogMinPrice || maxPriceFilter < catalogMaxPrice)
                        ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 border-emerald-400 shadow-emerald-500/10"
                        : isDark
                        ? "bg-zinc-900 hover:bg-zinc-850 text-white border-zinc-800"
                        : "bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-200"
                    }`}
                    id="open-filter-btn"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Filter</span>
                    {(selectedCategory !== "All" || minPriceFilter > catalogMinPrice || maxPriceFilter < catalogMaxPrice) && (
                      <span className="w-5 h-5 rounded-full bg-zinc-950 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                        {(selectedCategory !== "All" ? 1 : 0) + (minPriceFilter > catalogMinPrice || maxPriceFilter < catalogMaxPrice ? 1 : 0)}
                      </span>
                    )}
                  </button>

                  {/* Live Search bar */}
                  <div className="relative max-w-xs w-full">
                    <input
                      type="text"
                      placeholder="Search styles, weights, fits..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full px-4 py-2 text-xs border rounded-xl outline-none focus:ring-1 transition-all font-medium ${
                        isDark 
                          ? "bg-zinc-900 border-zinc-800 text-white focus:border-zinc-600 focus:ring-zinc-600" 
                          : "bg-white border-zinc-200 text-zinc-950 focus:border-zinc-950 focus:ring-zinc-950"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Active Filter Pills Bar */}
              {(selectedCategory !== "All" || minPriceFilter > catalogMinPrice || maxPriceFilter < catalogMaxPrice) && (
                <div className="flex flex-wrap items-center gap-2 pt-1 pb-1 animate-in fade-in duration-200">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold mr-1">
                    Active Filters:
                  </span>

                  {selectedCategory !== "All" && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                      isDark ? "bg-zinc-900 border-zinc-800 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-800"
                    }`}>
                      <span>Category: {selectedCategory}</span>
                      <button
                        onClick={() => setSelectedCategory("All")}
                        className="p-0.5 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                        title="Remove category filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {(minPriceFilter > catalogMinPrice || maxPriceFilter < catalogMaxPrice) && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                      isDark ? "bg-zinc-900 border-zinc-800 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-800"
                    }`}>
                      <span>Price: {currencySymbol}{minPriceFilter.toLocaleString()} – {currencySymbol}{maxPriceFilter.toLocaleString()}</span>
                      <button
                        onClick={() => {
                          setMinPriceFilter(catalogMinPrice);
                          setMaxPriceFilter(catalogMaxPrice);
                        }}
                        className="p-0.5 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                        title="Remove price filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setMinPriceFilter(catalogMinPrice);
                      setMaxPriceFilter(catalogMaxPrice);
                    }}
                    className="text-xs text-zinc-400 hover:text-emerald-500 font-mono font-bold underline ml-2 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* Products Grid Gallery */}
              {filteredProducts.length === 0 ? (
                <div className={`text-center py-16 border rounded-3xl space-y-4 p-6 ${
                  isDark ? "bg-zinc-900 border-zinc-850" : "bg-white border-zinc-200/60"
                }`}>
                  <div className={`w-12 h-12 border rounded-full flex items-center justify-center mx-auto ${
                    isDark ? "bg-zinc-950 border-zinc-800 text-zinc-400" : "bg-zinc-50 border-zinc-150 text-zinc-400"
                  }`}>
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={`font-display font-bold text-sm ${isDark ? "text-white" : "text-zinc-800"}`}>No items match your price or search filters</h3>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto">
                      No t-shirts fit within {currencySymbol}{minPriceFilter.toLocaleString()} – {currencySymbol}{maxPriceFilter.toLocaleString()} for this search. Try adjusting the slider range or resetting filters.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                      setMinPriceFilter(catalogMinPrice);
                      setMaxPriceFilter(catalogMaxPrice);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-all shadow-sm"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      currencySymbol={currencySymbol}
                      onSelect={(product) => setSelectedProduct(product)}
                      onVisualizeWithAiStylist={(product, color) => handleOpenStylist(product, color)}
                      isWishlisted={wishlistProductIds.includes(p.id)}
                      onToggleWishlist={handleToggleWishlist}
                      theme={theme}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Testimonials Social Proof Section */}
            <Testimonials theme={theme} />

            {/* Floating AI Stylist Miniature Studio Launcher */}
            <div className="fixed bottom-6 left-6 z-40 animate-in slide-in-from-bottom-6 duration-300">
              <button
                type="button"
                onClick={() => handleOpenStylist()}
                className={`font-display font-bold text-xs py-3.5 px-5 rounded-full shadow-2xl flex items-center gap-2 ring-2 transition-transform active:scale-95 cursor-pointer ${
                  isDark
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-black ring-emerald-400/40 shadow-emerald-500/25"
                    : "bg-zinc-950 hover:bg-zinc-800 text-white ring-zinc-900 shadow-xl"
                }`}
                id="floating-ai-stylist-trigger-btn"
                title="Open AI Stylist Virtual Miniature Try-On Studio"
              >
                <Sparkles className="w-4 h-4 fill-zinc-950 text-zinc-950 animate-pulse" />
                <span>AI Stylist (Try-On)</span>
              </button>
            </div>

            {/* Float Cart indicator (Mobile checkout trigger helper) */}
            {cartTotalCount > 0 && (
              <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-6 duration-300">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className={`font-display font-bold text-xs py-3.5 px-6 rounded-full shadow-xl flex items-center gap-2 ring-4 transition-transform active:scale-95 ${
                    isDark 
                      ? "bg-white hover:bg-zinc-200 text-zinc-950 ring-zinc-900" 
                      : "bg-zinc-950 hover:bg-zinc-800 text-white ring-white"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  View Custom Order ({cartTotalCount})
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : isAdminAuthenticated ? (
          /* ================= MERCHANT HUB VIEWPORT (ADMIN ONLY) ================= */
          <div className="animate-in fade-in duration-300">
            <MerchantPortal
                products={products}
                orders={orders}
                calculator={calculator}
                brandPartners={brandPartners}
                onUpdateBrandPartners={(updated) => setBrandPartners(updated)}
                currencySymbol={currencySymbol}
                brandName={brandName}
                merchantWhatsApp={merchantWhatsApp}
                onUpdateProducts={(updated) => setProducts(updated)}
                onUpdateOrders={(updated) => setOrders(updated)}
                onUpdateCalculator={handleUpdateCalculator}
                onUpdateBrandConfig={handleUpdateBrandConfig}
                theme={theme}
              />
          </div>
        ) : null}
      </main>

      {/* Main Responsive Footer */}
      <Footer
        brandName={brandName}
        merchantWhatsApp={merchantWhatsApp}
        theme={theme}
        onOpenAccountModal={() => {
          if (currentUser) {
            setIsAccountOpen(true);
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        onOpenMerchantPortal={() => handleModeChange("merchant")}
      />

      {/* SINGLE UNIFIED LOGIN / SIGN UP MODAL (CUSTOMER DEFAULT + ADMIN TOGGLE) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthModalCheckoutContext(null);
        }}
        onCustomerLogin={handleCustomerLogin}
        onAdminLogin={handleAdminSuccess}
        theme={theme}
        brandName={brandName}
        initialRole="customer"
        initialCustomerMode={authModalInitialMode}
        checkoutContext={authModalCheckoutContext}
      />

      <ProductDetailModal
        product={selectedProduct}
        currencySymbol={currencySymbol}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onVisualizeWithAiStylist={(product, color) => handleOpenStylist(product, color)}
        theme={theme}
        isPriceAlertSubscribed={selectedProduct ? priceAlertProductIds.includes(selectedProduct.id) : false}
        onTogglePriceAlert={handleTogglePriceAlert}
        onSimulatePriceDrop={handleSimulatePriceDrop}
      />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        currencySymbol={currencySymbol}
        merchantWhatsApp={merchantWhatsApp}
        onSubmitOrder={handleOrderSubmitted}
        theme={theme}
        currentUser={currentUser}
        onOpenAccountModal={() => {
          if (currentUser) {
            setIsAccountOpen(true);
          } else {
            setAuthModalInitialMode("signin");
            setAuthModalCheckoutContext(null);
            setIsAuthModalOpen(true);
          }
        }}
        onOpenAuthModal={(mode) => {
          const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
          setAuthModalInitialMode(mode);
          setAuthModalCheckoutContext({
            itemCount: cartTotalCount,
            totalAmount: subtotal,
            currencySymbol: currencySymbol,
          });
          setIsAuthModalOpen(true);
        }}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        minPrice={minPriceFilter}
        maxPrice={maxPriceFilter}
        catalogMinPrice={catalogMinPrice}
        catalogMaxPrice={catalogMaxPrice}
        onChangeMinPrice={setMinPriceFilter}
        onChangeMaxPrice={setMaxPriceFilter}
        onResetFilters={() => {
          setSelectedCategory("All");
          setMinPriceFilter(catalogMinPrice);
          setMaxPriceFilter(catalogMaxPrice);
        }}
        currencySymbol={currencySymbol}
        theme={theme}
        productCount={filteredProducts.length}
        totalProductCount={products.length}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        currentUser={currentUser}
        onLogin={(user) => handleCustomerLogin(user)}
        onLogout={() => {
          setCurrentUser(null);
          setNotifications((prev) => [
            {
              id: `notif_${Date.now()}`,
              title: "👋 Signed Out",
              body: "You have signed out of your customer account.",
              timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            },
            ...prev,
          ]);
        }}
        onUpdateUser={(updated) => setCurrentUser(updated)}
        userOrders={orders}
        currencySymbol={currencySymbol}
        merchantWhatsApp={merchantWhatsApp}
        theme={theme}
        wishlistProductIds={wishlistProductIds}
        allProducts={products}
        onToggleWishlist={handleToggleWishlist}
        onSelectProduct={(product) => setSelectedProduct(product)}
        onCancelOrder={handleCancelOrder}
        onAdminLogin={() => setIsAuthModalOpen(true)}
        brandName={brandName}
      />

      {/* Push Notification Simulator */}
      <PushNotificationCenter
        notifications={notifications}
        onDismiss={handleDismissNotification}
        onRestock={handleQuickRestock}
        onView={handleViewProductStock}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        permissionStatus={permissionStatus}
        onRequestPermission={handleRequestNotificationPermission}
      />

      {/* AI Stylist & Miniature Virtual Try-On Studio */}
      <AiStylistModal
        isOpen={isStylistOpen}
        onClose={() => setIsStylistOpen(false)}
        products={products}
        selectedProduct={stylistTargetProduct}
        onSelectProduct={(p) => setStylistTargetProduct(p)}
        onAddToCart={handleAddToCart}
        theme={theme}
        currencySymbol={currencySymbol}
        brandName={brandName}
        initialColor={stylistTargetColor}
      />

      {/* Gemini AI Streetwear Stylist Chatbot (Legacy compatibility) */}
      <GeminiChatbot
        theme={theme}
        brandName={brandName}
        isOpenExternal={isChatbotOpen}
        onCloseExternal={() => setIsChatbotOpen(false)}
      />
    </div>
  );
}
