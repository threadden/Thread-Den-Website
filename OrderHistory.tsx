import React, { useState, useMemo } from "react";
import { 
  Search, Filter, Calendar, User, Phone, MapPin, 
  ShoppingBag, ChevronDown, ChevronUp, ExternalLink, 
  CheckCircle, Clock, XCircle, AlertCircle, RefreshCw
} from "lucide-react";
import { Order } from "../types";

interface OrderHistoryProps {
  orders: Order[];
  currencySymbol: string;
  theme: "dark" | "light";
}

export default function OrderHistory({ orders, currencySymbol, theme }: OrderHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deliveryFilter, setDeliveryFilter] = useState<string>("all");
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});

  const isDark = theme === "dark";

  const toggleRow = (orderId: string) => {
    setExpandedOrderIds((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const toggleAllRows = (expand: boolean) => {
    if (expand) {
      const all: Record<string, boolean> = {};
      filteredOrders.forEach((o) => {
        all[o.id] = true;
      });
      setExpandedOrderIds(all);
    } else {
      setExpandedOrderIds({});
    }
  };

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = 
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerPhone.includes(searchTerm) ||
        (o.customerAddress && o.customerAddress.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      const matchesDelivery = deliveryFilter === "all" || o.deliveryMethod === deliveryFilter;

      return matchesSearch && matchesStatus && matchesDelivery;
    });
  }, [orders, searchTerm, statusFilter, deliveryFilter]);

  // Aggregated Stats for current filtered set
  const stats = useMemo(() => {
    const total = filteredOrders.length;
    const completedVal = filteredOrders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const totalVal = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    
    return {
      total,
      completedVal,
      totalVal,
    };
  }, [filteredOrders]);

  const getStatusStyle = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return {
          bg: isDark ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/40" : "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <CheckCircle className="w-3.5 h-3.5" />,
          label: "Completed (Paid)",
        };
      case "confirmed":
        return {
          bg: isDark ? "bg-blue-950/20 text-blue-400 border-blue-900/40" : "bg-blue-50 text-blue-700 border-blue-200",
          icon: <CheckCircle className="w-3.5 h-3.5" />,
          label: "Confirmed",
        };
      case "cancelled":
        return {
          bg: isDark ? "bg-red-950/20 text-red-400 border-red-900/40" : "bg-red-50 text-red-700 border-red-200",
          icon: <XCircle className="w-3.5 h-3.5" />,
          label: "Cancelled",
        };
      case "pending":
      default:
        return {
          bg: isDark ? "bg-amber-950/20 text-amber-400 border-amber-900/40" : "bg-amber-50 text-amber-700 border-amber-200",
          icon: <Clock className="w-3.5 h-3.5" />,
          label: "Pending",
        };
    }
  };

  return (
    <div className="space-y-6" id="order-history-viewport">
      {/* Search and Filters Header bar */}
      <div className={`border p-5 rounded-3xl shadow-3xs space-y-4 transition-all duration-300 ${
        isDark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className={`font-display font-bold text-lg ${isDark ? "text-white" : "text-zinc-950"}`}>Merchant Ledger & Order History</h3>
            <p className="text-zinc-500 text-xs mt-0.5">
              A comprehensive list of past transactions, direct customer bookings, and order statuses.
            </p>
          </div>

          <div className="flex gap-2 self-start md:self-auto">
            <button
              onClick={() => toggleAllRows(true)}
              className={`px-3 py-1.5 border text-[10px] font-mono rounded-lg transition-all ${
                isDark ? "border-zinc-850 hover:bg-zinc-950 text-zinc-300" : "border-zinc-200 hover:bg-zinc-50 text-zinc-600"
              }`}
            >
              Expand All
            </button>
            <button
              onClick={() => toggleAllRows(false)}
              className={`px-3 py-1.5 border text-[10px] font-mono rounded-lg transition-all ${
                isDark ? "border-zinc-850 hover:bg-zinc-950 text-zinc-300" : "border-zinc-200 hover:bg-zinc-50 text-zinc-600"
              }`}
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Inputs & Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          {/* Search */}
          <div className="sm:col-span-6 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by Order ID, customer name, phone, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 border rounded-xl text-xs outline-none transition-all placeholder:text-zinc-400 font-medium ${
                isDark 
                  ? "bg-zinc-950 border-zinc-800 text-white focus:border-zinc-600" 
                  : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-950"
              }`}
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
              <Filter className="w-3.5 h-3.5" />
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full pl-9 pr-8 py-2 border rounded-xl text-xs outline-none transition-all font-semibold appearance-none cursor-pointer ${
                isDark 
                  ? "bg-zinc-950 border-zinc-800 text-white focus:border-zinc-600" 
                  : "bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-zinc-950"
              }`}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed (Paid)</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Delivery Method Filter */}
          <div className="sm:col-span-3 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
              <ShoppingBag className="w-3.5 h-3.5" />
            </span>
            <select
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value)}
              className={`w-full pl-9 pr-8 py-2 border rounded-xl text-xs outline-none transition-all font-semibold appearance-none cursor-pointer ${
                isDark 
                  ? "bg-zinc-950 border-zinc-800 text-white focus:border-zinc-600" 
                  : "bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-zinc-950"
              }`}
            >
              <option value="all">All Logistics</option>
              <option value="pickup">In-Person Pick-up</option>
              <option value="delivery">Delivery Requested</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Aggregate metrics sub-rib */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`border p-4 rounded-2xl transition-all duration-300 ${isDark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"}`}>
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Found Count</span>
          <span className={`text-lg font-bold font-mono block mt-0.5 ${isDark ? "text-white" : "text-zinc-900"}`}>{stats.total} orders</span>
          <span className="text-[9px] text-zinc-400 block mt-0.5">Matching active filters</span>
        </div>

        <div className={`border p-4 rounded-2xl transition-all duration-300 ${isDark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"}`}>
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Filtered Volume</span>
          <span className={`text-lg font-bold font-mono block mt-0.5 ${isDark ? "text-white" : "text-zinc-900"}`}>{currencySymbol}{stats.totalVal.toLocaleString()}</span>
          <span className="text-[9px] text-zinc-400 block mt-0.5">Total face-value</span>
        </div>

        <div className={`border p-4 rounded-2xl transition-all duration-300 ${isDark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"}`}>
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Completed Revenue</span>
          <span className="text-lg font-bold font-mono text-emerald-600 block mt-0.5">{currencySymbol}{stats.completedVal.toLocaleString()}</span>
          <span className="text-[9px] text-zinc-400 block mt-0.5">Paid & completed bookings</span>
        </div>

        <div className={`border p-4 rounded-2xl transition-all duration-300 ${isDark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"}`}>
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Outstanding Value</span>
          <span className="text-lg font-bold font-mono text-amber-600 block mt-0.5">
            {currencySymbol}{(stats.totalVal - stats.completedVal).toLocaleString()}
          </span>
          <span className="text-[9px] text-zinc-400 block mt-0.5">Pending, confirmed, or cancelled</span>
        </div>
      </div>

      {/* Order History Table Container */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-zinc-200 rounded-3xl space-y-4">
          <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="font-display font-semibold text-sm text-zinc-700">No matching records found</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
              We couldn't find any orders matching your current search terms or selected filters.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-3xs" id="history-table-container">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 text-[10px] font-mono uppercase tracking-wider font-semibold">
                  <th className="p-4 w-10"></th>
                  <th className="p-4">Order ID & Timestamp</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">View Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
                {filteredOrders.map((order) => {
                  const isExpanded = !!expandedOrderIds[order.id];
                  const totalItemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  const statusInfo = getStatusStyle(order.status);

                  return (
                    <React.Fragment key={order.id}>
                      {/* Main Row */}
                      <tr 
                        onClick={() => toggleRow(order.id)}
                        className={`hover:bg-zinc-50/75 cursor-pointer transition-colors ${
                          isExpanded ? "bg-zinc-50/40" : ""
                        }`}
                      >
                        {/* Toggle Arrow */}
                        <td className="p-4 text-center">
                          <button className="text-zinc-400 hover:text-zinc-900 transition-colors">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* ID & Timestamp */}
                        <td className="p-4">
                          <div className="space-y-1">
                            <span className="font-mono font-bold text-zinc-900 block">{order.id}</span>
                            <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                              <Calendar className="w-3 h-3 text-zinc-400" />
                              {order.createdAt}
                            </span>
                          </div>
                        </td>

                        {/* Customer Info */}
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <div className="font-bold text-zinc-900 flex items-center gap-1">
                              <User className="w-3 h-3 text-zinc-400" />
                              {order.customerName}
                            </div>
                            <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                              <Phone className="w-3 h-3 text-zinc-400" />
                              {order.customerPhone}
                            </div>
                          </div>
                        </td>

                        {/* Logistics Method */}
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                            order.deliveryMethod === "delivery"
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                          }`}>
                            {order.deliveryMethod === "delivery" ? "Delivery" : "Pick-up"}
                          </span>
                        </td>

                        {/* Unit Count */}
                        <td className="p-4 font-mono font-semibold text-zinc-600">
                          {totalItemsCount} {totalItemsCount === 1 ? "shirt" : "shirts"}
                        </td>

                        {/* Order Total Amount */}
                        <td className="p-4">
                          <span className="font-mono font-bold text-zinc-900 text-sm">
                            {currencySymbol}{order.totalAmount.toLocaleString()}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border ${statusInfo.bg}`}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                        </td>

                        {/* Row action click indicator */}
                        <td className="p-4 text-right">
                          <span className="text-[10px] text-zinc-400 hover:text-zinc-900 transition-colors inline-flex items-center gap-1 font-semibold">
                            {isExpanded ? "Hide Details" : "Show Details"}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Sub-Row Detail Drawer */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="p-0 bg-zinc-50 border-t border-b border-zinc-150">
                            <div className="p-6 space-y-4 text-zinc-700 animate-in fade-in slide-in-from-top-1 duration-150">
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                {/* Ordered Products Specs */}
                                <div className="md:col-span-7 space-y-3">
                                  <h4 className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                                    <ShoppingBag className="w-3.5 h-3.5 text-zinc-500" />
                                    Purchased Style Specifications
                                  </h4>
                                  <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden divide-y divide-zinc-100">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="p-3 sm:px-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                                        <div className="space-y-1">
                                          <p className="font-bold text-zinc-900 text-xs">{item.productName}</p>
                                          <div className="flex flex-wrap gap-2 text-[10px] font-mono text-zinc-500">
                                            <span>Size: <strong className="text-zinc-700 font-bold">{item.size}</strong></span>
                                            <span>•</span>
                                            <span>Color: <strong className="text-zinc-700 font-bold">{item.color}</strong></span>
                                          </div>
                                        </div>
                                        <div className="text-right pl-4">
                                          <span className="font-mono text-zinc-800 font-bold text-xs">
                                            {item.quantity}x @ {currencySymbol}{item.price}
                                          </span>
                                          <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                                            Total: {currencySymbol}{(item.quantity * item.price).toLocaleString()}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Logistics Details */}
                                <div className="md:col-span-5 space-y-4">
                                  <div className="space-y-2">
                                    <h4 className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                                      Delivery / In-Person Pick-up Info
                                    </h4>
                                    <div className="bg-white border border-zinc-200 p-4 rounded-2xl space-y-3 text-xs text-zinc-800">
                                      <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                                        <span className="text-zinc-400 font-medium">Logistics Method</span>
                                        <span className="font-bold text-zinc-850">
                                          {order.deliveryMethod === "delivery" ? "Home Delivery" : "In-Person Pick-up"}
                                        </span>
                                      </div>

                                      <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                                        <span className="text-zinc-400 font-medium">Payment Status</span>
                                        <span className={`font-bold px-2 py-0.5 rounded-[6px] text-[9px] uppercase tracking-wider ${
                                          order.paymentStatus === "paid"
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                            : "bg-amber-50 text-amber-700 border border-amber-100"
                                        }`}>
                                          {order.paymentStatus === "paid" ? "Paid Online ✓" : "Offline Payment Pending"}
                                        </span>
                                      </div>

                                      {order.paymentStatus === "paid" && (
                                        <>
                                          <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                                            <span className="text-zinc-400 font-medium">Payment Channel</span>
                                            <span className="font-semibold text-zinc-800 text-[10px]">{order.paymentMethod}</span>
                                          </div>
                                          <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                                            <span className="text-zinc-400 font-medium">Transaction ID</span>
                                            <span className="font-mono text-zinc-600 select-all font-semibold text-[10px]">{order.transactionId}</span>
                                          </div>
                                        </>
                                      )}

                                      {order.deliveryMethod === "delivery" && order.customerAddress ? (
                                        <div className="pt-1">
                                          <span className="text-zinc-400 font-medium block mb-1">Destination Address</span>
                                          <p className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-zinc-700 leading-relaxed font-semibold">
                                            {order.customerAddress}
                                          </p>
                                        </div>
                                      ) : (
                                        <p className="text-[11px] text-zinc-400 italic pt-1">
                                          Customer opted to pick up the shipment batch directly from your physical hub. No home shipping required.
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Quick Contact Reseller Helper */}
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex-grow py-2 px-4 bg-zinc-950 hover:bg-zinc-800 text-white font-display font-semibold text-xs rounded-xl text-center flex items-center justify-center gap-2 transition-all shadow-3xs"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                      Chat on WhatsApp
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
