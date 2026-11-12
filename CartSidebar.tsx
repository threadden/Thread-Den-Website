import React, { useState, useEffect } from "react";
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  Send, 
  PhoneCall, 
  Copy, 
  Check, 
  MapPin, 
  Sparkles, 
  CreditCard, 
  Smartphone, 
  Building2, 
  ArrowLeft, 
  Loader2, 
  Printer, 
  Download, 
  CheckCircle2, 
  Receipt, 
  Lock,
  UserCheck,
  UserPlus,
  User,
  ArrowRight,
  QrCode,
  ShieldCheck,
  Zap,
  Clock
} from "lucide-react";
import { CartItem, Order, UserProfile } from "../types";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  currencySymbol: string;
  merchantWhatsApp: string; // The merchant's contact phone number
  onSubmitOrder: (order: Omit<Order, "id" | "createdAt" | "status"> & { 
    status?: Order["status"]; 
    paymentMethod?: string; 
    paymentStatus?: "unpaid" | "paid"; 
    transactionId?: string; 
    userId?: string;
  }) => void;
  theme: "dark" | "light";
  currentUser?: UserProfile | null;
  onOpenAccountModal?: () => void;
  onOpenAuthModal?: (mode: "signin" | "signup") => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  currencySymbol,
  merchantWhatsApp,
  onSubmitOrder,
  theme,
  currentUser,
  onOpenAccountModal,
  onOpenAuthModal,
}: CartSidebarProps) {
  if (!isOpen) return null;

  // Checkout Form State (Customer Basic Details)
  const [customerName, setCustomerName] = useState(currentUser?.name || "");
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || "");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [customerAddress, setCustomerAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Auto-fill from user profile when opened or when currentUser changes
  useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name);
      if (!customerPhone) setCustomerPhone(currentUser.phone);
      if (currentUser.savedAddresses && currentUser.savedAddresses.length > 0) {
        const defaultAddr = currentUser.savedAddresses.find((a) => a.isDefault) || currentUser.savedAddresses[0];
        if (defaultAddr && !customerAddress) {
          setCustomerAddress(`${defaultAddr.streetAddress}, ${defaultAddr.city}, ${defaultAddr.state} - ${defaultAddr.postalCode}`);
        }
      }
    }
  }, [currentUser]);

  // Online Payment Portal State (Razorpay Gateway)
  const [isAtPaymentPortal, setIsAtPaymentPortal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "qr_upi" | "netbanking">("qr_upi");
  const [upiSubMode, setUpiSubMode] = useState<"qr" | "id">("qr");
  const [isPaying, setIsPaying] = useState(false);
  const [payProgress, setPayProgress] = useState(0);
  const [payStatusText, setPayStatusText] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  // Payment Field States
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const [upiId, setUpiId] = useState("");
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [isUpiVerifying, setIsUpiVerifying] = useState(false);

  const [selectedBank, setSelectedBank] = useState("");

  const isDark = theme === "dark";

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = deliveryMethod === "delivery" ? 100 : 0; // Flat delivery charge
  const totalAmount = subtotal + deliveryFee;

  // Card formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/g, "");
    const formattedValue = value.replace(/(\d{4})/g, "$1 ").trim().substring(0, 19);
    setCardNumber(formattedValue);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) {
      value = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    }
    setCardExpiry(value.substring(0, 5));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 4);
    setCardCvv(value);
  };

  // UPI verification simulation
  const handleVerifyUpi = () => {
    if (!upiId.trim() || !upiId.includes("@")) {
      alert("Please enter a valid UPI ID (e.g., name@okhdfcbank)");
      return;
    }
    setIsUpiVerifying(true);
    setTimeout(() => {
      setIsUpiVerifying(false);
      setIsUpiVerified(true);
    }, 1000);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce that customers must log in or sign up before checking out
    if (!currentUser) {
      if (onOpenAuthModal) {
        onOpenAuthModal("signup");
      } else if (onOpenAccountModal) {
        onOpenAccountModal();
      }
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Please enter your name and phone number.");
      return;
    }
    if (deliveryMethod === "delivery" && !customerAddress.trim()) {
      alert("Please enter your local delivery address.");
      return;
    }

    // Direct the user to the interactive payment gateway modal/step
    setIsAtPaymentPortal(true);
  };

  // Complete Online Payment Gateway Simulation with real-time feedback
  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === "card") {
      if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
        alert("Please provide a valid 16-digit Card Number.");
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        alert("Please provide your card expiry date (MM/YY).");
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        alert("Please provide a 3 or 4-digit security CVV.");
        return;
      }
      if (!cardName.trim()) {
        alert("Please provide the cardholder's full name.");
        return;
      }
    } else if (paymentMethod === "qr_upi") {
      if (upiSubMode === "id" && (!upiId.trim() || !upiId.includes("@"))) {
        alert("Please enter a valid UPI ID layout (e.g., test@upi).");
        return;
      }
    } else if (paymentMethod === "netbanking") {
      if (!selectedBank) {
        alert("Please select your online bank outlet.");
        return;
      }
    }

    setIsPaying(true);
    setPayProgress(15);
    setPayStatusText("Initiating secure payment session...");

    // Helper to synthesize a beautiful digital transaction chime
    const playPaymentTone = (freq: number, duration: number, type: OscillatorType = "sine") => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.06, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + duration);
        }
      } catch (err) {}
    };

    playPaymentTone(523.25, 0.15); // C5 Start

    setTimeout(() => {
      setPayProgress(45);
      setPayStatusText("Verifying tokenized billing credentials...");
      playPaymentTone(587.33, 0.1); // D5
    }, 600);

    setTimeout(() => {
      setPayProgress(80);
      setPayStatusText("Settling payment ledger with Thread Den gateway...");
      playPaymentTone(659.25, 0.1); // E5
    }, 1200);

    setTimeout(() => {
      setPayProgress(100);
      setPayStatusText("Success! Compiling digital tax invoice...");
      
      // Beautiful double-beep success chime
      playPaymentTone(659.25, 0.15);
      setTimeout(() => playPaymentTone(880.00, 0.35), 100);

      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        size: item.selectedSize,
        color: item.selectedColor.name,
        price: item.product.price,
        quantity: item.quantity,
      }));

      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const txnId = `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`;

      let methodText = "";
      if (paymentMethod === "card") {
        methodText = `Razorpay Card (*${cardNumber.replace(/\s/g, "").slice(-4)})`;
      } else if (paymentMethod === "qr_upi") {
        methodText = upiSubMode === "qr" ? "Razorpay Dynamic QR Code Scan" : `Razorpay UPI (${upiId})`;
      } else {
        methodText = `Razorpay Net Banking (${selectedBank})`;
      }

      const currentDate = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });

      const finalPaidOrder: Order = {
        id: orderId,
        userId: currentUser?.id,
        customerName,
        customerPhone,
        customerAddress: deliveryMethod === "delivery" ? customerAddress : undefined,
        deliveryMethod,
        items: orderItems,
        totalAmount,
        status: "completed", // Saved as a completed (fully paid) order
        createdAt: currentDate,
        paymentMethod: methodText,
        paymentStatus: "paid",
        transactionId: txnId,
      };

      // Submit fully paid order to parent context
      onSubmitOrder({
        userId: currentUser?.id,
        customerName,
        customerPhone,
        customerAddress: deliveryMethod === "delivery" ? customerAddress : undefined,
        deliveryMethod,
        items: orderItems,
        totalAmount,
        status: "completed",
        paymentMethod: methodText,
        paymentStatus: "paid",
        transactionId: txnId,
      });

      setCreatedOrder(finalPaidOrder);
      setIsPaying(false);
      setIsAtPaymentPortal(false);
    }, 2000);
  };

  // Printable layout generator function
  const handlePrintReceipt = () => {
    if (!createdOrder) return;
    
    const win = window.open("", "_blank");
    if (!win) {
      alert("Popup block detected. Please enable popups to print your digital receipt.");
      return;
    }

    win.document.write(`
      <html>
        <head>
          <title>Invoice_Receipt_${createdOrder.id}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
              padding: 40px; 
              color: #18181b; 
              background-color: #ffffff;
            }
            .receipt-container { 
              max-width: 600px; 
              margin: 0 auto; 
              border: 1px solid #e4e4e7; 
              padding: 32px; 
              border-radius: 16px; 
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
            }
            .header { 
              text-align: center; 
              margin-bottom: 24px; 
              border-bottom: 2px solid #f4f4f5; 
              padding-bottom: 20px; 
            }
            .title { 
              font-size: 22px; 
              font-weight: 800; 
              text-transform: uppercase; 
              letter-spacing: 1.5px; 
              margin: 0; 
            }
            .subtitle { 
              font-size: 11px; 
              color: #71717a; 
              margin-top: 5px; 
              font-weight: 500;
            }
            .badge { 
              display: inline-block; 
              padding: 5px 12px; 
              background: #ecfdf5; 
              border: 1px solid #a7f3d0; 
              color: #047857; 
              font-size: 10px; 
              font-weight: 700; 
              border-radius: 9999px; 
              text-transform: uppercase; 
              margin-top: 10px; 
            }
            .meta-grid { 
              display: grid; 
              grid-template-cols: 1fr 1fr; 
              gap: 16px; 
              font-size: 12px; 
              margin-bottom: 24px; 
              padding: 16px;
              background-color: #fafafa;
              border-radius: 12px;
            }
            .meta-label { 
              color: #71717a; 
              font-weight: 500; 
            }
            .meta-val { 
              font-weight: 700; 
            }
            .section-title { 
              font-size: 11px; 
              font-weight: 800; 
              text-transform: uppercase; 
              color: #27272a; 
              letter-spacing: 1px; 
              border-bottom: 1px solid #e4e4e7; 
              padding-bottom: 6px; 
              margin-bottom: 12px; 
              margin-top: 24px; 
            }
            .info-block { 
              font-size: 12px; 
              line-height: 1.6; 
              color: #3f3f46; 
            }
            .item-table { 
              width: 100%; 
              border-collapse: collapse; 
              font-size: 12px; 
              margin-top: 8px; 
            }
            .item-table th { 
              text-align: left; 
              color: #71717a; 
              padding: 10px 4px; 
              border-bottom: 1px solid #e4e4e7; 
              font-weight: 700; 
            }
            .item-table td { 
              padding: 12px 4px; 
              border-bottom: 1px solid #f4f4f5; 
            }
            .item-table .qty { 
              text-align: center; 
            }
            .item-table .amt { 
              text-align: right; 
              font-weight: 700; 
            }
            .total-block { 
              margin-top: 24px; 
              font-size: 12px; 
              border-top: 1px solid #e4e4e7; 
              padding-top: 14px; 
            }
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 8px; 
              color: #3f3f46; 
            }
            .grand-total { 
              font-size: 16px; 
              font-weight: 800; 
              color: #18181b; 
              border-top: 2px dashed #e4e4e7; 
              padding-top: 12px; 
              margin-top: 12px; 
            }
            .barcode-box {
              text-align: center;
              margin-top: 32px;
              padding: 12px;
              border: 1px dashed #e4e4e7;
              border-radius: 8px;
            }
            .barcode {
              font-family: "Courier New", Courier, monospace;
              letter-spacing: 6px;
              font-size: 14px;
              font-weight: bold;
              color: #71717a;
            }
            .footer-note { 
              text-align: center; 
              font-size: 10px; 
              color: #a1a1aa; 
              margin-top: 32px; 
              border-top: 1px solid #f4f4f5; 
              padding-top: 16px; 
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="title">THREAD DEN STREETWEAR</div>
              <div class="subtitle">Official Tax Invoice & Payment Receipt</div>
              <div class="badge">Success - Paid Online</div>
            </div>
            
            <div class="meta-grid">
              <div>
                <span class="meta-label">INVOICE ID:</span><br/>
                <span class="meta-val">${createdOrder.id}</span>
              </div>
              <div style="text-align: right;">
                <span class="meta-label">PAYMENT DATE:</span><br/>
                <span class="meta-val">${createdOrder.createdAt}</span>
              </div>
              <div style="margin-top: 8px;">
                <span class="meta-label">TRANSACTION NO:</span><br/>
                <span class="meta-val">${createdOrder.transactionId}</span>
              </div>
              <div style="text-align: right; margin-top: 8px;">
                <span class="meta-label">PAY VIA:</span><br/>
                <span class="meta-val">${createdOrder.paymentMethod}</span>
              </div>
            </div>

            <div class="section-title">Customer Information</div>
            <div class="info-block">
              <strong>Billed To:</strong> ${createdOrder.customerName}<br/>
              <strong>Contact Line:</strong> ${createdOrder.customerPhone}<br/>
              <strong>Logistics Option:</strong> ${createdOrder.deliveryMethod === "delivery" ? "Hand Delivery to Site" : "In-Person Pick-up"}<br/>
              ${createdOrder.customerAddress ? `<strong>Delivery Address:</strong> ${createdOrder.customerAddress}<br/>` : ""}
            </div>

            <div class="section-title">Billing Particulars</div>
            <table class="item-table">
              <thead>
                <tr>
                  <th>Streetwear Selection</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Rate</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${createdOrder.items.map(item => `
                  <tr>
                    <td>
                      <strong>${item.productName}</strong><br/>
                      <span style="font-size: 10px; color: #71717a;">Size: ${item.size} | Color: ${item.color}</span>
                    </td>
                    <td class="qty">${item.quantity}</td>
                    <td style="text-align: right;">${currencySymbol}${item.price.toLocaleString()}</td>
                    <td class="amt">${currencySymbol}${(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>

            <div class="total-block">
              <div class="total-row">
                <span>Subtotal Particulars:</span>
                <span>${currencySymbol}${(createdOrder.totalAmount - (createdOrder.deliveryMethod === "delivery" ? 100 : 0)).toLocaleString()}</span>
              </div>
              <div class="total-row">
                <span>Local Transit/Delivery Charges:</span>
                <span>${createdOrder.deliveryMethod === "delivery" ? `${currencySymbol}100` : "Free"}</span>
              </div>
              <div class="total-row" style="font-size: 11px; color: #71717a;">
                <span>GST (Goods & Services Tax - 5% Included):</span>
                <span>${currencySymbol}${Math.round(createdOrder.totalAmount * 0.0476).toLocaleString()}</span>
              </div>
              <div class="total-row grand-total">
                <span>TOTAL AMOUNT PAID:</span>
                <span>${currencySymbol}${createdOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div class="barcode-box">
              <span class="barcode">||||| | |||| || ||| | ||| ${createdOrder.id}</span>
            </div>

            <div class="footer-note">
              Thank you for shopping at Thread Den! This is a digital proof of payment. For refunds or modifications, please present this invoice.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // Blob downloader creating a true offline download file receipt
  const handleDownloadReceipt = () => {
    if (!createdOrder) return;
    setIsDownloading(true);
    
    setTimeout(() => {
      let text = `====================================================\n`;
      text += `              THREAD DEN STREETWEAR\n`;
      text += `        TAX INVOICE & OFFICIAL PAYMENT RECEIPT\n`;
      text += `====================================================\n\n`;
      text += `Invoice ID:     ${createdOrder.id}\n`;
      text += `Date & Time:    ${createdOrder.createdAt}\n`;
      text += `Transaction ID: ${createdOrder.transactionId}\n`;
      text += `Payment Method: ${createdOrder.paymentMethod}\n`;
      text += `Payment Status: PAID - SUCCESS ✅\n\n`;
      text += `----------------------------------------------------\n`;
      text += `CUSTOMER DETAILS\n`;
      text += `----------------------------------------------------\n`;
      text += `Name:           ${createdOrder.customerName}\n`;
      text += `Phone:          ${createdOrder.customerPhone}\n`;
      text += `Delivery Option: ${createdOrder.deliveryMethod === "delivery" ? "Hand Delivery" : "Local Pickup"}\n`;
      if (createdOrder.customerAddress) {
        text += `Delivery Address: ${createdOrder.customerAddress}\n`;
      }
      text += `\n----------------------------------------------------\n`;
      text += `PURCHASED STREETWEAR ITEMS\n`;
      text += `----------------------------------------------------\n`;
      
      createdOrder.items.forEach((item, idx) => {
        text += `${idx + 1}. ${item.productName}\n`;
        text += `   Size: ${item.size} | Color: ${item.color}\n`;
        text += `   Qty: ${item.quantity} x ${currencySymbol}${item.price} = ${currencySymbol}${item.price * item.quantity}\n`;
      });
      
      text += `\n----------------------------------------------------\n`;
      text += `BILL BREAKDOWN\n`;
      text += `----------------------------------------------------\n`;
      text += `Subtotal:       ${currencySymbol}${(createdOrder.totalAmount - (createdOrder.deliveryMethod === "delivery" ? 100 : 0)).toLocaleString()}\n`;
      text += `Delivery Fee:   ${createdOrder.deliveryMethod === "delivery" ? `${currencySymbol}100` : "Free"}\n`;
      text += `GST (5% Incl):  ${currencySymbol}${Math.round(createdOrder.totalAmount * 0.0476).toLocaleString()}\n`;
      text += `Grand Total:    ${currencySymbol}${createdOrder.totalAmount.toLocaleString()}\n\n`;
      text += `====================================================\n`;
      text += `Thank you for supporting Thread Den Streetwear!\n`;
      text += `====================================================\n`;

      const element = document.createElement("a");
      const file = new Blob([text], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `Thread_Den_Receipt_${createdOrder.id}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setIsDownloading(false);
    }, 1200);
  };

  // Store Owner Notification Message Formatters
  const getOwnerMessageText = (order: Order) => {
    let text = `🚨 *NEW ORDER ALERT FOR STORE OWNER*\n`;
    text += `-------------------------------------------\n`;
    text += `*Order ID:* \`${order.id}\`\n`;
    text += `*Order Date:* ${order.createdAt}\n`;
    text += `*Customer:* ${order.customerName}\n`;
    text += `*Customer Phone:* ${order.customerPhone}\n`;
    if (order.customerAddress) {
      text += `*Delivery Address:* ${order.customerAddress}\n`;
    } else {
      text += `*Logistics:* In-Person Depot Pick-up (Free)\n`;
    }
    text += `\n*🛒 Purchased Items:*\n`;
    order.items.forEach((item, idx) => {
      text += `${idx + 1}. *${item.productName}*\n`;
      text += `   Size: \`${item.size}\` | Color: \`${item.color}\` | Qty: ${item.quantity} x ${currencySymbol}${item.price} = ${currencySymbol}${item.price * item.quantity}\n`;
    });
    text += `\n-------------------------------------------\n`;
    text += `*Total Paid:* *${currencySymbol}${order.totalAmount}*\n`;
    text += `*Payment Method:* _${order.paymentMethod || "Online Gateway"}_\n`;
    text += `*Payment Status:* PAID ONLINE ✅\n`;
    text += `*Transaction ID:* \`${order.transactionId || "N/A"}\`\n`;
    text += `-------------------------------------------\n`;
    text += `Please process and dispatch this streetwear order.`;
    return text;
  };

  const getOwnerWhatsAppURL = (order: Order) => {
    const text = getOwnerMessageText(order);
    const sanitizedPhone = merchantWhatsApp.replace(/[^0-9]/g, "");
    return `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(text)}`;
  };

  const getOwnerSMSURL = (order: Order) => {
    const text = getOwnerMessageText(order);
    const sanitizedPhone = merchantWhatsApp.replace(/[^0-9]/g, "");
    return `sms:${sanitizedPhone}?body=${encodeURIComponent(text)}`;
  };

  // Prefill WhatsApp text with updated payment specifics
  const getWhatsAppReceiptURL = (order: Order) => {
    let text = `*🧾 INVOICE & RECEIPT - PAID ONLINE*\n`;
    text += `*THREAD DEN STOREFRONT*\n`;
    text += `-------------------------------------------\n`;
    text += `*Order ID:* \`${order.id}\`\n`;
    text += `*Date:* ${order.createdAt}\n`;
    text += `*Transaction ID:* \`${order.transactionId}\`\n`;
    text += `*Payment Method:* _${order.paymentMethod}_\n`;
    text += `*Status:* PAID ONLINE ✅\n\n`;
    text += `*👤 Customer:* ${order.customerName}\n`;
    text += `*📞 Phone:* ${order.customerPhone}\n`;
    if (order.customerAddress) {
      text += `*📍 Delivery Address:* ${order.customerAddress}\n`;
    } else {
      text += `*🏬 Option:* In-Person Pick-up (Free)\n`;
    }
    text += `\n*🛒 Streetwear Selections:*\n`;
    order.items.forEach((item, index) => {
      text += `${index + 1}. *${item.productName}*\n`;
      text += `   Size: \`${item.size}\` | Color: \`${item.color}\`\n`;
      text += `   Qty: ${item.quantity} x ${currencySymbol}${item.price} = ${currencySymbol}${item.price * item.quantity}\n`;
    });
    
    text += `\n-------------------------------------------\n`;
    text += `*Grand Total Paid:* *${currencySymbol}${order.totalAmount}*\n\n`;
    text += `Thank you for your booking! Secure online payment receipt generated successfully.`;

    const sanitizedPhone = merchantWhatsApp.replace(/[^0-9]/g, "");
    return `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(text)}`;
  };

  const handleCopyReceiptText = (order: Order) => {
    let text = `🧾 THREAD DEN TAX INVOICE [${order.id}]\n`;
    text += `Transaction ID: ${order.transactionId}\n`;
    text += `Payment: PAID via ${order.paymentMethod}\n`;
    text += `Customer: ${order.customerName} (${order.customerPhone})\n`;
    text += `Logistics: ${order.deliveryMethod === "delivery" ? `Delivery to ${order.customerAddress}` : "Local Depot Pickup"}\n\n`;
    order.items.forEach((item) => {
      text += `- ${item.productName} (Size: ${item.size}, Color: ${item.color}) x ${item.quantity} = ${currencySymbol}${item.price * item.quantity}\n`;
    });
    text += `\nTotal Paid: ${currencySymbol}${order.totalAmount}`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleResetAndClose = () => {
    setCreatedOrder(null);
    setIsAtPaymentPortal(false);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setCardName("");
    setUpiId("");
    setIsUpiVerified(false);
    setSelectedBank("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-in fade-in duration-200" id="cart-drawer-panel">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 backdrop-blur-xs transition-opacity ${
          isDark ? "bg-zinc-950/70" : "bg-zinc-950/40"
        }`} 
        onClick={handleResetAndClose} 
      />

      <div className={`relative w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l transition-all duration-300 ${
        isDark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
      }`}>
        
        {/* Drawer Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
          isDark ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-100 bg-white"
        }`}>
          <div className="flex items-center gap-2">
            {createdOrder ? (
              <Receipt className={`w-5 h-5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
            ) : (
              <ShoppingBag className={`w-5 h-5 ${isDark ? "text-white" : "text-zinc-950"}`} />
            )}
            <h2 className={`font-display font-bold text-lg ${isDark ? "text-white" : "text-zinc-900"}`}>
              {createdOrder ? "Payment Invoice Receipt" : isAtPaymentPortal ? "Secure Online Payment" : "Your Order Builder"}
            </h2>
          </div>
          <button
            onClick={handleResetAndClose}
            className={`p-1.5 rounded-full transition-colors border ${
              isDark 
                ? "hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800" 
                : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 border-zinc-150"
            }`}
            id="close-cart-button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-5 space-y-6">
          
          {createdOrder ? (
            /* ================= STEP 3: OFFICIAL RETAL INVOICE RECEIPT VIEW ================= */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              <div className="text-center space-y-2">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  isDark 
                    ? "bg-emerald-950/60 border border-emerald-900/40 text-emerald-400" 
                    : "bg-emerald-50 border border-emerald-100 text-emerald-600"
                }`}>
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <span className={`text-[10px] uppercase font-mono tracking-widest font-bold px-3 py-1 rounded-full ${
                  isDark ? "text-emerald-400 bg-emerald-950/60 border border-emerald-900/30" : "text-emerald-700 bg-emerald-50 border border-emerald-100"
                }`}>
                  Payment Success - Paid Online
                </span>
                <h3 className={`font-display font-bold text-xl mt-2 ${isDark ? "text-white" : "text-zinc-950"}`}>
                  Invoice for {createdOrder.customerName}
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Your payment has been successfully secured and the receipt has been cataloged.
                </p>
              </div>

              {/* STORE OWNER AUTOMATED MESSAGE NOTIFICATION CARD */}
              <div className={`p-4 rounded-2xl border ${
                isDark ? "bg-emerald-950/40 border-emerald-900/60 text-emerald-200" : "bg-emerald-50 border-emerald-200 text-emerald-900"
              } space-y-3 shadow-2xs`} id="owner-notification-message-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-emerald-400 animate-bounce" />
                    <span className="font-display font-bold text-xs uppercase tracking-wider">
                      Store Owner Notified via Message
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 border border-emerald-500/30">
                    {merchantWhatsApp}
                  </span>
                </div>

                <p className="text-[11px] leading-relaxed opacity-90">
                  An automated order notification message was prepared for the store owner (<strong className="font-mono">{merchantWhatsApp}</strong>) for Order <strong className="font-mono">#{createdOrder.id}</strong> ({currencySymbol}{createdOrder.totalAmount}).
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={getOwnerWhatsAppURL(createdOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-display font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98"
                    id="owner-whatsapp-direct-btn"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> WhatsApp Owner
                  </a>

                  <a
                    href={getOwnerSMSURL(createdOrder)}
                    className="py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-display font-bold text-[11px] flex items-center justify-center gap-1.5 border border-zinc-700 shadow-xs transition-all active:scale-98"
                    id="owner-sms-direct-btn"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-sky-400" /> Send SMS Message
                  </a>
                </div>
              </div>

              {/* PRINTABLE INVOICE BLOCK */}
              <div 
                id="print-invoice-receipt"
                className={`border rounded-2xl p-4 sm:p-5 relative overflow-hidden text-xs font-mono space-y-4 shadow-3xs ${
                  isDark ? "bg-zinc-950 border-zinc-850" : "bg-zinc-50 border-zinc-200"
                }`}
              >
                {/* Diagonal PAID stamp effect */}
                <div className="absolute right-4 top-2 pointer-events-none select-none opacity-20 transform rotate-12">
                  <div className="border-4 border-emerald-500 text-emerald-500 font-bold px-3 py-1.5 rounded text-base tracking-widest uppercase">
                    PAID ONLINE
                  </div>
                </div>

                <div className={`flex justify-between font-bold border-b pb-2.5 ${
                  isDark ? "border-zinc-850 text-white" : "border-zinc-200 text-zinc-900"
                }`}>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-mono">Invoice ID</div>
                    <div className="text-sm tracking-tight">{createdOrder.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-zinc-400 uppercase font-mono">Receipt Date</div>
                    <div className="text-xs">{createdOrder.createdAt.split(",")[0]}</div>
                  </div>
                </div>

                {/* Info Blocks Grid */}
                <div className="grid grid-cols-2 gap-3 text-[11px] py-1">
                  <div>
                    <span className="text-zinc-400 block uppercase font-mono text-[9px] mb-0.5">Transaction ID</span>
                    <span className={`font-semibold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{createdOrder.transactionId}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-400 block uppercase font-mono text-[9px] mb-0.5">Paid Via</span>
                    <span className={`font-semibold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{createdOrder.paymentMethod}</span>
                  </div>
                </div>

                <div className={`border-t pt-2 text-[11px] ${isDark ? "border-zinc-850" : "border-zinc-200"}`}>
                  <span className="text-zinc-400 block uppercase font-mono text-[9px] mb-1">Customer & Delivery</span>
                  <div className={`space-y-0.5 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                    <div><strong>Name:</strong> {createdOrder.customerName}</div>
                    <div><strong>Phone:</strong> {createdOrder.customerPhone}</div>
                    <div><strong>Method:</strong> {createdOrder.deliveryMethod === "delivery" ? "Hand Delivery" : "Local Pickup"}</div>
                    {createdOrder.customerAddress && (
                      <div className="truncate"><strong>Address:</strong> {createdOrder.customerAddress}</div>
                    )}
                  </div>
                </div>

                {/* Items List Table */}
                <div className={`border-t pt-3 space-y-2 ${isDark ? "border-zinc-850" : "border-zinc-200"}`}>
                  <span className="text-zinc-400 block uppercase font-mono text-[9px]">Sourced Streetwear items</span>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {createdOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start gap-4 text-[11px]">
                        <div className="min-w-0">
                          <span className={`font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{item.productName}</span>
                          <span className="text-zinc-500 block text-[10px] mt-0.5">Size: {item.size} | Color: {item.color}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-zinc-400">Qty {item.quantity}</span>
                          <span className={`block font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{currencySymbol}{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subtotals breakdown */}
                <div className={`border-t pt-2.5 space-y-1.5 text-[11px] ${
                  isDark ? "border-zinc-850" : "border-zinc-200"
                }`}>
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span>{currencySymbol}{(createdOrder.totalAmount - (createdOrder.deliveryMethod === "delivery" ? 100 : 0)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Logistics transit</span>
                    <span>{createdOrder.deliveryMethod === "delivery" ? `${currencySymbol}100` : "Free"}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 text-[10px]">
                    <span>GST (5% Included)</span>
                    <span>{currencySymbol}{Math.round(createdOrder.totalAmount * 0.0476).toLocaleString()}</span>
                  </div>
                  <div className={`flex justify-between text-sm font-bold pt-2 border-t border-dashed ${
                    isDark ? "border-zinc-850 text-white" : "border-zinc-200 text-zinc-950"
                  }`}>
                    <span>TOTAL SECURED</span>
                    <span className="font-mono text-emerald-500">{currencySymbol}{createdOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* QR Code Placeholder with Barcode lines */}
                <div className={`border-t pt-3 text-center ${isDark ? "border-zinc-850" : "border-zinc-200"}`}>
                  <div className="text-[10px] font-mono tracking-[4px] text-zinc-400 select-none">
                    |||| | ||| || ||| | |||
                  </div>
                  <span className="text-[8px] text-zinc-500 uppercase tracking-widest mt-0.5 block">Thread Den Digital Cryptographic Proof</span>
                </div>
              </div>

              {/* Receipt Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handlePrintReceipt}
                  className={`py-3 px-4 border rounded-xl font-display font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    isDark 
                      ? "border-zinc-800 hover:bg-zinc-800 text-white" 
                      : "border-zinc-200 hover:bg-zinc-50 text-zinc-800"
                  }`}
                  id="print-receipt-btn"
                >
                  <Printer className="w-4 h-4" />
                  Print Receipt
                </button>

                <button
                  onClick={handleDownloadReceipt}
                  disabled={isDownloading}
                  className={`py-3 px-4 border rounded-xl font-display font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    isDark 
                      ? "border-zinc-800 hover:bg-zinc-800 text-white" 
                      : "border-zinc-200 hover:bg-zinc-50 text-zinc-800"
                  }`}
                  id="download-receipt-btn"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Save Invoice
                    </>
                  )}
                </button>
              </div>

              {/* Instant WhatsApp Share / Copy buttons */}
              <div className="space-y-2">
                <a
                  href={getWhatsAppReceiptURL(createdOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-display font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
                  id="whatsapp-paid-redirect-btn"
                >
                  <PhoneCall className="w-4 h-4 shrink-0" />
                  Share Invoice via WhatsApp
                </a>

                <button
                  onClick={() => handleCopyReceiptText(createdOrder)}
                  className={`w-full py-2.5 border text-xs flex items-center justify-center gap-2 transition-all rounded-xl font-display font-semibold ${
                    isDark 
                      ? "border-zinc-800 hover:bg-zinc-800 text-zinc-300" 
                      : "border-zinc-200 hover:bg-zinc-50 text-zinc-700"
                  }`}
                >
                  {copiedText ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      Invoice Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Bill to Clipboard
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleResetAndClose}
                className={`text-xs font-semibold underline block mx-auto pt-2 ${
                  isDark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-900"
                }`}
                id="continue-shopping-btn"
              >
                Close & Continue Browsing
              </button>
            </div>

          ) : isAtPaymentPortal ? (
            /* ================= STEP 2: INTERACTIVE ONLINE PAYMENT PORTAL ================= */
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/20">
                <button
                  type="button"
                  onClick={() => setIsAtPaymentPortal(false)}
                  className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                    isDark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Details
                </button>
                <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-semibold uppercase">
                  <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
                  Secure 256-Bit Gateway
                </div>
              </div>

              {/* Order total header summary */}
              <div className={`p-4 rounded-2xl text-center border ${
                isDark ? "bg-zinc-950 border-zinc-850" : "bg-zinc-50 border-zinc-150"
              }`}>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-mono">Amount to Securely Pay</span>
                <span className={`text-2xl font-bold block mt-1 tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
                  {currencySymbol}{totalAmount.toLocaleString()}
                </span>
                <span className="text-[10px] text-zinc-500 mt-1 block">Includes {cart.length} item(s) + transit</span>
              </div>

              {/* Payment Methods Tabs selector */}
              <div className={`grid grid-cols-3 gap-1.5 p-1 rounded-xl border ${
                isDark ? "bg-zinc-950 border-zinc-850" : "bg-zinc-50 border-zinc-150"
              }`}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("qr_upi")}
                  className={`py-2 text-[11px] font-semibold rounded-lg flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === "qr_upi"
                      ? isDark 
                        ? "bg-zinc-900 text-white shadow-sm border border-zinc-800 font-bold"
                        : "bg-white text-zinc-950 shadow-sm border border-zinc-200/50 font-bold"
                      : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                  id="pay-tab-qr-upi"
                >
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  Razorpay QR
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`py-2 text-[11px] font-semibold rounded-lg flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === "card"
                      ? isDark 
                        ? "bg-zinc-900 text-white shadow-sm border border-zinc-800 font-bold"
                        : "bg-white text-zinc-950 shadow-sm border border-zinc-200/50 font-bold"
                      : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                  id="pay-tab-card"
                >
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("netbanking")}
                  className={`py-2 text-[11px] font-semibold rounded-lg flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === "netbanking"
                      ? isDark 
                        ? "bg-zinc-900 text-white shadow-sm border border-zinc-800 font-bold"
                        : "bg-white text-zinc-950 shadow-sm border border-zinc-200/50 font-bold"
                      : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                  id="pay-tab-netbanking"
                >
                  <Building2 className="w-4 h-4 text-sky-400" />
                  Net Banking
                </button>
              </div>

              {/* PAYMENT INPUT DETAILS SCREEN */}
              <form onSubmit={handleExecutePayment} className="space-y-4">
                
                {paymentMethod === "qr_upi" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {/* Sub-mode selector: QR Scan vs UPI ID */}
                    <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800 text-[11px] font-mono">
                      <button
                        type="button"
                        onClick={() => setUpiSubMode("qr")}
                        className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                          upiSubMode === "qr"
                            ? "bg-emerald-500 text-zinc-950 shadow-sm"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5" /> Scan Razorpay QR Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpiSubMode("id")}
                        className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                          upiSubMode === "id"
                            ? "bg-emerald-500 text-zinc-950 shadow-sm"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" /> Enter UPI VPA ID
                      </button>
                    </div>

                    {upiSubMode === "qr" ? (
                      /* DYNAMIC RAZORPAY QR SCAN DISPLAY MODULE */
                      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-3.5 relative overflow-hidden">
                        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs font-mono">
                              RZP
                            </div>
                            <span className="font-display font-bold text-xs text-white uppercase tracking-wider">
                              Razorpay Dynamic QR
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            <Clock className="w-3 h-3" />
                            <span>Expires in 04:52</span>
                          </div>
                        </div>

                        {/* High-Resolution Razorpay Interactive QR Card */}
                        <div className="relative inline-block p-3.5 rounded-2xl bg-white border-2 border-emerald-500 shadow-xl group">
                          {/* Inner Mock QR pattern */}
                          <div className="w-36 h-36 mx-auto bg-zinc-950 p-2 rounded-xl flex flex-col justify-between items-center relative overflow-hidden">
                            {/* Corner Positioning Squares */}
                            <div className="w-full flex justify-between">
                              <div className="w-7 h-7 border-4 border-emerald-400 bg-zinc-950 flex items-center justify-center">
                                <div className="w-2.5 h-2.5 bg-white" />
                              </div>
                              <div className="w-7 h-7 border-4 border-emerald-400 bg-zinc-950 flex items-center justify-center">
                                <div className="w-2.5 h-2.5 bg-white" />
                              </div>
                            </div>

                            {/* Center Razorpay Logo / Icon */}
                            <div className="my-auto text-center">
                              <div className="px-2 py-1 bg-emerald-500 text-zinc-950 rounded font-mono font-black text-[9px] uppercase tracking-tighter">
                                RZP PAY
                              </div>
                              <span className="text-[8px] font-mono text-zinc-400 block mt-1">
                                {currencySymbol}{totalAmount}
                              </span>
                            </div>

                            {/* Bottom Corner Square */}
                            <div className="w-full flex justify-between items-end">
                              <div className="w-7 h-7 border-4 border-emerald-400 bg-zinc-950 flex items-center justify-center">
                                <div className="w-2.5 h-2.5 bg-white" />
                              </div>
                              <div className="text-[7px] font-mono text-emerald-400 font-bold">
                                256-BIT SSL
                              </div>
                            </div>
                          </div>

                          {/* Scan overlay text */}
                          <span className="block text-[10px] font-mono font-bold text-zinc-800 mt-2">
                            Scan with GPay, PhonePe, Paytm or BHIM
                          </span>
                        </div>

                        {/* Supported Apps Badges */}
                        <div className="flex items-center justify-center gap-2 pt-1">
                          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-zinc-400 font-bold">
                            GPay
                          </span>
                          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-zinc-400 font-bold">
                            PhonePe
                          </span>
                          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-zinc-400 font-bold">
                            Paytm
                          </span>
                          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-zinc-400 font-bold">
                            BHIM UPI
                          </span>
                        </div>

                        <p className="text-[10px] text-zinc-400 leading-snug">
                          Scan the dynamic Razorpay QR code above with any UPI mobile payment app. Once paid, click below to confirm settlement.
                        </p>
                      </div>
                    ) : (
                      /* DIRECT UPI ID INPUT */
                      <div className="space-y-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Enter your registered VPA UPI address to receive an instant Razorpay collect request on your app.
                        </p>

                        <div className="space-y-2">
                          <label className={`block text-[10px] font-mono uppercase font-semibold ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                            UPI VPA Address (Virtual Payment Address)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              required={paymentMethod === "qr_upi" && upiSubMode === "id"}
                              placeholder="e.g. mobile@okicici or name@upi"
                              value={upiId}
                              onChange={(e) => {
                                setUpiId(e.target.value);
                                setIsUpiVerified(false);
                              }}
                              className={`flex-grow px-3 py-2 text-xs rounded-xl focus:ring-1 outline-none transition-all font-mono font-medium ${
                                isDark 
                                  ? "bg-zinc-900 hover:bg-zinc-850 focus:bg-zinc-950 text-zinc-100 border-zinc-800 focus:border-white" 
                                  : "bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white text-zinc-900 border-zinc-200 focus:border-zinc-950"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={handleVerifyUpi}
                              disabled={isUpiVerifying || isUpiVerified}
                              className={`px-3 text-xs font-semibold rounded-xl border transition-all ${
                                isUpiVerified 
                                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/60 font-bold"
                                  : isDark 
                                    ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300" 
                                    : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-800"
                              }`}
                            >
                              {isUpiVerifying ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : isUpiVerified ? (
                                "Verified ✓"
                              ) : (
                                "Verify VPA"
                              )}
                            </button>
                          </div>
                          
                          {isUpiVerified && (
                            <div className="text-[10px] text-emerald-500 flex items-center gap-1 font-semibold animate-in slide-in-from-top-1">
                              <Check className="w-3.5 h-3.5" />
                              VPA verified via Razorpay banking directory.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod === "card" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    
                    {/* SLEEK CREDIT CARD VISUAL TEMPLATE MOCKUP */}
                    <div className="w-full h-44 rounded-2xl p-5 relative overflow-hidden text-white shadow-lg bg-gradient-to-br from-zinc-900 via-indigo-950 to-zinc-900 border border-zinc-800 flex flex-col justify-between">
                      {/* Abstract background mesh */}
                      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/30 pointer-events-none" />
                      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-indigo-500/10 blur-xl" />
                      
                      {/* Top Bar of Mock Card */}
                      <div className="flex justify-between items-start z-10">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider font-mono text-indigo-200">Razorpay Card Gateway</span>
                          <span className="block text-xs font-bold font-display mt-0.5">Thread Den Payment Node</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-mono font-bold text-xs border border-white/20 select-none">
                          CC
                        </div>
                      </div>

                      {/* Card Chip Mockup and Contactless symbol */}
                      <div className="flex items-center gap-2 z-10">
                        <div className="w-8 h-6 bg-amber-400/80 rounded-md border border-amber-500/40 relative overflow-hidden">
                          <div className="absolute inset-x-0 top-2 h-[1px] bg-zinc-900/20" />
                          <div className="absolute inset-x-0 bottom-2 h-[1px] bg-zinc-900/20" />
                          <div className="absolute inset-y-0 left-3 w-[1px] bg-zinc-900/20" />
                        </div>
                        <span className="text-white/40 text-[9px] font-mono leading-none tracking-widest">((( SECURE )))</span>
                      </div>

                      {/* Card Number Mock */}
                      <div className="z-10 font-mono text-sm tracking-[2px] mt-2 font-bold select-none text-white/95">
                        {cardNumber || "•••• •••• •••• ••••"}
                      </div>

                      {/* Cardholder name & Expiry */}
                      <div className="flex justify-between items-end z-10 font-mono text-[10px]">
                        <div>
                          <span className="text-white/40 block text-[7px] uppercase tracking-wider">Cardholder Name</span>
                          <span className="font-bold truncate max-w-[180px] block uppercase">
                            {cardName.trim() || "Your Name"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-white/40 block text-[7px] uppercase tracking-wider">Expiry</span>
                          <span className="font-bold">
                            {cardExpiry || "MM/YY"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Input card forms */}
                    <div className="space-y-3">
                      <div>
                        <label className={`block text-[10px] font-mono uppercase font-semibold mb-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Cardholder Name</label>
                        <input
                          type="text"
                          required={paymentMethod === "card"}
                          placeholder="e.g. John Doe"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className={`w-full px-3 py-2 text-xs rounded-xl focus:ring-1 outline-none transition-all font-medium ${
                            isDark 
                              ? "bg-zinc-950 hover:bg-zinc-850 focus:bg-zinc-950 text-zinc-100 border-zinc-800 focus:border-white focus:ring-white" 
                              : "bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white text-zinc-900 border-zinc-200 focus:border-zinc-950 focus:ring-zinc-950"
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-[10px] font-mono uppercase font-semibold mb-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Card Number</label>
                        <input
                          type="text"
                          required={paymentMethod === "card"}
                          placeholder="4111 2222 3333 4444"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className={`w-full px-3 py-2 text-xs rounded-xl focus:ring-1 outline-none transition-all font-medium font-mono ${
                            isDark 
                              ? "bg-zinc-950 hover:bg-zinc-850 focus:bg-zinc-950 text-zinc-100 border-zinc-800 focus:border-white focus:ring-white" 
                              : "bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white text-zinc-900 border-zinc-200 focus:border-zinc-950 focus:ring-zinc-950"
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-[10px] font-mono uppercase font-semibold mb-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Expiry Date</label>
                          <input
                            type="text"
                            required={paymentMethod === "card"}
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            className={`w-full px-3 py-2 text-xs rounded-xl focus:ring-1 outline-none transition-all font-medium font-mono ${
                              isDark 
                                ? "bg-zinc-950 hover:bg-zinc-850 focus:bg-zinc-950 text-zinc-100 border-zinc-800 focus:border-white focus:ring-white" 
                                : "bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white text-zinc-900 border-zinc-200 focus:border-zinc-950 focus:ring-zinc-950"
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[10px] font-mono uppercase font-semibold mb-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>CVV / CVN</label>
                          <input
                            type="password"
                            required={paymentMethod === "card"}
                            placeholder="•••"
                            value={cardCvv}
                            onChange={handleCvvChange}
                            className={`w-full px-3 py-2 text-xs rounded-xl focus:ring-1 outline-none transition-all font-medium font-mono ${
                              isDark 
                                ? "bg-zinc-950 hover:bg-zinc-850 focus:bg-zinc-950 text-zinc-100 border-zinc-800 focus:border-white focus:ring-white" 
                                : "bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white text-zinc-900 border-zinc-200 focus:border-zinc-950 focus:ring-zinc-950"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "netbanking" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Select your primary bank to redirect securely to your online banking portal via Razorpay.
                    </p>

                    <div>
                      <label className={`block text-[10px] font-mono uppercase font-semibold mb-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Choose Banking Outlet</label>
                      <select
                        required={paymentMethod === "netbanking"}
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className={`w-full px-3 py-2 text-xs rounded-xl focus:ring-1 outline-none transition-all font-semibold appearance-none cursor-pointer ${
                          isDark 
                            ? "bg-zinc-950 border-zinc-800 text-white focus:border-zinc-600" 
                            : "bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-zinc-950"
                        }`}
                      >
                        <option value="">-- Select Your Bank --</option>
                        <option value="HDFC Bank">HDFC Bank</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="State Bank of India">State Bank of India</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                        <option value="Punjab National Bank">Punjab National Bank</option>
                        <option value="Bank of Baroda">Bank of Baroda</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Submitting layer loader indicator */}
                {isPaying ? (
                  <div className={`p-5 rounded-2xl border text-center space-y-3 mt-4 ${
                    isDark ? "bg-zinc-950/60 border-zinc-800" : "bg-zinc-50 border-zinc-150"
                  }`}>
                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 font-mono">
                      <span>{payStatusText}</span>
                      <span>{payProgress}%</span>
                    </div>
                    {/* Linear Progress Bar */}
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${payProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500 block font-mono">Encryption active: TLS 1.3 | AES-256</span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className={`w-full mt-4 py-4 font-display font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 ${
                      isDark
                        ? "bg-white hover:bg-zinc-100 text-zinc-950"
                        : "bg-zinc-950 hover:bg-zinc-800 text-white"
                    }`}
                  >
                    <Lock className="w-4 h-4 shrink-0" />
                    Securely Pay {currencySymbol}{totalAmount.toLocaleString()}
                  </button>
                )}
              </form>
            </div>

          ) : cart.length === 0 ? (
            /* ================= STATE 0: EMPTY CART ================= */
            <div className="text-center py-12 space-y-4 animate-in fade-in duration-200">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto border ${
                isDark ? "bg-zinc-950 border-zinc-800 text-zinc-500" : "bg-zinc-50 border-zinc-150 text-zinc-400"
              }`}>
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className={`font-display font-bold text-sm ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>Your order is empty</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-[240px] mx-auto leading-relaxed">
                  Browse our high-quality imported t-shirts catalog and pick your custom specifications to get started.
                </p>
              </div>
            </div>
          ) : (
            /* ================= STEP 1: CART LIST & CLIENT DETAILS FORM ================= */
            <>
              {/* Product list */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-400">Selected T-Shirts</h3>
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-2xl border ${
                        isDark ? "bg-zinc-950 border-zinc-850" : "bg-zinc-50 border-zinc-200/50"
                      }`}
                      id={`cart-item-${item.id}`}
                    >
                      <div className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border ${
                        isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-200 border-zinc-150"
                      }`}>
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className={`text-xs font-bold truncate leading-snug ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{item.product.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                            isDark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-200 text-zinc-700"
                          }`}>
                            {item.selectedSize}
                          </span>
                          <span className={`flex items-center gap-1 text-[10px] ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                            <span
                              className={`w-2.5 h-2.5 rounded-full border block shrink-0 ${isDark ? "border-zinc-800" : "border-zinc-300"}`}
                              style={{ backgroundColor: item.selectedColor.hex }}
                            />
                            {item.selectedColor.name}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Toggles */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`font-mono font-bold text-xs ${isDark ? "text-white" : "text-zinc-950"}`}>
                          {currencySymbol}{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                        <div className={`flex items-center border rounded-lg overflow-hidden shadow-3xs ${
                          isDark ? "border-zinc-800 bg-zinc-900" : "border-zinc-200/80 bg-white"
                        }`}>
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className={`px-2 py-0.5 font-bold text-xs ${
                              isDark ? "text-zinc-400 hover:bg-zinc-850" : "text-zinc-500 hover:bg-zinc-100"
                            }`}
                          >
                            -
                          </button>
                          <span className={`px-1.5 text-xs font-mono font-semibold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className={`px-2 py-0.5 font-bold text-xs ${
                              isDark ? "text-zinc-400 hover:bg-zinc-850" : "text-zinc-500 hover:bg-zinc-100"
                            }`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Delete item */}
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1 text-zinc-400 hover:text-red-500 transition-colors shrink-0"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleCheckoutSubmit} className={`space-y-4 pt-4 border-t ${isDark ? "border-zinc-850" : "border-zinc-100"}`}>
                
                {/* Auth Gate Notification Card if Not Logged In */}
                {!currentUser && (
                  <div
                    className={`p-4 rounded-2xl border ${
                      isDark
                        ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                        : "bg-emerald-50/80 border-emerald-300 text-emerald-950"
                    } space-y-2.5 animate-in fade-in duration-200 shadow-sm`}
                    id="checkout-auth-gate-card"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-display font-bold text-xs uppercase tracking-wider text-emerald-400">
                          Sign In or Sign Up to Checkout
                        </span>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 border border-emerald-500/30">
                        OTP Verification
                      </span>
                    </div>

                    <p className="text-[11px] leading-relaxed opacity-90">
                      Shoppers verify via <strong>Mobile Number OTP</strong> or <strong>Email OTP</strong> to secure order receipts, track fulfillment, and complete checkout.
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenAuthModal) onOpenAuthModal("signup");
                          else if (onOpenAccountModal) onOpenAccountModal();
                        }}
                        className="py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-display font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                        id="cart-signup-otp-btn"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Sign Up with OTP</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenAuthModal) onOpenAuthModal("signin");
                          else if (onOpenAccountModal) onOpenAccountModal();
                        }}
                        className={`py-2 px-3 rounded-xl font-display font-bold text-xs flex items-center justify-center gap-1.5 border transition-all active:scale-95 cursor-pointer ${
                          isDark
                            ? "bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
                            : "bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-300"
                        }`}
                        id="cart-signin-btn"
                      >
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Sign In</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-400">
                    Order Delivery Details
                  </h3>
                  
                  {currentUser ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <UserCheck className="w-3 h-3 text-emerald-400" />
                      <span>{currentUser.name} (Verified)</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Guest Cart • Login at Checkout
                    </span>
                  )}
                </div>
                
                {/* Delivery Method Toggle */}
                <div className={`grid grid-cols-2 gap-2 p-1 rounded-xl border ${
                  isDark ? "bg-zinc-950 border-zinc-850" : "bg-zinc-50 border-zinc-150"
                }`}>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("pickup")}
                    className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      deliveryMethod === "pickup"
                        ? isDark 
                          ? "bg-zinc-900 text-white shadow-sm border border-zinc-850"
                          : "bg-white text-zinc-950 shadow-sm border border-zinc-200/50"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-350"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Local Pick-up (Free)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("delivery")}
                    className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      deliveryMethod === "delivery"
                        ? isDark
                          ? "bg-zinc-900 text-white shadow-sm border border-zinc-850"
                          : "bg-white text-zinc-950 shadow-sm border border-zinc-200/50"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-350"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Hand Delivery
                  </button>
                </div>

                {/* Input Fields */}
                <div className="space-y-3">
                  <div>
                    <label className={`block text-[10px] font-mono uppercase font-semibold mb-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={`w-full px-3 py-2.5 text-xs rounded-xl focus:ring-1 outline-none transition-all font-medium ${
                        isDark 
                          ? "bg-zinc-950 hover:bg-zinc-900 focus:bg-zinc-950 text-zinc-100 border-zinc-850 focus:border-white focus:ring-white" 
                          : "bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white text-zinc-900 border-zinc-200 focus:border-zinc-950 focus:ring-zinc-950"
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] font-mono uppercase font-semibold mb-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>WhatsApp / Contact Phone</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className={`w-full px-3 py-2.5 text-xs rounded-xl focus:ring-1 outline-none transition-all font-medium font-mono ${
                        isDark 
                          ? "bg-zinc-950 hover:bg-zinc-900 focus:bg-zinc-950 text-zinc-100 border-zinc-850 focus:border-white focus:ring-white" 
                          : "bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white text-zinc-900 border-zinc-200 focus:border-zinc-950 focus:ring-zinc-950"
                      }`}
                    />
                  </div>

                  {deliveryMethod === "delivery" && (
                    <div className="animate-in slide-in-from-top-2 duration-150 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className={`block text-[10px] font-mono uppercase font-semibold ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Local Delivery Address</label>
                      </div>

                      {/* Saved Addresses quick selection if logged in */}
                      {currentUser?.savedAddresses && currentUser.savedAddresses.length > 0 && (
                        <div className="space-y-1.5 mb-2">
                          <span className="text-[10px] text-zinc-400 font-medium">Select from saved addresses:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {currentUser.savedAddresses.map((addr) => {
                              const addrStr = `${addr.streetAddress}, ${addr.city}, ${addr.state} - ${addr.postalCode}`;
                              const isSelected = customerAddress === addrStr;
                              return (
                                <button
                                  key={addr.id}
                                  type="button"
                                  onClick={() => setCustomerAddress(addrStr)}
                                  className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                                    isSelected
                                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500 font-bold"
                                      : isDark
                                      ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                                      : "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200"
                                  }`}
                                >
                                  {addr.label} {addr.isDefault && "(Default)"}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <textarea
                        required
                        rows={2}
                        placeholder="Provide your building, sector, street name, or nearby landmark..."
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className={`w-full px-3 py-2 text-xs rounded-xl focus:ring-1 outline-none transition-all font-medium ${
                          isDark 
                            ? "bg-zinc-950 hover:bg-zinc-900 focus:bg-zinc-950 text-zinc-100 border-zinc-850 focus:border-white focus:ring-white" 
                            : "bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white text-zinc-900 border-zinc-200 focus:border-zinc-950 focus:ring-zinc-950"
                        }`}
                      />
                    </div>
                  )}
                </div>

                {/* Submit Trigger (hidden form trigger) */}
                <button type="submit" id="hidden-submit-btn" className="hidden" />
              </form>
            </>
          )}
        </div>

        {/* Drawer Footer */}
        {!createdOrder && !isAtPaymentPortal && cart.length > 0 && (
          <div className={`p-4 sm:p-5 border-t space-y-4 shrink-0 ${
            isDark ? "border-zinc-850 bg-zinc-950/60" : "border-zinc-100 bg-zinc-50/60"
          }`}>
            {/* Calculation details */}
            <div className="space-y-1.5 text-xs font-medium">
              <div className="flex justify-between text-zinc-500">
                <span>Custom Order Subtotal</span>
                <span className={`font-mono ${isDark ? "text-zinc-300" : "text-zinc-800"}`}>{currencySymbol}{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Local Transit/Delivery</span>
                <span className={`font-mono ${isDark ? "text-zinc-300" : "text-zinc-800"}`}>
                  {deliveryMethod === "delivery" ? `${currencySymbol}${deliveryFee}` : "Free Pick-up"}
                </span>
              </div>
              <div className={`flex justify-between text-sm pt-2 border-t font-bold ${
                isDark ? "border-zinc-800 text-white" : "border-zinc-200 text-zinc-900"
              }`}>
                <span>Grand Total Due</span>
                <span className="font-mono text-base">{currencySymbol}{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Submit checkout buttons */}
            {!currentUser ? (
              <button
                type="button"
                onClick={() => {
                  if (onOpenAuthModal) onOpenAuthModal("signup");
                  else if (onOpenAccountModal) onOpenAccountModal();
                }}
                className={`w-full py-4 font-display font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer ${
                  isDark
                    ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black shadow-emerald-500/20"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                }`}
                id="submit-order-button"
              >
                <Lock className="w-4 h-4 shrink-0" />
                <span>Login or Sign Up to Checkout</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            ) : (
              <button
                onClick={() => {
                  const btn = document.getElementById("hidden-submit-btn");
                  if (btn) btn.click();
                }}
                disabled={isSubmitting}
                className={`w-full py-4 font-display font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer ${
                  isDark
                    ? "bg-white hover:bg-zinc-100 text-zinc-950 font-black disabled:bg-zinc-800 disabled:text-zinc-600"
                    : "bg-zinc-950 hover:bg-zinc-800 text-white disabled:bg-zinc-400"
                }`}
                id="submit-order-button"
              >
                <Send className="w-4 h-4 shrink-0" />
                <span>Proceed to Online Payment</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
