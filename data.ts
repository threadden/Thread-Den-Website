import { Product, ResellerCalculator, Order, BrandPartner } from "./types";

export const DEFAULT_BRAND_PARTNERS: BrandPartner[] = [
  {
    id: "brand_kult",
    name: "Kult Streetwear Co.",
    shopName: "Kult Flagship Bandra",
    contactPerson: "Arjun Singhania",
    phone: "+91 98201 12345",
    whatsapp: "+91 98201 12345",
    email: "orders@kultstreetwear.in",
    location: "Bandra West, Mumbai",
    websiteOrCatalogUrl: "https://kultstreetwear.in/wholesale",
    leadTimeDays: 3,
    minimumOrderQty: 20,
    marginSplitPercent: 60,
    notes: "Specializes in oversized printed architectural graphics & water-based screen printing.",
    logoUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "brand_acidcraft",
    name: "Acid Craft Studios",
    shopName: "Acid Craft Tirupur Hub",
    contactPerson: "Kavita Rao",
    phone: "+91 98450 67890",
    whatsapp: "+91 98450 67890",
    email: "supply@acidcraftstudios.com",
    location: "Tirupur, Tamil Nadu",
    websiteOrCatalogUrl: "https://acidcraftstudios.com",
    leadTimeDays: 4,
    minimumOrderQty: 25,
    marginSplitPercent: 55,
    notes: "Direct mill dye house specializing in mineral acid wash and distressed 280GSM weaves.",
    logoUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "brand_rawbasics",
    name: "Raw Cotton Lab",
    shopName: "Raw Denim & Heavy Cotton Lab",
    contactPerson: "Nikhil Menon",
    phone: "+91 99002 34567",
    whatsapp: "+91 99002 34567",
    email: "b2b@rawdenimlab.in",
    location: "Indiranagar, Bengaluru",
    websiteOrCatalogUrl: "https://rawcottonlab.in",
    leadTimeDays: 5,
    minimumOrderQty: 30,
    marginSplitPercent: 65,
    notes: "High-grade 240+ GSM combed plain streetwear blanks with double-stitched tight crew collars.",
    logoUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "brand_vapour",
    name: "Vapour Urban Apparel",
    shopName: "Vapour Flagship Hauz Khas",
    contactPerson: "Rohan Kapoor",
    phone: "+91 98110 54321",
    whatsapp: "+91 98110 54321",
    email: "rohan@vapoururban.com",
    location: "Hauz Khas, New Delhi",
    websiteOrCatalogUrl: "https://vapoururban.com",
    leadTimeDays: 2,
    minimumOrderQty: 15,
    marginSplitPercent: 58,
    notes: "Lightweight 200GSM honeycomb jersey knit and summer streetwear silhouette drops.",
    logoUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=200",
  },
];

export const COLOR_IMAGE_MAP: Record<string, string> = {
  black: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop",
  pitch: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop",
  dark: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop",
  cream: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop",
  white: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop",
  chalk: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop",
  oatmeal: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop",
  grey: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
  gray: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
  mineral: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
  charcoal: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
  acid: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
  green: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop",
  sage: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop",
  olive: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop",
  blue: "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop",
  navy: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop",
  slate: "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop",
  dusty: "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop",
  rust: "https://images.unsplash.com/photo-1527719327859-c6ce80353573?q=80&w=800&auto=format&fit=crop",
  terracotta: "https://images.unsplash.com/photo-1527719327859-c6ce80353573?q=80&w=800&auto=format&fit=crop",
};

export function getProductColorImage(product: Product, colorNameOrHex?: string): string {
  if (!product) return "";
  if (!colorNameOrHex) return product.images?.[0] || "";
  
  // 1. Direct match on product.colors image/imageUrl
  const matchedColor = product.colors?.find(
    (c) => c.name.toLowerCase() === colorNameOrHex.toLowerCase() || c.hex.toLowerCase() === colorNameOrHex.toLowerCase()
  );
  if (matchedColor?.image) return matchedColor.image;
  if (matchedColor?.imageUrl) return matchedColor.imageUrl;

  // 2. Direct match on product.colorImages map
  if (product.colorImages && product.colorImages[colorNameOrHex]) {
    return product.colorImages[colorNameOrHex];
  }

  // 3. Keyword heuristic on color name
  const nameLower = (matchedColor?.name || colorNameOrHex).toLowerCase();
  for (const [key, img] of Object.entries(COLOR_IMAGE_MAP)) {
    if (nameLower.includes(key)) {
      return img;
    }
  }

  return product.images?.[0] || "";
}

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod_oversized_blank",
    name: "The Ultimate Oversized Tee",
    description: "Crafted from 240GSM ultra-heavyweight combed cotton. Features a perfect boxy streetwear fit, drop shoulders, and a thick ribbed neckband that won't stretch out. Pre-shrunk and soft-washed for an absolute premium handfeel.",
    basePrice: 650, // Cost price from brand partner
    price: 1490,    // Retail selling price
    category: "Oversized Plain",
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop"
    ],
    colors: [
      { name: "Pitch Black", hex: "#121212", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop" },
      { name: "Warm Cream", hex: "#EADCC9", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop" },
      { name: "Sage Green", hex: "#7E8F7C", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop" },
      { name: "Slate Blue", hex: "#5C6B73", image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    isAvailable: true,
    stockCount: 45,
    brandId: "brand_rawbasics",
    brandName: "Raw Cotton Lab",
    brandShopName: "Raw Denim & Heavy Cotton Lab",
    brandContactPerson: "Nikhil Menon",
    brandPhone: "+91 99002 34567",
    brandWhatsapp: "+91 99002 34567",
    brandLocation: "Indiranagar, Bengaluru",
    sku: "RCL-BLANK-240",
    initialStock: 100,
    isFeatured: true,
  },
  {
    id: "prod_heavyweight_basic",
    name: "Classic Acid Wash Heavyweight Tee",
    description: "Built with a rugged 280GSM structured acid-washed cotton weave. Offers a classic tailored fit that holds its shape beautifully throughout the day. Finished with double-needle stitched hems for maximum durability.",
    basePrice: 750,
    price: 1790,
    category: "Acid Wash",
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1527719327859-c6ce80353573?q=80&w=800&auto=format&fit=crop"
    ],
    colors: [
      { name: "Mineral Grey", hex: "#3A3E41", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop" },
      { name: "Pure White", hex: "#FFFFFF", image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop" },
      { name: "Rich Navy", hex: "#1D2A44", image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop" },
      { name: "Terracotta Rust", hex: "#A34A38", image: "https://images.unsplash.com/photo-1527719327859-c6ce80353573?q=80&w=800&auto=format&fit=crop" }
    ],
    sizes: ["M", "L", "XL"],
    isAvailable: true,
    stockCount: 14,
    brandId: "brand_acidcraft",
    brandName: "Acid Craft Studios",
    brandShopName: "Acid Craft Tirupur Hub",
    brandContactPerson: "Kavita Rao",
    brandPhone: "+91 98450 67890",
    brandWhatsapp: "+91 98450 67890",
    brandLocation: "Tirupur, Tamil Nadu",
    sku: "ACS-ACID-280",
    initialStock: 80,
    isFeatured: true,
  },
  {
    id: "prod_minimalist_graphic",
    name: "Abstract Architect Oversized Printed Tee",
    description: "A streetwear staple featuring a clean typography mark on the chest and an architectural blueprint illustration screen-printed across the back using non-toxic water-based ink. 240GSM boxy fit.",
    basePrice: 850,
    price: 1990,
    category: "Oversized Printed",
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop"
    ],
    colors: [
      { name: "Pitch Black", hex: "#121212", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop" },
      { name: "Warm Cream", hex: "#EADCC9", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop" }
    ],
    sizes: ["S", "M", "L", "XL"],
    isAvailable: true,
    stockCount: 35,
    brandId: "brand_kult",
    brandName: "Kult Streetwear Co.",
    brandShopName: "Kult Flagship Bandra",
    brandContactPerson: "Arjun Singhania",
    brandPhone: "+91 98201 12345",
    brandWhatsapp: "+91 98201 12345",
    brandLocation: "Bandra West, Mumbai",
    sku: "KLT-ARCH-240",
    initialStock: 90,
    isFeatured: true,
  },
  {
    id: "prod_daily_slub",
    name: "Aero Mesh Breathable Jersey Tee",
    description: "Lightweight 200GSM honeycomb jersey knit cotton blend. Highly breathable, soft-washed, and featuring a relaxed casual drape. The absolute perfect fit for warm climates and everyday streetwear.",
    basePrice: 480,
    price: 1190,
    category: "Jersey",
    images: [
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop"
    ],
    colors: [
      { name: "Olive Drab", hex: "#4B5320", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop" },
      { name: "Oatmeal Melange", hex: "#D6CFC7", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop" },
      { name: "Dusty Blue", hex: "#7E90A3", image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    isAvailable: true,
    stockCount: 50,
    brandId: "brand_vapour",
    brandName: "Vapour Urban Apparel",
    brandShopName: "Vapour Flagship Hauz Khas",
    brandContactPerson: "Rohan Kapoor",
    brandPhone: "+91 98110 54321",
    brandWhatsapp: "+91 98110 54321",
    brandLocation: "Hauz Khas, New Delhi",
    sku: "VPR-JERSEY-200",
    initialStock: 120,
    isFeatured: true,
  },
  {
    id: "prod_vintage_acid",
    name: "Vintage Distressed Mineral Acid Wash Tee",
    description: "Custom hand-dyed acid wash 260GSM combed cotton. Each shirt exhibits a unique vintage fade finish with distressed ribbed collar.",
    basePrice: 720,
    price: 1690,
    category: "Acid Wash",
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop"
    ],
    colors: [
      { name: "Acid Black", hex: "#2B2B2B", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop" },
      { name: "Washed Charcoal", hex: "#4A4A4A", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop" }
    ],
    sizes: ["M", "L", "XL", "XXL"],
    isAvailable: true,
    stockCount: 8,
    brandId: "brand_acidcraft",
    brandName: "Acid Craft Studios",
    brandShopName: "Acid Craft Tirupur Hub",
    brandContactPerson: "Kavita Rao",
    brandPhone: "+91 98450 67890",
    brandWhatsapp: "+91 98450 67890",
    brandLocation: "Tirupur, Tamil Nadu",
    sku: "ACS-VINT-260",
    initialStock: 60,
  },
  {
    id: "prod_plain_heavy",
    name: "Essential Heavyweight Oversized Plain Tee",
    description: "Ultra-clean minimalist 250GSM boxy plain tee with drop shoulders and reinforced crew neckline. Unbranded blank silhouette.",
    basePrice: 620,
    price: 1390,
    category: "Oversized Plain",
    images: [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    colors: [
      { name: "Chalk White", hex: "#FAFAFA", image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop" },
      { name: "Deep Navy", hex: "#0B192C", image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop" }
    ],
    sizes: ["S", "M", "L", "XL"],
    isAvailable: true,
    stockCount: 40,
    brandId: "brand_rawbasics",
    brandName: "Raw Cotton Lab",
    brandShopName: "Raw Denim & Heavy Cotton Lab",
    brandContactPerson: "Nikhil Menon",
    brandPhone: "+91 99002 34567",
    brandWhatsapp: "+91 99002 34567",
    brandLocation: "Indiranagar, Bengaluru",
    sku: "RCL-ESSENT-250",
    initialStock: 75,
  }
];

export const CATEGORIES = ["All", "Oversized Printed", "Oversized Plain", "Jersey", "Acid Wash"];

export const DEFAULT_CALCULATOR: ResellerCalculator = {
  batchSize: 150,
  unitWholesaleCost: 550,
  shippingCostTotal: 12000,
  customsDutyTotal: 8000,
  packagingCostPerUnit: 40,
  marketingCostTotal: 5000,
  targetRetailPrice: 1590
};

export const DEFAULT_ORDERS: Order[] = [
  {
    id: "ORD-995201",
    userId: "usr_101",
    customerName: "Alex Morgan",
    customerPhone: "+91 98765 43210",
    customerAddress: "42 Park View Apartments, Sector 15, New Delhi - 110001",
    deliveryMethod: "delivery",
    items: [
      {
        productId: "prod_oversized_blank",
        productName: "The Ultimate Oversized Tee",
        size: "XL",
        color: "Pitch Black",
        quantity: 2,
        price: 1490,
        brandId: "brand_rawbasics",
        brandName: "Raw Cotton Lab",
      },
      {
        productId: "prod_minimalist_graphic",
        productName: "Abstract Architect Graphic Tee",
        size: "L",
        color: "Pitch Black",
        quantity: 1,
        price: 1990,
        brandId: "brand_kult",
        brandName: "Kult Streetwear Co.",
      }
    ],
    totalAmount: 4970,
    status: "shipped",
    createdAt: "24 Jul 2026, 09:15 am",
    paymentMethod: "Credit Card",
    paymentStatus: "paid",
    transactionId: "TXN-CARD-991823",
    trackingNumber: "DEL-8891204X",
    carrier: "Delhivery Express",
    estimatedDelivery: "Tomorrow, 5:00 PM"
  },
  {
    id: "ORD-881230",
    userId: "usr_101",
    customerName: "Alex Morgan",
    customerPhone: "+91 98765 43210",
    customerAddress: "42 Park View Apartments, Sector 15, New Delhi - 110001",
    deliveryMethod: "delivery",
    items: [
      {
        productId: "prod_heavyweight_basic",
        productName: "Classic Heavyweight Tee",
        size: "L",
        color: "Rich Navy",
        quantity: 2,
        price: 1790,
        brandId: "brand_acidcraft",
        brandName: "Acid Craft Studios",
      }
    ],
    totalAmount: 3580,
    status: "processing",
    createdAt: "25 Jul 2026, 02:40 pm",
    paymentMethod: "UPI Instant",
    paymentStatus: "paid",
    transactionId: "TXN-UPI-771239",
    trackingNumber: "BLU-771209Y",
    carrier: "BlueDart Priority",
    estimatedDelivery: "27 Jul 2026"
  },
  {
    id: "ORD-452109",
    userId: "usr_101",
    customerName: "Alex Morgan",
    customerPhone: "+91 98765 43210",
    customerAddress: "42 Park View Apartments, Sector 15, New Delhi - 110001",
    deliveryMethod: "delivery",
    items: [
      {
        productId: "prod_daily_slub",
        productName: "Aero Slub Summer Tee",
        size: "M",
        color: "Oatmeal Melange",
        quantity: 1,
        price: 1190,
        brandId: "brand_vapour",
        brandName: "Vapour Urban Apparel",
      }
    ],
    totalAmount: 1190,
    status: "completed",
    createdAt: "18 Jul 2026, 11:30 am",
    paymentMethod: "NetBanking",
    paymentStatus: "paid",
    transactionId: "TXN-NET-551029",
    trackingNumber: "DEL-102938Z",
    carrier: "Delhivery Express",
    estimatedDelivery: "20 Jul 2026 (Delivered)"
  },
  {
    id: "ORD-210934",
    customerName: "Kabir Singh",
    customerPhone: "+91 94440 98765",
    customerAddress: "",
    deliveryMethod: "pickup",
    items: [
      {
        productId: "prod_daily_slub",
        productName: "Aero Slub Summer Tee",
        size: "M",
        color: "Oatmeal Melange",
        quantity: 5,
        price: 1190,
        brandId: "brand_vapour",
        brandName: "Vapour Urban Apparel",
      }
    ],
    totalAmount: 5950,
    status: "completed",
    createdAt: "5 Jul 2026, 09:10 am"
  },
  {
    id: "ORD-301298",
    customerName: "Priya Sharma",
    customerPhone: "+91 98112 34567",
    customerAddress: "E-302, Green Glen Layout, Bellandur, Bangalore",
    deliveryMethod: "delivery",
    items: [
      {
        productId: "prod_oversized_blank",
        productName: "The Ultimate Oversized Tee",
        size: "M",
        color: "Sage Green",
        quantity: 3,
        price: 1490,
        brandId: "brand_rawbasics",
        brandName: "Raw Cotton Lab",
      }
    ],
    totalAmount: 4470,
    status: "confirmed",
    createdAt: "6 Jul 2026, 02:40 pm"
  },
  {
    id: "ORD-774412",
    customerName: "Aarav Mehta",
    customerPhone: "+91 99200 88888",
    customerAddress: "Block C, Satellite, Ahmedabad",
    deliveryMethod: "delivery",
    items: [
      {
        productId: "prod_heavyweight_basic",
        productName: "Classic Heavyweight Tee",
        size: "XL",
        color: "Terracotta Rust",
        quantity: 2,
        price: 1790,
        brandId: "brand_acidcraft",
        brandName: "Acid Craft Studios",
      },
      {
        productId: "prod_minimalist_graphic",
        productName: "Abstract Architect Graphic Tee",
        size: "L",
        color: "Pitch Black",
        quantity: 2,
        price: 1990,
        brandId: "brand_kult",
        brandName: "Kult Streetwear Co.",
      }
    ],
    totalAmount: 7560,
    status: "completed",
    createdAt: "7 Jul 2026, 06:15 pm"
  },
  {
    id: "ORD-908123",
    customerName: "Diya Nair",
    customerPhone: "+91 96111 22233",
    customerAddress: "",
    deliveryMethod: "pickup",
    items: [
      {
        productId: "prod_daily_slub",
        productName: "Aero Slub Summer Tee",
        size: "S",
        color: "Dusty Blue",
        quantity: 2,
        price: 1190,
        brandId: "brand_vapour",
        brandName: "Vapour Urban Apparel",
      },
      {
        productId: "prod_oversized_blank",
        productName: "The Ultimate Oversized Tee",
        size: "M",
        color: "Warm Cream",
        quantity: 1,
        price: 1490,
        brandId: "brand_rawbasics",
        brandName: "Raw Cotton Lab",
      }
    ],
    totalAmount: 3870,
    status: "pending",
    createdAt: "8 Jul 2026, 11:05 am"
  },
  {
    id: "ORD-109283",
    customerName: "Vikram Rathore",
    customerPhone: "+91 90011 22334",
    customerAddress: "S-5, Vaishali Nagar, Jaipur",
    deliveryMethod: "delivery",
    items: [
      {
        productId: "prod_minimalist_graphic",
        productName: "Abstract Architect Graphic Tee",
        size: "XL",
        color: "Pitch Black",
        quantity: 3,
        price: 1990,
        brandId: "brand_kult",
        brandName: "Kult Streetwear Co.",
      }
    ],
    totalAmount: 5970,
    status: "pending",
    createdAt: "9 Jul 2026, 01:05 pm"
  },
  {
    id: "ORD-554421",
    customerName: "Sameer Joshi",
    customerPhone: "+91 98220 11999",
    customerAddress: "104 Koregaon Park, Pune",
    deliveryMethod: "delivery",
    items: [
      {
        productId: "prod_vintage_acid",
        productName: "Vintage Distressed Mineral Acid Wash Tee",
        size: "L",
        color: "Acid Black",
        quantity: 2,
        price: 1690,
        brandId: "brand_acidcraft",
        brandName: "Acid Craft Studios",
      },
      {
        productId: "prod_plain_heavy",
        productName: "Essential Heavyweight Oversized Plain Tee",
        size: "M",
        color: "Chalk White",
        quantity: 2,
        price: 1390,
        brandId: "brand_rawbasics",
        brandName: "Raw Cotton Lab",
      }
    ],
    totalAmount: 6160,
    status: "completed",
    createdAt: "12 Jul 2026, 04:20 pm"
  },
  {
    id: "ORD-667788",
    customerName: "Rhea Sen",
    customerPhone: "+91 98300 44556",
    customerAddress: "Flat 4A, Salt Lake Sector 1, Kolkata",
    deliveryMethod: "delivery",
    items: [
      {
        productId: "prod_minimalist_graphic",
        productName: "Abstract Architect Graphic Tee",
        size: "M",
        color: "Warm Cream",
        quantity: 2,
        price: 1990,
        brandId: "brand_kult",
        brandName: "Kult Streetwear Co.",
      }
    ],
    totalAmount: 3980,
    status: "completed",
    createdAt: "15 Jul 2026, 03:10 pm"
  }
];
