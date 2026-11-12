export interface BrandPartner {
  id: string;
  name: string;
  shopName?: string;
  contactPerson: string;
  phone: string;
  email: string;
  whatsapp: string;
  location: string;
  websiteOrCatalogUrl?: string;
  leadTimeDays: number;
  minimumOrderQty: number;
  marginSplitPercent?: number; // e.g. 60% reseller, 40% brand
  notes?: string;
  logoUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number; // Wholesale/Import cost from the supplier / brand
  price: number;     // Reselling price to customers
  category: string;  // e.g., "Oversized Blanks", "Graphic Tees", "Heavyweight Basics"
  images: string[];
  colors: { name: string; hex: string; image?: string; imageUrl?: string }[];
  colorImages?: Record<string, string>;
  sizes: string[];
  isAvailable: boolean;
  stockCount: number;
  // Collaborating brand & on-demand sourcing fields
  brandId?: string;
  brandName?: string;
  brandShopName?: string;
  brandContactPerson?: string;
  brandPhone?: string;
  brandWhatsapp?: string;
  brandLocation?: string;
  brandEmail?: string;
  sku?: string;
  initialStock?: number;
  sourcingLeadTime?: string;
  isFeatured?: boolean; // When true, displayed in storefront Hero Trending / Latest Collection slideshow
}

export interface CartItem {
  id: string; // Composite key: productId_size_color
  product: Product;
  selectedSize: string;
  selectedColor: { name: string; hex: string };
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  brandId?: string;
  brandName?: string;
}

export interface SavedAddress {
  id: string;
  label: string; // e.g. "Home", "Studio / Work", "Depot"
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

export interface BankDetails {
  upiId?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  cardHolderName?: string;
  cardLast4?: string;
  cardExpiry?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  createdAt: string;
  savedAddresses: SavedAddress[];
  bankDetails: BankDetails;
  wishlistProductIds?: string[];
  isAdmin?: boolean;
  isVerified?: boolean;
  verifiedVia?: "mobile" | "email";
}

export interface CustomerMiniature {
  id: string;
  name: string;
  userPhotoUrl: string; // The uploaded/taken customer selfie/portrait photo
  miniatureImageUrl: string; // The generated miniature avatar/figurine image
  isAiGenerated?: boolean; // true when miniatureImageUrl is an AI-generated figurine of the customer
  imageModel?: string; // image model that produced the figurine
  style: "streetwear_vinyl" | "anime_chibi" | "realistic_scale";
  build: "regular" | "athletic" | "oversized_loose";
  skinTone?: string;
  hairStyle?: string;
  hairColor?: string;
  facialVibe?: string;
  recommendedArchetype?: "chibi_male" | "chibi_fem" | "chibi_urban" | "chibi_reference";
  createdAt: string;
  stylingNotes?: string;
}

export interface StylistFitVerdict {
  fitScore: number; // 0 - 100
  matchLevel: string;
  silhouetteDrape: string;
  colorSynergy: string;
  stylistAdvice: string;
  recommendedPairings: {
    bottoms: string;
    footwear: string;
    accessories: string;
  };
  isEstimate?: boolean; // true when AI was unavailable and this is a generic estimate
  basedOnPreview?: boolean; // true when the verdict was made by looking at the try-on image
}

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  deliveryMethod: "pickup" | "delivery";
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "completed" | "cancelled";
  createdAt: string;
  paymentMethod?: string;
  paymentStatus?: "unpaid" | "paid";
  transactionId?: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
}

export interface ResellerCalculator {
  batchSize: number;         // Total t-shirts imported in this batch
  unitWholesaleCost: number; // Cost per t-shirt paid to the supplier
  shippingCostTotal: number; // Logistics, customs, freight
  customsDutyTotal: number;  // Import tax / customs clearing
  packagingCostPerUnit: number; // Polybags, neck tags, custom stickers
  marketingCostTotal: number; // Promos, ads, flyers
  targetRetailPrice: number; // Price to resell each shirt for
}
