import React, { useState, useMemo } from "react";
import { 
  DollarSign, Package, TrendingUp, Sliders, List, CircleDollarSign, 
  Plus, Edit2, Trash2, Check, RefreshCw, Smartphone, Percent, 
  ShoppingBag, CheckCircle, Clock, XCircle, ChevronRight, Save, Play, History, AlertCircle,
  ChevronDown, ChevronUp, BarChart3, ShieldCheck, Lock, Building2, Store, Truck, Send, 
  Copy, ArrowUpRight, ArrowDownRight, Zap, Flame, Award, Filter, Search, Calendar, 
  Phone, Mail, MapPin, ExternalLink, Info, CheckCheck, ArrowRight, User, Layers, Tag,
  Eye, CheckSquare, Sparkles, MessageCircle, X
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { Product, Order, ResellerCalculator, BrandPartner, OrderItem } from "../types";
import { CATEGORIES, getProductColorImage } from "../data";
import OrderHistory from "./OrderHistory";

interface MerchantPortalProps {
  products: Product[];
  orders: Order[];
  calculator: ResellerCalculator;
  brandPartners: BrandPartner[];
  currencySymbol: string;
  brandName: string;
  merchantWhatsApp: string;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateOrders: (orders: Order[]) => void;
  onUpdateCalculator: (calc: ResellerCalculator) => void;
  onUpdateBrandPartners: (partners: BrandPartner[]) => void;
  onUpdateBrandConfig: (brandName: string, whatsapp: string) => void;
  theme: "dark" | "light";
}

// Combined navigation tabs
type SubTab = "catalogue" | "orders" | "analytics" | "calculator" | "history" | "settings";

// Common standard sizes for streetwear
const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

// Default color palette presets
const PRESET_COLORS = [
  { name: "Pitch Black", hex: "#121212" },
  { name: "Cream White", hex: "#F5F2EB" },
  { name: "Mineral Grey", hex: "#3A3E41" },
  { name: "Vintage Sage", hex: "#7E8F7C" },
  { name: "Slate Blue", hex: "#5C6B73" },
  { name: "Terracotta Rust", hex: "#A34A38" },
  { name: "Olive Drab", hex: "#4B5320" },
  { name: "Oatmeal Melange", hex: "#D6CFC7" },
];

export default function MerchantPortal({
  products,
  orders,
  calculator,
  brandPartners,
  currencySymbol,
  brandName,
  merchantWhatsApp,
  onUpdateProducts,
  onUpdateOrders,
  onUpdateCalculator,
  onUpdateBrandPartners,
  onUpdateBrandConfig,
  theme,
}: MerchantPortalProps) {
  // Default to the combined Brand & Product Catalogue page
  const [activeTab, setActiveTab] = useState<SubTab>("catalogue");
  const isDark = theme === "dark";

  // Catalogue sub-views: "articles" (Unified Catalogue Matrix) or "brands" (Grouped by Partner Shop)
  const [catalogueView, setCatalogueView] = useState<"articles" | "shops">("articles");
  const [catalogueSearch, setCatalogueSearch] = useState("");
  const [catalogueCategoryFilter, setCatalogueCategoryFilter] = useState("All");
  const [catalogueBrandFilter, setCatalogueBrandFilter] = useState("All");

  // Dynamic color selection per catalogue card
  const [cardSelectedColors, setCardSelectedColors] = useState<Record<string, string>>({});

  // Date Filter for Revenue Analytics (7D, 14D, 30D, all)
  const [analyticsDateRange, setAnalyticsDateRange] = useState<"7d" | "14d" | "30d" | "all">("14d");

  // Local state for calculator & brand settings
  const [localCalc, setLocalCalc] = useState<ResellerCalculator>({ ...calculator });
  const [editingBrand, setEditingBrand] = useState(brandName);
  const [editingWhatsApp, setEditingWhatsApp] = useState(merchantWhatsApp);

  // Orders Search & Status Filter
  const [ordersSearch, setOrdersSearch] = useState("");
  const [ordersStatusFilter, setOrdersStatusFilter] = useState<string>("all");

  // Sourcing WhatsApp / PO Modal State
  const [isSourcingModalOpen, setIsSourcingModalOpen] = useState(false);
  const [sourcingTargetProduct, setSourcingTargetProduct] = useState<Product | null>(null);
  const [sourcingTargetBrand, setSourcingTargetBrand] = useState<BrandPartner | null>(null);
  const [sourcingSelectedSize, setSourcingSelectedSize] = useState("L");
  const [sourcingSelectedColor, setSourcingSelectedColor] = useState("");
  const [sourcingQuantity, setSourcingQuantity] = useState(1);
  const [sourcingCustomerNote, setSourcingCustomerNote] = useState("");
  const [copiedSourcingText, setCopiedSourcingText] = useState(false);

  // Unified "Add / Edit Article Catalogue" Modal State
  const [isCatalogueModalOpen, setIsCatalogueModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields for Article Catalogue & Brand details
  const [formIsNewBrand, setFormIsNewBrand] = useState(false);
  const [formSelectedBrandId, setFormSelectedBrandId] = useState(brandPartners[0]?.id || "");
  const [formBrandName, setFormBrandName] = useState("");
  const [formBrandShopName, setFormBrandShopName] = useState("");
  const [formBrandContact, setFormBrandContact] = useState("");
  const [formBrandPhone, setFormBrandPhone] = useState("+91 ");
  const [formBrandWhatsapp, setFormBrandWhatsapp] = useState("+91 ");
  const [formBrandEmail, setFormBrandEmail] = useState("");
  const [formBrandLocation, setFormBrandLocation] = useState("");
  const [formBrandLeadTime, setFormBrandLeadTime] = useState(2);

  // Article Specifications
  const [formArtName, setFormArtName] = useState("");
  const [formArtCategory, setFormArtCategory] = useState("Oversized Printed");
  const [formArtSku, setFormArtSku] = useState("");
  const [formArtDesc, setFormArtDesc] = useState("");
  const [formArtImage, setFormArtImage] = useState("https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800");
  const [formArtBasePrice, setFormArtBasePrice] = useState(650); // Wholesale cost from brand
  const [formArtPrice, setFormArtPrice] = useState(1590); // Retail price for customer
  const [formIsFeatured, setFormIsFeatured] = useState<boolean>(false); // Storefront Hero Slideshow toggle

  // Toggle article featured status in Storefront Hero Slideshow
  const handleToggleFeaturedArticle = (productId: string) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        return { ...p, isFeatured: !p.isFeatured };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  // Sizes Available in Form (Multi-Select)
  const [formSelectedSizes, setFormSelectedSizes] = useState<string[]>(["S", "M", "L", "XL", "XXL"]);
  const [customSizeInput, setCustomSizeInput] = useState("");

  // Colors Available in Form
  const [formColors, setFormColors] = useState<{ name: string; hex: string }[]>([
    { name: "Pitch Black", hex: "#121212" },
    { name: "Cream White", hex: "#F5F2EB" }
  ]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#3A3E41");

  // Helper to open the Sourcing Modal for an article
  const handleOpenSourcingModal = (product: Product, orderDetails?: { size: string; color: string; qty: number; customerName: string; orderId: string }) => {
    setSourcingTargetProduct(product);
    const matchedBrand = brandPartners.find((b) => b.id === product.brandId) || {
      id: product.brandId || "brand_partner",
      name: product.brandName || "Collaborating Brand Partner",
      shopName: product.brandShopName || product.brandName || "Shop Partner",
      contactPerson: product.brandContactPerson || "Shop Owner / Sourcing Contact",
      phone: product.brandPhone || "+91 98765 43210",
      whatsapp: product.brandWhatsapp || product.brandPhone || "+91 98765 43210",
      email: product.brandEmail || "orders@brandpartner.in",
      location: product.brandLocation || "Tirupur / Mumbai",
      leadTimeDays: 2,
      minimumOrderQty: 1,
    };
    setSourcingTargetBrand(matchedBrand);

    if (orderDetails) {
      setSourcingSelectedSize(orderDetails.size);
      setSourcingSelectedColor(orderDetails.color);
      setSourcingQuantity(orderDetails.qty);
      setSourcingCustomerNote(`Customer: ${orderDetails.customerName} (Order #${orderDetails.orderId})`);
    } else {
      setSourcingSelectedSize(product.sizes[0] || "L");
      setSourcingSelectedColor(product.colors[0]?.name || "Pitch Black");
      setSourcingQuantity(1);
      setSourcingCustomerNote("Customer Sourcing Requirement");
    }

    setCopiedSourcingText(false);
    setIsSourcingModalOpen(true);
  };

  // Helper to generate the exact WhatsApp on-demand sourcing text
  const generateSourcingWhatsAppText = (): string => {
    if (!sourcingTargetProduct || !sourcingTargetBrand) return "";
    const estDeliveryDate = new Date();
    estDeliveryDate.setDate(estDeliveryDate.getDate() + (sourcingTargetBrand.leadTimeDays || 2));

    return `*ON-DEMAND SOURCING ORDER — ${brandName.toUpperCase()}*
Hello ${sourcingTargetBrand.contactPerson} (${sourcingTargetBrand.name}),
A customer has just placed an order for your article on our storefront.

*Article Details to Source:*
• Article: *${sourcingTargetProduct.name}*
• SKU: ${sourcingTargetProduct.sku || "N/A"}
• Category: ${sourcingTargetProduct.category}
• Required Size: *${sourcingSelectedSize}*
• Required Color: *${sourcingSelectedColor}*
• Quantity: *${sourcingQuantity} piece(s)*
• Agreed Sourcing Cost: ${currencySymbol}${sourcingTargetProduct.basePrice} / unit
• Total Payable to ${sourcingTargetBrand.name}: *${currencySymbol}${(sourcingTargetProduct.basePrice * sourcingQuantity).toLocaleString()}*

*Fulfillment Request:*
• Order Reference: ${sourcingCustomerNote || "Direct Storefront Customer Order"}
• Target Handover Date: ${estDeliveryDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
• Hub Delivery: Please prepare this unit for our courier pickup / direct customer dispatch.

Please confirm that you have this size and color ready for handover. Thank you!`;
  };

  const handleSendSourcingWhatsApp = () => {
    if (!sourcingTargetBrand) return;
    const text = generateSourcingWhatsAppText();
    const cleanPhone = sourcingTargetBrand.whatsapp.replace(/[^0-9]/g, "");
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setIsSourcingModalOpen(false);
  };

  const handleCopySourcingText = () => {
    const text = generateSourcingWhatsAppText();
    navigator.clipboard.writeText(text);
    setCopiedSourcingText(true);
    setTimeout(() => setCopiedSourcingText(false), 2500);
  };

  // Open "Add Article Catalogue" Modal
  const handleOpenAddCatalogue = (productToEdit?: Product) => {
    if (productToEdit) {
      setEditingProduct(productToEdit);
      setFormIsNewBrand(false);
      setFormSelectedBrandId(productToEdit.brandId || brandPartners[0]?.id || "");
      
      const matchedBrand = brandPartners.find((b) => b.id === productToEdit.brandId);
      setFormBrandName(productToEdit.brandName || matchedBrand?.name || "");
      setFormBrandShopName(productToEdit.brandShopName || matchedBrand?.shopName || "");
      setFormBrandContact(productToEdit.brandContactPerson || matchedBrand?.contactPerson || "");
      setFormBrandPhone(productToEdit.brandPhone || matchedBrand?.phone || "+91 ");
      setFormBrandWhatsapp(productToEdit.brandWhatsapp || matchedBrand?.whatsapp || "+91 ");
      setFormBrandEmail(productToEdit.brandEmail || matchedBrand?.email || "");
      setFormBrandLocation(productToEdit.brandLocation || matchedBrand?.location || "");
      setFormBrandLeadTime(matchedBrand?.leadTimeDays || 2);

      setFormArtName(productToEdit.name);
      setFormArtCategory(productToEdit.category);
      setFormArtSku(productToEdit.sku || "");
      setFormArtDesc(productToEdit.description);
      setFormArtImage(productToEdit.images[0] || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800");
      setFormArtBasePrice(productToEdit.basePrice);
      setFormArtPrice(productToEdit.price);
      setFormSelectedSizes(productToEdit.sizes || ["S", "M", "L", "XL", "XXL"]);
      setFormColors(productToEdit.colors || [{ name: "Pitch Black", hex: "#121212" }]);
      setFormIsFeatured(productToEdit.isFeatured ?? false);
    } else {
      setEditingProduct(null);
      setFormIsNewBrand(false);
      const defaultBrand = brandPartners[0];
      setFormSelectedBrandId(defaultBrand?.id || "");
      setFormBrandName(defaultBrand?.name || "");
      setFormBrandShopName(defaultBrand?.shopName || "");
      setFormBrandContact(defaultBrand?.contactPerson || "");
      setFormBrandPhone(defaultBrand?.phone || "+91 ");
      setFormBrandWhatsapp(defaultBrand?.whatsapp || "+91 ");
      setFormBrandEmail(defaultBrand?.email || "");
      setFormBrandLocation(defaultBrand?.location || "");
      setFormBrandLeadTime(defaultBrand?.leadTimeDays || 2);

      setFormArtName("");
      setFormArtCategory("Oversized Printed");
      setFormArtSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
      setFormArtDesc("");
      setFormArtImage("https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800");
      setFormArtBasePrice(650);
      setFormArtPrice(1590);
      setFormSelectedSizes(["S", "M", "L", "XL", "XXL"]);
      setFormColors([
        { name: "Pitch Black", hex: "#121212" },
        { name: "Cream White", hex: "#F5F2EB" }
      ]);
      setFormIsFeatured(false);
    }
    setIsCatalogueModalOpen(true);
  };

  // Toggle size selection in form
  const handleToggleSize = (size: string) => {
    if (formSelectedSizes.includes(size)) {
      if (formSelectedSizes.length === 1) {
        alert("At least one size must remain selected for customer ordering.");
        return;
      }
      setFormSelectedSizes(formSelectedSizes.filter((s) => s !== size));
    } else {
      setFormSelectedSizes([...formSelectedSizes, size]);
    }
  };

  // Add custom size
  const handleAddCustomSize = () => {
    const trimmed = customSizeInput.trim().toUpperCase();
    if (trimmed && !formSelectedSizes.includes(trimmed)) {
      setFormSelectedSizes([...formSelectedSizes, trimmed]);
      setCustomSizeInput("");
    }
  };

  // Add color to article
  const handleAddColor = () => {
    const trimmed = newColorName.trim();
    if (!trimmed) {
      alert("Please enter a color label (e.g., 'Pitch Black', 'Mineral Grey').");
      return;
    }
    if (formColors.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      alert("This color label is already added.");
      return;
    }
    setFormColors([...formColors, { name: trimmed, hex: newColorHex }]);
    setNewColorName("");
  };

  // Remove color
  const handleRemoveColor = (colorName: string) => {
    if (formColors.length === 1) {
      alert("At least one color must be available.");
      return;
    }
    setFormColors(formColors.filter((c) => c.name !== colorName));
  };

  // Save Article Catalogue Entry
  const handleSaveCatalogueProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formArtName.trim() || !formArtDesc.trim()) {
      alert("Please enter the article title and fabric/sizing description.");
      return;
    }
    if (formSelectedSizes.length === 0) {
      alert("Please select at least one available size.");
      return;
    }
    if (formColors.length === 0) {
      alert("Please configure at least one available color.");
      return;
    }

    let finalBrandId = formSelectedBrandId;
    let finalBrandName = formBrandName;
    let finalShopName = formBrandShopName;
    let finalContact = formBrandContact;
    let finalPhone = formBrandPhone;
    let finalWhatsapp = formBrandWhatsapp;
    let finalEmail = formBrandEmail;
    let finalLocation = formBrandLocation;

    // If adding a new brand partner, register it in brandPartners
    if (formIsNewBrand) {
      if (!formBrandName.trim() || !formBrandContact.trim()) {
        alert("Please provide the Shop/Brand name and a contact person.");
        return;
      }
      finalBrandId = `brand_${Date.now()}`;
      finalBrandName = formBrandName.trim();
      finalShopName = formBrandShopName.trim() || formBrandName.trim();
      finalContact = formBrandContact.trim();
      finalPhone = formBrandPhone.trim();
      finalWhatsapp = formBrandWhatsapp.trim() || formBrandPhone.trim();
      finalEmail = formBrandEmail.trim();
      finalLocation = formBrandLocation.trim();

      const newBrand: BrandPartner = {
        id: finalBrandId,
        name: finalBrandName,
        shopName: finalShopName,
        contactPerson: finalContact,
        phone: finalPhone,
        whatsapp: finalWhatsapp,
        email: finalEmail,
        location: finalLocation,
        leadTimeDays: Number(formBrandLeadTime) || 2,
        minimumOrderQty: 1, // On-demand zero pre-stock!
        marginSplitPercent: Math.round(((formArtPrice - formArtBasePrice) / formArtPrice) * 100),
      };
      onUpdateBrandPartners([...brandPartners, newBrand]);
    } else {
      const existing = brandPartners.find((b) => b.id === formSelectedBrandId);
      if (existing) {
        finalBrandName = existing.name;
        finalShopName = existing.shopName || existing.name;
        finalContact = existing.contactPerson;
        finalPhone = existing.phone;
        finalWhatsapp = existing.whatsapp;
        finalEmail = existing.email;
        finalLocation = existing.location;
      }
    }

    if (editingProduct) {
      const updated = products.map((p) => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name: formArtName.trim(),
            category: formArtCategory,
            sku: formArtSku.trim() || p.sku,
            description: formArtDesc.trim(),
            basePrice: Number(formArtBasePrice),
            price: Number(formArtPrice),
            sizes: formSelectedSizes,
            colors: formColors,
            images: [formArtImage.trim() || p.images[0]],
            isAvailable: true,
            stockCount: 999, // On-demand available!
            brandId: finalBrandId,
            brandName: finalBrandName,
            brandShopName: finalShopName,
            brandContactPerson: finalContact,
            brandPhone: finalPhone,
            brandWhatsapp: finalWhatsapp,
            brandLocation: finalLocation,
            brandEmail: finalEmail,
            sourcingLeadTime: `${formBrandLeadTime} days on-demand`,
            isFeatured: formIsFeatured,
          };
        }
        return p;
      });
      onUpdateProducts(updated);
    } else {
      const newProduct: Product = {
        id: `prod_${Date.now()}`,
        name: formArtName.trim(),
        category: formArtCategory,
        sku: formArtSku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
        description: formArtDesc.trim(),
        basePrice: Number(formArtBasePrice),
        price: Number(formArtPrice),
        sizes: formSelectedSizes,
        colors: formColors,
        images: [formArtImage.trim() || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800"],
        isAvailable: true,
        stockCount: 999, // On-demand unlimited capacity
        brandId: finalBrandId,
        brandName: finalBrandName,
        brandShopName: finalShopName,
        brandContactPerson: finalContact,
        brandPhone: finalPhone,
        brandWhatsapp: finalWhatsapp,
        brandLocation: finalLocation,
        brandEmail: finalEmail,
        sourcingLeadTime: `${formBrandLeadTime} days on-demand`,
        isFeatured: formIsFeatured,
      };
      onUpdateProducts([newProduct, ...products]);
    }

    setIsCatalogueModalOpen(false);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Remove this article from the customer storefront?")) {
      onUpdateProducts(products.filter((p) => p.id !== productId));
    }
  };

  // Filtered Catalogue Products
  const filteredCatalogueProducts = useMemo(() => {
    return products.filter((p) => {
      const search = catalogueSearch.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(search) ||
        (p.sku && p.sku.toLowerCase().includes(search)) ||
        (p.brandName && p.brandName.toLowerCase().includes(search)) ||
        (p.brandShopName && p.brandShopName.toLowerCase().includes(search)) ||
        (p.brandLocation && p.brandLocation.toLowerCase().includes(search)) ||
        (p.brandContactPerson && p.brandContactPerson.toLowerCase().includes(search));

      const matchesCat = catalogueCategoryFilter === "All" || p.category === catalogueCategoryFilter;
      const matchesBrand = catalogueBrandFilter === "All" || p.brandId === catalogueBrandFilter;

      return matchesSearch && matchesCat && matchesBrand;
    });
  }, [products, catalogueSearch, catalogueCategoryFilter, catalogueBrandFilter]);

  // Orders Filtered
  const filteredCustomerOrders = useMemo(() => {
    return orders.filter((o) => {
      const search = ordersSearch.toLowerCase();
      const matchesSearch = 
        o.id.toLowerCase().includes(search) ||
        o.customerName.toLowerCase().includes(search) ||
        o.customerPhone.includes(search) ||
        o.items.some((item) => (item.brandName || "").toLowerCase().includes(search));

      const matchesStatus = ordersStatusFilter === "all" || o.status === ordersStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, ordersSearch, ordersStatusFilter]);

  const handleUpdateOrderStatus = (orderId: string, status: Order["status"]) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, status };
      }
      return o;
    });
    onUpdateOrders(updated);
  };

  // --- REVENUE & ANALYTICS COMPUTATIONS ---
  const nonCancelledOrders = useMemo(() => orders.filter((o) => o.status !== "cancelled"), [orders]);

  const brandLeaderboard = useMemo(() => {
    const stats: Record<string, {
      brandId: string;
      brandName: string;
      shopName: string;
      contactPerson: string;
      phone: string;
      whatsapp: string;
      location: string;
      articlesCount: number;
      revenue: number;
      unitsSold: number;
      profitEst: number;
    }> = {};

    brandPartners.forEach((bp) => {
      const linked = products.filter((p) => p.brandId === bp.id);
      stats[bp.id] = {
        brandId: bp.id,
        brandName: bp.name,
        shopName: bp.shopName || bp.name,
        contactPerson: bp.contactPerson,
        phone: bp.phone,
        whatsapp: bp.whatsapp,
        location: bp.location,
        articlesCount: linked.length,
        revenue: 0,
        unitsSold: 0,
        profitEst: 0,
      };
    });

    nonCancelledOrders.forEach((o) => {
      o.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const bId = item.brandId || prod?.brandId;
        if (bId && stats[bId]) {
          const qty = item.quantity || 1;
          const rev = item.price * qty;
          const baseCost = prod?.basePrice || item.price * 0.45;
          stats[bId].revenue += rev;
          stats[bId].unitsSold += qty;
          stats[bId].profitEst += (item.price - baseCost) * qty;
        }
      });
    });

    const totalRev = Object.values(stats).reduce((sum, b) => sum + b.revenue, 0) || 1;

    return Object.values(stats)
      .map((b) => ({
        ...b,
        sharePct: Math.round((b.revenue / totalRev) * 100),
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [brandPartners, products, nonCancelledOrders]);

  const topBrandWinner = brandLeaderboard[0] || null;

  // Daily revenue chart breakdown
  const dailyBreakdown = useMemo(() => {
    const map: Record<string, { dateKey: string; dateObj: Date; revenue: number; orderCount: number; unitsSold: number; topBrand: string }> = {};

    nonCancelledOrders.forEach((o) => {
      const datePart = o.createdAt.split(",")[0].trim().replace(/-/g, " ");
      const parsed = new Date(datePart);
      const dateObj = isNaN(parsed.getTime()) ? new Date() : parsed;
      const dateKey = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      if (!map[dateKey]) {
        map[dateKey] = { dateKey, dateObj, revenue: 0, orderCount: 0, unitsSold: 0, topBrand: "" };
      }
      map[dateKey].revenue += o.totalAmount;
      map[dateKey].orderCount += 1;
      o.items.forEach((item) => {
        map[dateKey].unitsSold += item.quantity || 1;
        if (!map[dateKey].topBrand && item.brandName) {
          map[dateKey].topBrand = item.brandName;
        }
      });
    });

    return Object.values(map).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [nonCancelledOrders]);

  const totalPeriodRevenue = nonCancelledOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Admin Hub Header Bar */}
      <div className={`p-6 rounded-3xl border shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? "bg-zinc-900/90 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <ShieldCheck className="w-3.5 h-3.5" /> Multi-Brand Admin Portal
            </span>
            <span className="font-mono text-xs text-zinc-500">|</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              Zero Pre-Stock • On-Demand Sourcing Model
            </span>
          </div>
          <h2 className="font-display font-bold text-2xl tracking-tight flex items-center gap-2">
            <span>{brandName} Reseller Command Center</span>
          </h2>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Storefront articles are sourced on-demand from collaborating brands. When a customer places an order, source the exact size & color from the brand owner via WhatsApp and deliver to the buyer.
          </p>
        </div>

        {/* Quick Hub Action CTAs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleOpenAddCatalogue()}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-zinc-950 transition-all flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer font-display"
            id="create-new-catalogue-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Add Article & Brand to Catalogue</span>
          </button>
        </div>
      </div>

      {/* Primary Sub-Tabs Navigation */}
      <div className={`flex border-b overflow-x-auto gap-2 sm:gap-4 no-scrollbar ${isDark ? "border-zinc-800" : "border-zinc-200"}`}>
        <button
          onClick={() => setActiveTab("catalogue")}
          className={`pb-3 px-2 text-xs font-bold font-display flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "catalogue"
              ? isDark ? "border-amber-400 text-amber-400 font-extrabold" : "border-zinc-950 text-zinc-950 font-extrabold"
              : isDark ? "border-transparent text-zinc-400 hover:text-zinc-200" : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
          id="tab-brands-product-catalogue"
        >
          <Layers className="w-4 h-4" />
          <span>Brand Collaboration & Product Catalogue ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 px-2 text-xs font-bold font-display flex items-center gap-2 border-b-2 transition-all relative whitespace-nowrap cursor-pointer ${
            activeTab === "orders"
              ? isDark ? "border-amber-400 text-amber-400 font-extrabold" : "border-zinc-950 text-zinc-950 font-extrabold"
              : isDark ? "border-transparent text-zinc-400 hover:text-zinc-200" : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
          id="tab-orders-placed"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders Placed & Brand Sourcing ({orders.length})</span>
          {orders.filter((o) => o.status === "pending").length > 0 && (
            <span className="bg-amber-500 text-zinc-950 font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse shrink-0">
              {orders.filter((o) => o.status === "pending").length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`pb-3 px-2 text-xs font-bold font-display flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "analytics"
              ? isDark ? "border-amber-400 text-amber-400 font-extrabold" : "border-zinc-950 text-zinc-950 font-extrabold"
              : isDark ? "border-transparent text-zinc-400 hover:text-zinc-200" : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
          id="tab-daily-revenue"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Daily Revenue Analysis</span>
        </button>

        <button
          onClick={() => setActiveTab("calculator")}
          className={`pb-3 px-2 text-xs font-bold font-display flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "calculator"
              ? isDark ? "border-amber-400 text-amber-400 font-extrabold" : "border-zinc-950 text-zinc-950 font-extrabold"
              : isDark ? "border-transparent text-zinc-400 hover:text-zinc-200" : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
          id="tab-calculator"
        >
          <CircleDollarSign className="w-4 h-4" />
          <span>Profit Planner</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 px-2 text-xs font-bold font-display flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "history"
              ? isDark ? "border-amber-400 text-amber-400 font-extrabold" : "border-zinc-950 text-zinc-950 font-extrabold"
              : isDark ? "border-transparent text-zinc-400 hover:text-zinc-200" : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
          id="tab-history"
        >
          <History className="w-4 h-4" />
          <span>Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-3 px-2 text-xs font-bold font-display flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "settings"
              ? isDark ? "border-amber-400 text-amber-400 font-extrabold" : "border-zinc-950 text-zinc-950 font-extrabold"
              : isDark ? "border-transparent text-zinc-400 hover:text-zinc-200" : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
          id="tab-settings"
        >
          <Sliders className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* COMBINED TAB: BRAND COLLABORATION & PRODUCT CATALOGUE (UNIFIED PAGE) */}
      {/* ========================================================================= */}
      {activeTab === "catalogue" && (
        <div className="space-y-6 animate-in fade-in duration-200" id="unified-brand-catalogue-page">
          {/* Visual Operational Flow Banner (Zero Pre-Stock Model) */}
          <div className={`p-5 rounded-3xl border ${
            isDark ? "bg-amber-950/20 border-amber-500/30 text-amber-100" : "bg-amber-50 border-amber-200 text-amber-950"
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5" /> Just-In-Time (JIT) Sourcing Architecture
                </span>
                <h3 className="font-display font-bold text-lg text-white">
                  Zero Pre-Stock Operations: How the Platform Sells
                </h3>
                <p className="text-xs text-zinc-300 font-mono leading-relaxed max-w-3xl">
                  We don't buy or store bulk pre-stock inventory. Products from collaborating brands & boutique workshops are showcased here. When a customer orders, 1-click message the brand owner on WhatsApp with the requested size & color, receive the tee, and dispatch it to the customer.
                </p>
              </div>

              {/* Step Flow Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] font-mono shrink-0">
                <div className="p-2.5 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                  <span className="text-amber-400 font-bold block text-sm">Step 1</span>
                  <span className="text-zinc-300">Customer Buys on Storefront</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                  <span className="text-amber-400 font-bold block text-sm">Step 2</span>
                  <span className="text-zinc-300">Order Received with Size/Color</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                  <span className="text-amber-400 font-bold block text-sm">Step 3</span>
                  <span className="text-zinc-300">1-Click WhatsApp Brand Owner</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                  <span className="text-emerald-400 font-bold block text-sm">Step 4</span>
                  <span className="text-zinc-300">Deliver Sourced Tee to Buyer</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar for Catalogue */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border ${isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"}`}>
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Active Catalogue Designs</span>
              <span className="font-display font-black text-2xl text-white block mt-1">{products.length} articles</span>
              <span className="text-[10px] text-zinc-400 font-mono">Ready for customer ordering</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"}`}>
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Collaborating Brand Shops</span>
              <span className="font-display font-black text-2xl text-amber-400 block mt-1">{brandPartners.length} partners</span>
              <span className="text-[10px] text-zinc-400 font-mono">Bandra, Tirupur, Bengaluru, Delhi</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"}`}>
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Avg. Reseller Margin</span>
              <span className="font-display font-black text-2xl text-emerald-400 block mt-1">
                {products.length > 0
                  ? `${Math.round(products.reduce((acc, p) => acc + ((p.price - p.basePrice) / p.price) * 100, 0) / products.length)}%`
                  : "58%"}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Zero inventory capital risk</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"}`}>
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Average Sourcing Lead Time</span>
              <span className="font-display font-black text-2xl text-white block mt-1">2-3 days</span>
              <span className="text-[10px] text-zinc-400 font-mono">From brand workshop to hub</span>
            </div>
          </div>

          {/* Storefront Hero Slideshow Selection & Showcase Manager */}
          <div className={`p-5 rounded-3xl border transition-all ${
            isDark ? "bg-zinc-900/90 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-amber-400 text-zinc-950">
                    <Flame className="w-3.5 h-3.5 fill-zinc-950" /> Storefront Hero Showcase
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {products.filter((p) => p.isFeatured).length} Articles Active in Slideshow
                  </span>
                </div>
                <h3 className="font-display font-bold text-base sm:text-lg text-white">
                  Trending &amp; Latest Collection Slideshow Manager
                </h3>
                <p className="text-xs text-zinc-400 max-w-2xl font-sans">
                  Articles selected here appear in the interactive right-hand slideshow on the Storefront hero. When customers click any slide or the &ldquo;View Article&rdquo; button, it takes them directly to that respective article to customize fit and order.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const anyFeatured = products.some((p) => p.isFeatured);
                    const updated = products.map((p, idx) => ({
                      ...p,
                      isFeatured: anyFeatured ? false : idx < 4,
                    }));
                    onUpdateProducts(updated);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all cursor-pointer"
                >
                  {products.some((p) => p.isFeatured) ? "Clear All Featured" : "Reset Top 4 Featured"}
                </button>
              </div>
            </div>

            {/* Currently Featured Articles Strip */}
            <div className="pt-4">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block mb-3">
                Live Slideshow Sequence on Storefront:
              </span>

              {products.filter((p) => p.isFeatured).length === 0 ? (
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-dashed border-zinc-800 text-center space-y-2">
                  <p className="text-xs text-zinc-400">
                    No articles currently selected for the Hero Slideshow. (Default top 4 articles will be shown as fallback).
                  </p>
                  <p className="text-[11px] text-amber-400 font-mono">
                    Click &ldquo;Feature in Hero&rdquo; on any article below to add it to the storefront slideshow.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {products.filter((p) => p.isFeatured).map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-zinc-950/80 border border-amber-500/30 flex items-center justify-between gap-3 group relative overflow-hidden"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-zinc-950 font-mono text-[10px] font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                          <img
                            src={getProductColorImage(item) || item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-display font-bold text-xs text-white truncate">{item.name}</h5>
                          <span className="text-[10px] font-mono text-amber-400 block font-bold">
                            {currencySymbol}{item.price} &bull; {item.category}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleFeaturedArticle(item.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                        title="Remove from Hero Slideshow"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Unified Filter, Search & View Controls */}
          <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
            isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-zinc-200"
          }`}>
            <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
              {/* View switch: Article Matrix vs Partner Shops */}
              <div className="inline-flex rounded-xl p-1 bg-zinc-950/60 border border-zinc-800">
                <button
                  onClick={() => setCatalogueView("articles")}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    catalogueView === "articles" ? "bg-amber-400 text-zinc-950 font-bold shadow-sm" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Articles & Sourcing Matrix</span>
                </button>
                <button
                  onClick={() => setCatalogueView("shops")}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    catalogueView === "shops" ? "bg-amber-400 text-zinc-950 font-bold shadow-sm" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Partner Shops Directory ({brandPartners.length})</span>
                </button>
              </div>

              {/* Category Filter */}
              <select
                value={catalogueCategoryFilter}
                onChange={(e) => setCatalogueCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-white outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Brand Filter */}
              <select
                value={catalogueBrandFilter}
                onChange={(e) => setCatalogueBrandFilter(e.target.value)}
                className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-white outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="All">All Partner Brands ({brandPartners.length})</option>
                {brandPartners.map((bp) => (
                  <option key={bp.id} value={bp.id}>{bp.name} ({bp.shopName})</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={catalogueSearch}
                  onChange={(e) => setCatalogueSearch(e.target.value)}
                  placeholder="Search article, brand, contact, SKU..."
                  className="w-full pl-9 pr-3 py-1.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-xs font-mono text-white placeholder-zinc-500 focus:border-amber-400 outline-none"
                />
              </div>

              <button
                onClick={() => handleOpenAddCatalogue()}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-zinc-950 font-display transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Article</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: ARTICLES & SOURCING MATRIX */}
          {catalogueView === "articles" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCatalogueProducts.map((p) => {
                  const matchedBrand = brandPartners.find((b) => b.id === p.brandId);
                  const bName = p.brandName || matchedBrand?.name || "Independent Workshop";
                  const bShop = p.brandShopName || matchedBrand?.shopName || bName;
                  const bContact = p.brandContactPerson || matchedBrand?.contactPerson || "Shop Owner";
                  const bPhone = p.brandPhone || matchedBrand?.phone || "+91 98765 43210";
                  const bWhatsapp = p.brandWhatsapp || matchedBrand?.whatsapp || bPhone;
                  const bLoc = p.brandLocation || matchedBrand?.location || "India";
                  const marginAmt = p.price - p.basePrice;
                  const marginPct = p.price > 0 ? Math.round((marginAmt / p.price) * 100) : 0;

                  return (
                    <div
                      key={p.id}
                      className={`rounded-3xl border overflow-hidden flex flex-col justify-between transition-all ${
                        isDark ? "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700" : "bg-white border-zinc-200 shadow-sm hover:border-zinc-300"
                      }`}
                    >
                      {(() => {
                        const activeColor = cardSelectedColors[p.id] || p.colors[0]?.name || "";
                        const activeImg = getProductColorImage(p, activeColor);

                        return (
                          <div>
                            {/* Image & Category Overlay */}
                            <div className="relative aspect-video bg-zinc-950 overflow-hidden">
                              <img
                                src={activeImg}
                                alt={`${p.name} in ${activeColor}`}
                                className="w-full h-full object-cover transition-all duration-300"
                              />
                              <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-950/80 text-white backdrop-blur-md border border-zinc-800">
                                  {p.category}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-zinc-950">
                                  {bName}
                                </span>
                              </div>

                              {/* Hero Slideshow Toggle Button */}
                              <div className="absolute top-3 right-3 z-10">
                                <button
                                  type="button"
                                  onClick={() => handleToggleFeaturedArticle(p.id)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                                    p.isFeatured
                                      ? "bg-amber-400 text-zinc-950 font-black ring-2 ring-amber-400/50 shadow-amber-500/20"
                                      : "bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 hover:text-white"
                                  }`}
                                  title={p.isFeatured ? "Featured in Storefront Hero Slideshow (Click to remove)" : "Click to feature this article in Storefront Hero Slideshow"}
                                >
                                  <Flame className={`w-3.5 h-3.5 ${p.isFeatured ? "fill-zinc-950 text-zinc-950" : "text-amber-400"}`} />
                                  <span>{p.isFeatured ? "★ In Hero Slideshow" : "☆ Feature in Hero"}</span>
                                </button>
                              </div>
                              <div className="absolute bottom-3 left-3">
                                {activeColor && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-950/90 text-amber-300 border border-zinc-700">
                                    Colour: {activeColor}
                                  </span>
                                )}
                              </div>
                              <div className="absolute bottom-3 right-3">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500 text-white">
                                  On-Demand
                                </span>
                              </div>
                            </div>

                            {/* Article Info */}
                            <div className="p-5 space-y-4">
                              <div>
                                <h4 className="font-display font-bold text-lg text-white leading-snug">{p.name}</h4>
                                <span className="text-[10px] font-mono text-zinc-400">SKU: {p.sku || "N/A"}</span>
                              </div>

                              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                                {p.description}
                              </p>

                              {/* Sourcing Partner & Contact Box */}
                              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs font-mono space-y-1.5">
                                <div className="flex items-center justify-between text-amber-400 font-bold">
                                  <span className="flex items-center gap-1.5">
                                    <Store className="w-3.5 h-3.5" />
                                    {bName}
                                  </span>
                                  <span className="text-[10px] text-zinc-400">{bLoc}</span>
                                </div>
                                <div className="text-[11px] text-zinc-300 flex items-center justify-between">
                                  <span>Contact: <strong className="text-white">{bContact}</strong></span>
                                  <span className="text-zinc-400">{bPhone}</span>
                                </div>
                              </div>

                              {/* Sizes Available */}
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                                  Sizes Available from Brand:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {p.sizes.map((sz) => (
                                    <span
                                      key={sz}
                                      className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-zinc-800 text-zinc-200 border border-zinc-700"
                                    >
                                      {sz}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Colors Available (Interactive Click-to-Switch Article Image) */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-[10px] font-mono">
                                  <span className="uppercase text-zinc-400 font-bold">
                                    Colours (Click to Preview):
                                  </span>
                                  <span className="text-amber-400 font-bold">
                                    {activeColor}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {p.colors.map((c, i) => {
                                    const isSelected = activeColor.toLowerCase() === c.name.toLowerCase();
                                    return (
                                      <button
                                        key={i}
                                        type="button"
                                        onClick={() => setCardSelectedColors((prev) => ({ ...prev, [p.id]: c.name }))}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-mono transition-all cursor-pointer ${
                                          isSelected
                                            ? "bg-amber-400/20 text-amber-300 border border-amber-400/60 shadow-sm"
                                            : "bg-zinc-950/80 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                                        }`}
                                        title={`Switch article preview to ${c.name}`}
                                      >
                                        <span
                                          className={`w-2.5 h-2.5 rounded-full border ${
                                            isSelected ? "ring-2 ring-amber-400 scale-110" : "border-white/20"
                                          }`}
                                          style={{ backgroundColor: c.hex }}
                                        />
                                        <span className={isSelected ? "font-bold text-white" : ""}>{c.name}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Sourcing Cost & Retail Price Grid */}
                              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-zinc-800">
                                <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                                  <span className="text-[9px] uppercase text-zinc-400 block font-bold">Wholesale Sourcing</span>
                                  <span className="text-zinc-200 font-bold">{currencySymbol}{p.basePrice}</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                                  <span className="text-[9px] uppercase text-zinc-400 block font-bold">Customer Retail Price</span>
                                  <span className="text-amber-400 font-bold">{currencySymbol}{p.price}</span>
                                  <span className="text-[9px] text-emerald-400 block">+{marginPct}% margin</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Card Action Footer */}
                      <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-zinc-800/60 mt-3 pt-3">
                        {/* 1-Click Source from Brand Trigger */}
                        <button
                          onClick={() => handleOpenSourcingModal(p)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-zinc-950 font-display transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 flex-1 justify-center"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Contact Brand / Source</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenAddCatalogue(p)}
                            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Edit Catalogue Entry & Brand Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Delete Article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 2: PARTNER SHOPS & WORKSHOPS DIRECTORY */}
          {catalogueView === "shops" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {brandPartners.map((bp) => {
                  const partnerArticles = products.filter((p) => p.brandId === bp.id);
                  return (
                    <div
                      key={bp.id}
                      className={`p-6 rounded-3xl border transition-all ${
                        isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-xl flex items-center justify-center shrink-0">
                            {bp.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-lg text-white">{bp.name}</h4>
                            <span className="text-xs text-zinc-400 font-mono">
                              {bp.shopName || bp.name} • {bp.location}
                            </span>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-zinc-800 text-amber-400 border border-zinc-700">
                          {partnerArticles.length} Designs Listed
                        </span>
                      </div>

                      {/* Contact & Terms Box */}
                      <div className="my-4 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs font-mono space-y-2 text-zinc-300">
                        <p className="flex items-center justify-between">
                          <span className="text-zinc-400">Workshop Owner / Contact:</span>
                          <strong className="text-white">{bp.contactPerson}</strong>
                        </p>
                        <p className="flex items-center justify-between">
                          <span className="text-zinc-400">WhatsApp / Phone:</span>
                          <span className="text-amber-400">{bp.whatsapp || bp.phone}</span>
                        </p>
                        <p className="flex items-center justify-between">
                          <span className="text-zinc-400">Shop / Mill Location:</span>
                          <span>{bp.location}</span>
                        </p>
                        <p className="flex items-center justify-between">
                          <span className="text-zinc-400">Sourcing Lead Time:</span>
                          <strong className="text-emerald-400">{bp.leadTimeDays || 2} business days</strong>
                        </p>
                        {bp.notes && (
                          <p className="text-[11px] text-zinc-400 italic pt-1 border-t border-zinc-800/80">
                            "{bp.notes}"
                          </p>
                        )}
                      </div>

                      {/* Articles supplied by this brand */}
                      <div className="space-y-2 mb-4">
                        <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                          Articles Sourced from this Workshop:
                        </span>
                        <div className="space-y-1.5">
                          {partnerArticles.length === 0 ? (
                            <p className="text-xs text-zinc-500 italic">No designs listed under this workshop yet.</p>
                          ) : (
                            partnerArticles.map((art) => (
                              <div
                                key={art.id}
                                className="p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-800 flex items-center justify-between text-xs font-mono"
                              >
                                <span className="font-bold text-white truncate max-w-[200px]">{art.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-zinc-400">Cost: {currencySymbol}{art.basePrice}</span>
                                  <button
                                    onClick={() => handleOpenSourcingModal(art)}
                                    className="text-[10px] text-amber-400 hover:underline cursor-pointer font-bold"
                                  >
                                    Source ➔
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
                        <a
                          href={`https://wa.me/${(bp.whatsapp || bp.phone).replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all flex items-center gap-1.5"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>WhatsApp Brand Owner</span>
                        </a>

                        <button
                          onClick={() => {
                            setFormIsNewBrand(false);
                            setFormSelectedBrandId(bp.id);
                            handleOpenAddCatalogue();
                          }}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-zinc-950 font-display transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Article under {bp.name}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ORDERS PLACED & BRAND SOURCING */}
      {/* ========================================================================= */}
      {activeTab === "orders" && (
        <div className="space-y-6 animate-in fade-in duration-200" id="orders-placed-panel">
          {/* Orders Header & Search Bar */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-zinc-200"
          }`}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono uppercase text-zinc-400 font-bold mr-1">Fulfillment Status:</span>
              {["all", "pending", "confirmed", "processing", "shipped", "completed", "cancelled"].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrdersStatusFilter(st)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg capitalize transition-all cursor-pointer ${
                    ordersStatusFilter === st
                      ? "bg-amber-400 text-zinc-950 font-bold shadow-sm"
                      : "bg-zinc-800/60 text-zinc-400 hover:text-white border border-zinc-800"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={ordersSearch}
                onChange={(e) => setOrdersSearch(e.target.value)}
                placeholder="Search order ID, customer, brand..."
                className="pl-9 pr-3 py-1.5 bg-zinc-950/40 border border-zinc-800 rounded-xl text-xs font-mono text-white placeholder-zinc-500 focus:border-amber-400 outline-none w-64"
              />
            </div>
          </div>

          {/* Orders List with Direct 1-Click WhatsApp Sourcing from Brand */}
          <div className="space-y-4">
            {filteredCustomerOrders.length === 0 ? (
              <div className={`p-12 text-center rounded-3xl border ${isDark ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200"}`}>
                <ShoppingBag className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <h4 className="font-display font-bold text-lg text-white">No Orders Found</h4>
                <p className="text-xs text-zinc-400 mt-1">No customer orders match your search and status criteria.</p>
              </div>
            ) : (
              filteredCustomerOrders.map((o) => (
                <div
                  key={o.id}
                  className={`p-6 rounded-3xl border transition-all ${
                    isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono font-bold text-amber-400 text-sm">{o.id}</span>
                        <span className="text-xs font-mono text-zinc-400">{o.createdAt}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          o.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : o.status === "confirmed" || o.status === "processing"
                            ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                            : o.status === "shipped"
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                            : o.status === "cancelled"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}>
                          {o.status === "pending" ? "New Order (Needs Brand Sourcing)" : o.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-zinc-800 text-zinc-300">
                          {o.deliveryMethod === "delivery" ? "🚚 Home Delivery" : "🏬 Studio Pickup"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono text-zinc-300">
                        <span>Customer: <strong className="text-white">{o.customerName}</strong></span>
                        <span>•</span>
                        <span>Phone: <strong className="text-white">{o.customerPhone}</strong></span>
                        {o.customerAddress && (
                          <>
                            <span>•</span>
                            <span className="text-zinc-400 truncate max-w-xs">{o.customerAddress}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono block">Order Total</span>
                        <span className="text-xl font-black font-mono text-amber-400">
                          {currencySymbol}{o.totalAmount.toLocaleString()}
                        </span>
                      </div>

                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as Order["status"])}
                        className="px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs font-mono text-white outline-none cursor-pointer focus:border-amber-400"
                      >
                        <option value="pending">Pending Sourcing</option>
                        <option value="processing">Sourced from Brand</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped to Customer</option>
                        <option value="completed">Completed / Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Items in this order with direct Brand Sourcing Trigger */}
                  <div className="pt-4 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                      Ordered Items & Immediate Brand Sourcing Triggers:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {o.items.map((item, idx) => {
                        const product = products.find((p) => p.id === item.productId);
                        const bName = item.brandName || product?.brandName || "Collaborating Workshop";
                        const bp = brandPartners.find((b) => b.id === (item.brandId || product?.brandId));

                        return (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between gap-3 text-xs font-mono"
                          >
                            <div className="space-y-1">
                              <span className="font-bold text-white block text-sm">{item.productName}</span>
                              <div className="flex items-center gap-3 text-[11px] text-zinc-300">
                                <span>Size: <strong className="text-amber-400">{item.size}</strong></span>
                                <span>Color: <strong className="text-amber-400">{item.color}</strong></span>
                                <span>Qty: <strong className="text-white">{item.quantity}</strong></span>
                              </div>
                              <div className="pt-1 text-[10px] text-zinc-400">
                                <span>Collaborating Brand: <strong className="text-zinc-200">{bName}</strong></span>
                              </div>
                            </div>

                            {/* 1-Click WhatsApp Sourcing Trigger with Pre-Filled Customer Specs */}
                            <button
                              onClick={() => {
                                if (product) {
                                  handleOpenSourcingModal(product, {
                                    size: item.size,
                                    color: item.color,
                                    qty: item.quantity,
                                    customerName: o.customerName,
                                    orderId: o.id,
                                  });
                                } else {
                                  alert("Product information not found in catalog.");
                                }
                              }}
                              className="w-full py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-display transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                              <span>Source Size {item.size} ({item.color}) via WhatsApp</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DAILY REVENUE ANALYSIS */}
      {/* ========================================================================= */}
      {activeTab === "analytics" && (
        <div className="space-y-6 animate-in fade-in duration-200" id="daily-revenue-panel">
          {/* Period Selector & High-Level KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-5 rounded-3xl border ${isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"}`}>
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Total Gross Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className={`text-2xl sm:text-3xl font-black font-mono ${isDark ? "text-white" : "text-zinc-900"}`}>
                {currencySymbol}{totalPeriodRevenue.toLocaleString()}
              </div>
              <p className="text-[10px] text-emerald-400 font-mono mt-1">
                Zero inventory holding outlay
              </p>
            </div>

            <div className={`p-5 rounded-3xl border ${isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"}`}>
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Total Customer Orders</span>
                <ShoppingBag className="w-4 h-4 text-sky-400" />
              </div>
              <div className={`text-2xl sm:text-3xl font-black font-mono ${isDark ? "text-white" : "text-zinc-900"}`}>
                {nonCancelledOrders.length} orders
              </div>
              <p className="text-[10px] text-zinc-400 font-mono mt-1">
                On-demand customer bookings
              </p>
            </div>

            <div className={`p-5 rounded-3xl border ${isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"}`}>
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Average Order Value (AOV)</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <div className={`text-2xl sm:text-3xl font-black font-mono ${isDark ? "text-white" : "text-zinc-900"}`}>
                {currencySymbol}{nonCancelledOrders.length > 0 ? Math.round(totalPeriodRevenue / nonCancelledOrders.length).toLocaleString() : "0"}
              </div>
              <p className="text-[10px] text-zinc-400 font-mono mt-1">
                Average cart transaction value
              </p>
            </div>

            <div className={`p-5 rounded-3xl border ${isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"}`}>
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Top Revenue Partner</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-black font-mono text-amber-400 truncate">
                {topBrandWinner?.brandName || "N/A"}
              </div>
              <p className="text-[10px] text-zinc-400 font-mono mt-1">
                Generated {currencySymbol}{topBrandWinner?.revenue.toLocaleString() || 0}
              </p>
            </div>
          </div>

          {/* Daily Revenue Area Chart */}
          <div className={`p-6 rounded-3xl border ${isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"}`}>
            <h3 className="font-display font-bold text-lg mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                Day-by-Day Revenue Analysis
              </span>
              <span className="text-xs font-mono text-zinc-400">{dailyBreakdown.length} active business days</span>
            </h3>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyBreakdown} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e4e4e7"} vertical={false} />
                  <XAxis dataKey="dateKey" stroke="#a1a1aa" fontSize={11} fontFamily="monospace" tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#a1a1aa" fontSize={11} fontFamily="monospace" tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} dx={-5} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-zinc-950 text-white border border-zinc-800 p-3 rounded-2xl shadow-xl text-xs font-mono space-y-1">
                            <p className="font-bold text-amber-400 border-b border-zinc-800 pb-1">{label}</p>
                            <p className="flex justify-between gap-4">
                              <span>Revenue:</span>
                              <strong>{currencySymbol}{data.revenue.toLocaleString()}</strong>
                            </p>
                            <p className="flex justify-between gap-4">
                              <span>Orders Placed:</span>
                              <span>{data.orderCount}</span>
                            </p>
                            <p className="flex justify-between gap-4">
                              <span>Top Brand:</span>
                              <span className="text-amber-300">{data.topBrand || "Independent"}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#analyticsGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Brand Revenue Leaderboard (Which Brand Brings More Revenue) */}
          <div className={`p-6 rounded-3xl border ${isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"}`}>
            <h3 className="font-display font-bold text-lg mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Collaborating Brand Revenue Ranking (Who Drives the Most Sales)
              </span>
              <span className="text-xs font-mono text-zinc-400">Ranked by Total Gross Sales</span>
            </h3>

            <div className="space-y-3">
              {brandLeaderboard.map((b, idx) => (
                <div
                  key={b.brandId}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    idx === 0
                      ? isDark ? "bg-amber-500/10 border-amber-500/30" : "bg-amber-50 border-amber-200"
                      : isDark ? "bg-zinc-950/60 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black font-mono text-sm ${
                      idx === 0 ? "bg-amber-400 text-zinc-950 font-black" : "bg-zinc-800 text-zinc-400"
                    }`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-bold text-base text-white">{b.brandName}</h4>
                        {idx === 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-400 text-zinc-950">
                            #1 REVENUE DRIVER
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">
                        {b.shopName} • {b.location} • {b.articlesCount} designs in catalogue
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 font-mono text-right justify-between sm:justify-end">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Gross Sales</span>
                      <span className="text-lg font-black text-amber-400">
                        {currencySymbol}{b.revenue.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Units Sourced</span>
                      <span className="text-sm font-bold text-white">{b.unitsSold} pcs</span>
                    </div>

                    <div className="w-20 hidden md:block">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Share</span>
                      <span className="text-sm font-bold text-emerald-400">{b.sharePct}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: WHOLESALE & MARGIN PLANNER (CALCULATOR) */}
      {/* ========================================================================= */}
      {activeTab === "calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200" id="financial-calculator-panel">
          <div className="lg:col-span-6 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-sm space-y-5 text-white">
            <h3 className="font-display font-bold text-lg flex items-center gap-1.5 pb-3 border-b border-zinc-800">
              <Sliders className="w-4 h-4 text-amber-400" />
              On-Demand Sourcing Unit Margin Setup
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 font-semibold mb-1">Target Monthly Sourcing Units</label>
                <input
                  type="number"
                  value={localCalc.batchSize}
                  onChange={(e) => setLocalCalc({ ...localCalc, batchSize: Math.max(1, parseInt(e.target.value) || 0) })}
                  className="w-full px-3 py-2 bg-zinc-950 font-mono text-xs text-white border border-zinc-800 focus:border-amber-400 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 font-semibold mb-1">Avg. Wholesale Cost / Unit ({currencySymbol})</label>
                <input
                  type="number"
                  value={localCalc.unitWholesaleCost}
                  onChange={(e) => setLocalCalc({ ...localCalc, unitWholesaleCost: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full px-3 py-2 bg-zinc-950 font-mono text-xs text-white border border-zinc-800 focus:border-amber-400 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 font-semibold mb-1">Courier / Delivery Cost ({currencySymbol})</label>
                <input
                  type="number"
                  value={localCalc.shippingCostTotal}
                  onChange={(e) => setLocalCalc({ ...localCalc, shippingCostTotal: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full px-3 py-2 bg-zinc-950 font-mono text-xs text-white border border-zinc-800 focus:border-amber-400 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 font-semibold mb-1">Custom Packaging / Unit ({currencySymbol})</label>
                <input
                  type="number"
                  value={localCalc.packagingCostPerUnit}
                  onChange={(e) => setLocalCalc({ ...localCalc, packagingCostPerUnit: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full px-3 py-2 bg-zinc-950 font-mono text-xs text-white border border-zinc-800 focus:border-amber-400 rounded-xl outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-mono uppercase text-zinc-400 font-semibold mb-1">Target Customer Retail Selling Price ({currencySymbol})</label>
                <input
                  type="number"
                  value={localCalc.targetRetailPrice}
                  onChange={(e) => setLocalCalc({ ...localCalc, targetRetailPrice: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full px-3 py-2 bg-zinc-950 font-mono text-xs text-amber-400 font-bold border border-zinc-800 focus:border-amber-400 rounded-xl outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => {
                onUpdateCalculator(localCalc);
                alert("Financial settings synchronized successfully!");
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-zinc-950 transition-all flex items-center justify-center gap-2 cursor-pointer font-display"
            >
              <Save className="w-4 h-4" />
              <span>Save Financial Parameters</span>
            </button>
          </div>

          <div className="lg:col-span-6 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-sm space-y-5 text-white flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg flex items-center gap-1.5 pb-3 border-b border-zinc-800">
                <Percent className="w-4 h-4 text-emerald-400" />
                Unit Economics (Zero Pre-Stock Advantage)
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Wholesale Sourced Cost</span>
                  <span className="text-2xl font-black font-mono text-white mt-1 block">
                    {currencySymbol}{localCalc.unitWholesaleCost}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Reseller Profit / Tee</span>
                  <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
                    {currencySymbol}{Math.max(0, localCalc.targetRetailPrice - localCalc.unitWholesaleCost - localCalc.packagingCostPerUnit)}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Profit Margin %</span>
                  <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">
                    {localCalc.targetRetailPrice > 0 
                      ? Math.round(((localCalc.targetRetailPrice - localCalc.unitWholesaleCost) / localCalc.targetRetailPrice) * 100) 
                      : 0}%
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Dead Stock Risk</span>
                  <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
                    ₹0 (Zero)
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
              <span className="block font-bold mb-1">On-Demand Financial Benefit:</span>
              Because goods are only purchased from the brand partner once a customer commits payment, your working capital risk is virtually zero. You keep 100% of your retail margin without warehousing depreciation.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ORDER HISTORY LEDGER */}
      {/* ========================================================================= */}
      {activeTab === "history" && (
        <div className="animate-in fade-in duration-200">
          <OrderHistory
            orders={orders}
            currencySymbol={currencySymbol}
            theme={theme}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === "settings" && (
        <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 text-white animate-in fade-in duration-200">
          <div>
            <h3 className="font-display font-bold text-xl flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              Platform Branding & Admin Settings
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Configure store title, support WhatsApp number, and administrative preferences.
            </p>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="block uppercase text-zinc-400 font-bold mb-1">Storefront Platform Name</label>
              <input
                type="text"
                value={editingBrand}
                onChange={(e) => setEditingBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400 font-display font-bold text-sm"
              />
            </div>

            <div>
              <label className="block uppercase text-zinc-400 font-bold mb-1">Merchant WhatsApp Contact</label>
              <input
                type="text"
                value={editingWhatsApp}
                onChange={(e) => setEditingWhatsApp(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            onClick={() => {
              onUpdateBrandConfig(editingBrand, editingWhatsApp);
              alert("Storefront configuration saved successfully!");
            }}
            className="w-full py-3 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-zinc-950 font-display transition-all cursor-pointer shadow-md"
          >
            Save Admin Settings
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ON-DEMAND SOURCING WHATSAPP / ORDER GENERATOR */}
      {/* ========================================================================= */}
      {isSourcingModalOpen && sourcingTargetProduct && sourcingTargetBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-3xl p-6 sm:p-8 space-y-6 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsSourcingModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                <Truck className="w-3.5 h-3.5" /> Instant On-Demand Brand Sourcing
              </div>
              <h3 className="font-display font-bold text-xl sm:text-2xl">
                Source Article from {sourcingTargetBrand.name}
              </h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Contact the workshop manager on WhatsApp with the customer's exact size & color to initiate production/dispatch.
              </p>
            </div>

            <div className="space-y-4 text-xs font-mono">
              {/* Product Info Display with Dynamic Color Image */}
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                <img
                  src={getProductColorImage(sourcingTargetProduct, sourcingSelectedColor) || sourcingTargetProduct.images[0]}
                  alt={`${sourcingTargetProduct.name} in ${sourcingSelectedColor}`}
                  className="w-14 h-14 rounded-xl object-cover bg-zinc-800 shrink-0 border border-zinc-700 transition-all duration-300"
                />
                <div className="space-y-0.5 flex-1">
                  <span className="font-bold text-white block text-sm">{sourcingTargetProduct.name}</span>
                  <span className="text-[10px] text-zinc-400">SKU: {sourcingTargetProduct.sku || "N/A"} • Category: {sourcingTargetProduct.category}</span>
                  {sourcingSelectedColor && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md mt-0.5">
                      Selected Colour: {sourcingSelectedColor}
                    </span>
                  )}
                </div>
              </div>

              {/* Sourcing Specifications */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase text-zinc-400 font-bold mb-1">Ordered Size</label>
                  <select
                    value={sourcingSelectedSize}
                    onChange={(e) => setSourcingSelectedSize(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-amber-400 font-bold outline-none cursor-pointer"
                  >
                    {sourcingTargetProduct.sizes.map((sz) => (
                      <option key={sz} value={sz}>{sz}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block uppercase text-zinc-400 font-bold mb-1">Ordered Color (Click to Switch)</label>
                  <select
                    value={sourcingSelectedColor}
                    onChange={(e) => setSourcingSelectedColor(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-bold outline-none cursor-pointer mb-2"
                  >
                    {sourcingTargetProduct.colors.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {sourcingTargetProduct.colors.map((c) => {
                      const isSelected = sourcingSelectedColor.toLowerCase() === c.name.toLowerCase();
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setSourcingSelectedColor(c.name)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                            isSelected
                              ? "bg-amber-400 text-zinc-950 font-bold shadow-sm"
                              : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white"
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                          <span>{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block uppercase text-zinc-400 font-bold mb-1">Quantity Needed</label>
                  <input
                    type="number"
                    min="1"
                    value={sourcingQuantity}
                    onChange={(e) => setSourcingQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase text-zinc-400 font-bold mb-1">Wholesale Amount Due</label>
                  <div className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-emerald-400 font-black text-sm">
                    {currencySymbol}{(sourcingTargetProduct.basePrice * sourcingQuantity).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Workshop Contact Banner */}
              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-[11px] space-y-1">
                <p className="flex justify-between">
                  <span className="text-zinc-400">Workshop Contact:</span>
                  <strong className="text-white">{sourcingTargetBrand.contactPerson} ({sourcingTargetBrand.whatsapp})</strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-zinc-400">Workshop Location:</span>
                  <span>{sourcingTargetBrand.location}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-zinc-400">Standard Handover Time:</span>
                  <strong className="text-amber-400">{sourcingTargetBrand.leadTimeDays || 2} business days</strong>
                </p>
              </div>

              {/* Message Preview */}
              <div>
                <label className="block uppercase text-zinc-400 font-bold mb-1">WhatsApp Message Preview</label>
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-[10px] text-zinc-300 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {generateSourcingWhatsAppText()}
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleCopySourcingText}
                className="w-full sm:w-1/2 py-2.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedSourcingText ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSourcingText ? "Copied Sourcing Memo!" : "Copy Sourcing Memo"}</span>
              </button>

              <button
                onClick={handleSendSourcingWhatsApp}
                className="w-full sm:w-1/2 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-display transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                <span>Send WhatsApp to Brand Owner</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UNIFIED ADD / EDIT ARTICLE & BRAND CATALOGUE MODAL */}
      {/* ========================================================================= */}
      {isCatalogueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveCatalogueProduct}
            className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setIsCatalogueModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
                <Package className="w-3.5 h-3.5" /> Unified Brand & Product Catalogue
              </div>
              <h3 className="font-display font-bold text-xl sm:text-2xl">
                {editingProduct ? "Edit Article & Collaborating Brand" : "Create New Article in Catalogue"}
              </h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Configure article styling, available sizes & colors, along with collaborating shop contact details for on-demand sourcing.
              </p>
            </div>

            <div className="space-y-5 text-xs font-mono">
              {/* SECTION 1: COLLABORATING BRAND / SHOP DETAILS */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                  <span className="font-display font-bold text-sm text-amber-400 flex items-center gap-1.5">
                    <Store className="w-4 h-4" />
                    Collaborating Shop / Brand Information
                  </span>

                  {/* Toggle between existing brand and new brand */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormIsNewBrand(false)}
                      className={`px-2.5 py-1 text-[11px] rounded-lg transition-all cursor-pointer ${
                        !formIsNewBrand ? "bg-amber-400 text-zinc-950 font-bold" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Existing Partner
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormIsNewBrand(true)}
                      className={`px-2.5 py-1 text-[11px] rounded-lg transition-all cursor-pointer ${
                        formIsNewBrand ? "bg-amber-400 text-zinc-950 font-bold" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      + New Brand / Shop
                    </button>
                  </div>
                </div>

                {!formIsNewBrand ? (
                  <div>
                    <label className="block uppercase text-zinc-400 font-bold mb-1">Select Partner Brand / Workshop</label>
                    <select
                      value={formSelectedBrandId}
                      onChange={(e) => {
                        setFormSelectedBrandId(e.target.value);
                        const match = brandPartners.find((b) => b.id === e.target.value);
                        if (match) {
                          setFormBrandName(match.name);
                          setFormBrandShopName(match.shopName || match.name);
                          setFormBrandContact(match.contactPerson);
                          setFormBrandPhone(match.phone);
                          setFormBrandWhatsapp(match.whatsapp);
                          setFormBrandEmail(match.email);
                          setFormBrandLocation(match.location);
                          setFormBrandLeadTime(match.leadTimeDays || 2);
                        }
                      }}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400 cursor-pointer"
                    >
                      {brandPartners.map((bp) => (
                        <option key={bp.id} value={bp.id}>
                          {bp.name} ({bp.shopName}) — Contact: {bp.contactPerson} ({bp.location})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block uppercase text-zinc-400 font-bold mb-1">Brand Name *</label>
                        <input
                          type="text"
                          required={formIsNewBrand}
                          value={formBrandName}
                          onChange={(e) => setFormBrandName(e.target.value)}
                          placeholder="e.g. Kult Streetwear"
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block uppercase text-zinc-400 font-bold mb-1">Shop / Workshop Hub Name</label>
                        <input
                          type="text"
                          value={formBrandShopName}
                          onChange={(e) => setFormBrandShopName(e.target.value)}
                          placeholder="e.g. Bandra Workshop"
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block uppercase text-zinc-400 font-bold mb-1">Contact Person (Owner) *</label>
                        <input
                          type="text"
                          required={formIsNewBrand}
                          value={formBrandContact}
                          onChange={(e) => setFormBrandContact(e.target.value)}
                          placeholder="e.g. Arjun Singhania"
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block uppercase text-zinc-400 font-bold mb-1">Workshop Location / City *</label>
                        <input
                          type="text"
                          required={formIsNewBrand}
                          value={formBrandLocation}
                          onChange={(e) => setFormBrandLocation(e.target.value)}
                          placeholder="e.g. Bandra West, Mumbai"
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block uppercase text-zinc-400 font-bold mb-1">WhatsApp for On-Demand Sourcing *</label>
                        <input
                          type="text"
                          required={formIsNewBrand}
                          value={formBrandWhatsapp}
                          onChange={(e) => setFormBrandWhatsapp(e.target.value)}
                          placeholder="+91 98201 12345"
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-emerald-400 font-bold outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block uppercase text-zinc-400 font-bold mb-1">Sourcing Lead Time (Days)</label>
                        <input
                          type="number"
                          min="1"
                          value={formBrandLeadTime}
                          onChange={(e) => setFormBrandLeadTime(parseInt(e.target.value) || 2)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: ARTICLE CORE DETAILS */}
              <div className="space-y-3">
                <span className="font-display font-bold text-sm text-white flex items-center gap-1.5 pb-2 border-b border-zinc-800">
                  <Tag className="w-4 h-4 text-amber-400" />
                  Article Specifications
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-zinc-400 font-bold mb-1">Article Title *</label>
                    <input
                      type="text"
                      required
                      value={formArtName}
                      onChange={(e) => setFormArtName(e.target.value)}
                      placeholder="e.g. Heavyweight Mineral Acid Wash Boxy Tee"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block uppercase text-zinc-400 font-bold mb-1">Category</label>
                    <select
                      value={formArtCategory}
                      onChange={(e) => setFormArtCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400 cursor-pointer"
                    >
                      {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-zinc-400 font-bold mb-1">Article SKU</label>
                    <input
                      type="text"
                      value={formArtSku}
                      onChange={(e) => setFormArtSku(e.target.value)}
                      placeholder="e.g. ACS-ACID-280"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block uppercase text-zinc-400 font-bold mb-1">Image URL</label>
                    <input
                      type="url"
                      value={formArtImage}
                      onChange={(e) => setFormArtImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block uppercase text-zinc-400 font-bold mb-1">Fabric & Sizing Description *</label>
                  <textarea
                    rows={2}
                    required
                    value={formArtDesc}
                    onChange={(e) => setFormArtDesc(e.target.value)}
                    placeholder="280GSM heavy combed cotton, acid-wash finish, double-needle collar ribbing..."
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* SECTION 3: SIZES AVAILABLE */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <span className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                  Sizes Available for Sourcing from Brand
                </span>

                <div className="flex flex-wrap gap-2">
                  {STANDARD_SIZES.map((sz) => {
                    const isSelected = formSelectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleToggleSize(sz)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-400 text-zinc-950 shadow-sm"
                            : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Size Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    placeholder="Add custom size (e.g. 4XL)"
                    className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-white outline-none focus:border-amber-400 w-48"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSize}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer"
                  >
                    + Add Size
                  </button>
                </div>
              </div>

              {/* SECTION 4: COLORS AVAILABLE */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <span className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Colors Available for Sourcing
                </span>

                {/* Existing configured colors list */}
                <div className="flex flex-wrap gap-2">
                  {formColors.map((c) => (
                    <span
                      key={c.name}
                      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-200"
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(c.name)}
                        className="text-zinc-500 hover:text-red-400 cursor-pointer ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add New Color Row */}
                <div className="flex items-center gap-2 pt-2 flex-wrap">
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="Color Name (e.g. Mineral Grey)"
                    className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-white outline-none focus:border-amber-400 w-44"
                  />
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer p-0.5"
                    title="Choose Color Swatch"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer"
                  >
                    + Add Color
                  </button>
                </div>
              </div>

              {/* SECTION 5: COMMERCIALS & ON-DEMAND MARGIN */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <span className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Wholesale Sourcing & Customer Retail Price
                </span>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase text-zinc-400 font-bold mb-1">
                      Wholesale Cost from Brand ({currencySymbol}) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formArtBasePrice}
                      onChange={(e) => setFormArtBasePrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400 font-bold"
                    />
                    <span className="text-[10px] text-zinc-400 mt-1 block">Cost paid to brand owner</span>
                  </div>

                  <div>
                    <label className="block uppercase text-zinc-400 font-bold mb-1">
                      Customer Retail Selling Price ({currencySymbol}) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formArtPrice}
                      onChange={(e) => setFormArtPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-amber-400 outline-none focus:border-amber-400 font-bold text-sm"
                    />
                    <span className="text-[10px] text-emerald-400 mt-1 block">
                      Net Profit: {currencySymbol}{Math.max(0, formArtPrice - formArtBasePrice)} ({formArtPrice > 0 ? Math.round(((formArtPrice - formArtBasePrice) / formArtPrice) * 100) : 0}% margin)
                    </span>
                  </div>
                </div>

                {/* Hero Slideshow Showcase Toggle */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-amber-400/50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-amber-400 focus:ring-amber-400 bg-zinc-900 border-zinc-700 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        Feature in Storefront Hero Slideshow (Trending &amp; Latest Collection)
                      </span>
                      <span className="text-[11px] text-zinc-400 block font-normal mt-0.5">
                        This article will automatically rotate in the prominent slideshow on the Storefront. When shoppers click the slide, it opens this article's detail modal.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsCatalogueModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-zinc-950 font-display transition-all cursor-pointer shadow-md active:scale-95"
              >
                {editingProduct ? "Save Changes" : "Publish to Storefront"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
