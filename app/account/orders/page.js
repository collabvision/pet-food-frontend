"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package, FileText, RefreshCcw, Heart, Bell, ArrowRight,
  Search, X, Check, Truck, Headphones
} from "lucide-react";
import { orderService, returnService } from "@/lib/services";

/* ─── Status helpers ───────────────────────────────────── */
const STATUS_CONFIG = {
  PENDING:           { label: "Pending",           color: "bg-amber-100 text-amber-700",  dot: "bg-amber-500" },
  CONFIRMED:         { label: "Confirmed",         color: "bg-blue-100 text-blue-700",    dot: "bg-blue-500" },
  PROCESSING:        { label: "Processing",        color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  SHIPPED:           { label: "Shipped",           color: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-500" },
  DELIVERED:         { label: "Delivered",          color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  CANCELLED:         { label: "Cancelled",         color: "bg-red-100 text-red-700",      dot: "bg-red-500" },
  RETURN_REQUESTED:  { label: "Return Requested",  color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  RETURNED:          { label: "Returned",          color: "bg-gray-100 text-gray-700",    dot: "bg-gray-500" },
};

const TIMELINE_STEPS_NORMAL = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
const TIMELINE_STEPS_CANCELLED = ["PENDING", "CANCELLED"];
const TIMELINE_STEPS_RETURN = ["DELIVERED", "RETURN_REQUESTED", "RETURNED"];

function getTimelineSteps(order) {
  if (order.orderStatus === "CANCELLED") return TIMELINE_STEPS_CANCELLED;
  if (["RETURN_REQUESTED", "RETURNED"].includes(order.orderStatus)) return TIMELINE_STEPS_RETURN;
  return TIMELINE_STEPS_NORMAL;
}

function getStepDate(order, status) {
  const entry = order.statusHistory?.find(h => h.status === status);
  if (!entry) return null;
  return new Date(entry.changedAt);
}

function formatShortDate(date) {
  if (!date) return "Pending";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}



/* ─── Filter tabs ──────────────────────────────────────── */
const FILTER_TABS = [
  { key: "ALL",        label: "All Orders" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED",    label: "Shipped" },
  { key: "DELIVERED",  label: "Delivered" },
  { key: "CANCELLED",  label: "Cancelled" },
];

/* ─── Main Component ──────────────────────────────────── */
export default function MyOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [expandedItems, setExpandedItems] = useState({});

  // Cancel modal
  const [cancelModal, setCancelModal] = useState({ open: false, orderId: null, reason: "" });
  const [cancelLoading, setCancelLoading] = useState(false);

  // Return modal
  const [returnModal, setReturnModal] = useState({ open: false, order: null, reason: "", comments: "", items: [] });
  const [returnLoading, setReturnLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await orderService.getMyOrders();
      setOrders(res?.data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* ─── Filtering & sorting ─── */
  const filteredOrders = orders
    .filter(o => {
      if (activeFilter !== "ALL" && o.orderStatus !== activeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          o.orderNumber?.toLowerCase().includes(q) ||
          o.items?.some(i => i.name?.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "latest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "amount_high") return b.totalAmount - a.totalAmount;
      if (sortBy === "amount_low") return a.totalAmount - b.totalAmount;
      return 0;
    });

  const filterCounts = FILTER_TABS.map(tab => ({
    ...tab,
    count: tab.key === "ALL" ? orders.length : orders.filter(o => o.orderStatus === tab.key).length,
  }));

  /* ─── Cancel flow ─── */
  const handleCancelOrder = async () => {
    if (!cancelModal.orderId) return;
    try {
      setCancelLoading(true);
      await orderService.cancel(cancelModal.orderId, cancelModal.reason || "User requested cancellation");
      setCancelModal({ open: false, orderId: null, reason: "" });
      await fetchOrders();
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || "Failed to cancel order");
    } finally {
      setCancelLoading(false);
    }
  };

  /* ─── Return flow ─── */
  const openReturnModal = (order) => {
    const items = order.items.map(i => ({
      productId: i.productId,
      name: i.name,
      quantity: i.quantity,
      maxQuantity: i.quantity,
      selected: true,
    }));
    setReturnModal({ open: true, order, reason: "", comments: "", items });
  };

  const handleReturnRequest = async () => {
    const { order, reason, comments, items } = returnModal;
    const selectedItems = items.filter(i => i.selected).map(i => ({
      productId: i.productId,
      quantity: i.quantity,
    }));

    if (selectedItems.length === 0) {
      alert("Please select at least one item to return.");
      return;
    }
    if (!reason) {
      alert("Please select a reason for return.");
      return;
    }

    try {
      setReturnLoading(true);
      await returnService.request(order._id, reason, comments, selectedItems);
      setReturnModal({ open: false, order: null, reason: "", comments: "", items: [] });
      await fetchOrders();
      alert("Return request submitted successfully!");
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || "Failed to submit return request");
    } finally {
      setReturnLoading(false);
    }
  };

  const toggleExpandItems = (orderId) => {
    setExpandedItems(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const canCancel = (status) => ["PENDING", "CONFIRMED", "PROCESSING"].includes(status);
  const canReturn = (status) => status === "DELIVERED";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#142653]"></div>
      </div>
    );
  }

  return (
    <>
      <div>
        {/* Header */}
        <div className="mb-6">
            <h1 className="text-4xl font-black text-[#142653] mb-1 flex items-center gap-3">
              My Orders <Heart className="w-7 h-7 text-coral fill-coral" />
            </h1>
            <p className="text-[#142653]/60 font-medium">Track, manage and reorder your pet essentials.</p>
          </div>

          {/* Filter Tabs + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {filterCounts.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    activeFilter === tab.key
                      ? "bg-[#142653] text-white shadow-md"
                      : "bg-white text-[#142653]/70 border border-gray-200 hover:border-[#142653]/30"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your orders..."
                  className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all w-48"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-[#142653] outline-none focus:border-coral cursor-pointer"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount_high">Amount: High to Low</option>
                <option value="amount_low">Amount: Low to High</option>
              </select>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-orange-50">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-[#142653] mb-2">No orders found</h3>
              <p className="text-[#142653]/50 mb-6">
                {activeFilter !== "ALL" ? "No orders match this filter." : "You haven't placed any orders yet."}
              </p>
              <Link href="/products" className="bg-coral text-white px-8 py-3 rounded-full font-bold hover:bg-orange-500 transition-colors inline-flex items-center gap-2">
                Start Shopping <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PENDING;
                const timelineSteps = getTimelineSteps(order);
                const currentStepIdx = timelineSteps.indexOf(order.orderStatus);
                const isExpanded = expandedItems[order._id];
                const displayItems = isExpanded ? order.items : order.items.slice(0, 3);

                return (
                  <div key={order._id} className="bg-white rounded-3xl shadow-sm border border-orange-50 overflow-hidden">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 pb-0 gap-2">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-black text-[#142653] text-lg">Order #{order.orderNumber}</h3>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-[#142653]/50 mt-0.5 font-medium">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}, {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#142653]/50">Total Amount</p>
                        <p className="text-xl font-black text-[#142653]">₹{Number(order.totalAmount).toLocaleString("en-IN")}</p>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="px-5 py-4">
                      <div className="flex items-start justify-between relative">
                        {/* Line behind */}
                        <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200 z-0" />
                        <div
                          className="absolute top-3 left-0 h-0.5 z-0 transition-all"
                          style={{
                            width: `${Math.max(0, currentStepIdx) / (timelineSteps.length - 1) * 100}%`,
                            backgroundColor: order.orderStatus === "CANCELLED" ? "#ef4444" : "#10b981"
                          }}
                        />

                        {timelineSteps.map((step, idx) => {
                          let stepDate = getStepDate(order, step);
                          // For delivered in return timeline, fallback to order.deliveredAt if history entry not exact
                          if (step === "DELIVERED" && !stepDate && order.deliveredAt) {
                            stepDate = new Date(order.deliveredAt);
                          }
                          const isCompleted = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;
                          const isCancelled = step === "CANCELLED";
                          const isReturned = step === "RETURNED";
                          
                          let circleColor = "bg-white border-gray-300 text-gray-400";
                          let ringColor = "";
                          if (isCompleted) {
                              if (isCancelled) circleColor = "bg-red-500 border-red-500";
                              else if (isReturned) circleColor = "bg-gray-500 border-gray-500";
                              else if (step === "RETURN_REQUESTED") circleColor = "bg-purple-500 border-purple-500";
                              else circleColor = "bg-emerald-500 border-emerald-500";
                          }
                          
                          if (isCurrent) {
                              if (isCancelled) ringColor = "ring-red-500";
                              else if (isReturned) ringColor = "ring-gray-500";
                              else if (step === "RETURN_REQUESTED") ringColor = "ring-purple-500";
                              else ringColor = "ring-emerald-500";
                          }

                          return (
                            <div key={step} className="flex flex-col items-center relative z-10 flex-1">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 transition-all ${circleColor} ${isCurrent ? "ring-4 ring-opacity-30 " + ringColor : ""}`}>
                                {isCompleted ? (isCancelled || isReturned ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />) : idx + 1}
                              </div>
                              <p className={`text-[10px] font-bold mt-1 text-center leading-tight ${isCompleted ? "text-[#142653]" : "text-[#142653]/40"}`}>
                                {STATUS_CONFIG[step]?.label || step}
                              </p>
                              <p className="text-[9px] text-[#142653]/40 mt-0.5">
                                {stepDate ? formatShortDate(stepDate) : "Pending"}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="px-5 pb-2">
                      <div className="flex items-center gap-2">
                        {displayItems.map((item, idx) => (
                          <div key={idx} className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center p-1">
                            <span className="text-lg">🐾</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <button
                            onClick={() => toggleExpandItems(order._id)}
                            className="text-xs font-bold text-coral hover:underline flex items-center gap-1"
                          >
                            {isExpanded ? "Show less" : `${order.items.length} items`} <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        )}
                        {order.items.length <= 3 && (
                          <span className="text-xs font-bold text-[#142653]/50">{order.items.length} item{order.items.length > 1 ? "s" : ""}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-50 bg-gray-50/50">
                      <Link
                        href={`/order/track/${order._id}`}
                        className="text-sm font-bold text-[#142653] border-2 border-[#142653]/20 px-5 py-2 rounded-xl hover:bg-[#142653] hover:text-white transition-all"
                      >
                        View Details
                      </Link>

                      {order.orderStatus === "SHIPPED" && (
                        <Link
                          href={`/order/track/${order._id}`}
                          className="text-sm font-bold text-white bg-[#142653] px-5 py-2 rounded-xl hover:bg-[#142653]/90 transition-all flex items-center gap-1.5"
                        >
                          <Truck className="w-4 h-4" /> Track Order
                        </Link>
                      )}

                      {order.orderStatus === "DELIVERED" && (
                        <Link
                          href="/products"
                          className="text-sm font-bold text-white bg-coral px-5 py-2 rounded-xl hover:bg-orange-500 transition-all flex items-center gap-1.5"
                        >
                          🛒 Buy Again
                        </Link>
                      )}

                      {canCancel(order.orderStatus) && (
                        <button
                          onClick={() => setCancelModal({ open: true, orderId: order._id, reason: "" })}
                          className="text-sm font-bold text-red-500 border-2 border-red-200 px-5 py-2 rounded-xl hover:bg-red-50 transition-all flex items-center gap-1.5"
                        >
                          <X className="w-4 h-4" /> Cancel Order
                        </button>
                      )}

                      {canReturn(order.orderStatus) && (
                        <button
                          onClick={() => openReturnModal(order)}
                          className="text-sm font-bold text-purple-600 border-2 border-purple-200 px-5 py-2 rounded-xl hover:bg-purple-50 transition-all flex items-center gap-1.5"
                        >
                          <RefreshCcw className="w-4 h-4" /> Return
                        </button>
                      )}

                      {order.orderStatus === "CANCELLED" && (
                        <Link
                          href="/products"
                          className="text-sm font-bold text-[#142653] border-2 border-[#142653]/20 px-5 py-2 rounded-xl hover:bg-[#142653] hover:text-white transition-all flex items-center gap-1.5"
                        >
                          🛒 Order Again
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination info */}
          {filteredOrders.length > 0 && (
            <div className="mt-6 text-center text-sm text-[#142653]/50 font-medium">
              Showing 1–{filteredOrders.length} of {filteredOrders.length} orders
            </div>
          )}
      </div>

      {/* ══════════════ CANCEL MODAL ══════════════ */}
      {cancelModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setCancelModal({ open: false, orderId: null, reason: "" })}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <X className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#142653]">Cancel Order</h3>
                <p className="text-sm text-[#142653]/50">Are you sure you want to cancel this order?</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-[#142653]/70 mb-2">Reason for cancellation (optional)</label>
              <select
                value={cancelModal.reason}
                onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all"
              >
                <option value="">Select a reason...</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Found a better price">Found a better price</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Delivery taking too long">Delivery taking too long</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCancelModal({ open: false, orderId: null, reason: "" })}
                className="flex-1 border-2 border-gray-200 text-[#142653] py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelLoading}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-red-600 transition-all disabled:opacity-60"
              >
                {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ RETURN MODAL ══════════════ */}
      {returnModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setReturnModal({ open: false, order: null, reason: "", comments: "", items: [] })}>
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <RefreshCcw className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#142653]">Request Return</h3>
                <p className="text-sm text-[#142653]/50">Order #{returnModal.order?.orderNumber}</p>
              </div>
            </div>

            {/* Items Selection */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-[#142653]/70 mb-3">Select items to return</label>
              <div className="space-y-3">
                {returnModal.items.map((item, idx) => (
                  <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${item.selected ? "border-purple-300 bg-purple-50" : "border-gray-200"}`}
                    onClick={() => {
                      const newItems = [...returnModal.items];
                      newItems[idx].selected = !newItems[idx].selected;
                      setReturnModal({ ...returnModal, items: newItems });
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={item.selected}
                      readOnly
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#142653] truncate">{item.name}</p>
                      <p className="text-xs text-[#142653]/50">Qty: {item.quantity}</p>
                    </div>
                    {item.selected && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-[#142653]/50">Return qty:</label>
                        <select
                          value={item.quantity}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const newItems = [...returnModal.items];
                            newItems[idx].quantity = Number(e.target.value);
                            setReturnModal({ ...returnModal, items: newItems });
                          }}
                          className="border rounded-lg px-2 py-1 text-xs"
                        >
                          {Array.from({ length: item.maxQuantity }, (_, i) => i + 1).map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-[#142653]/70 mb-2">Reason for return *</label>
              <select
                value={returnModal.reason}
                onChange={(e) => setReturnModal({ ...returnModal, reason: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
              >
                <option value="">Select a reason...</option>
                <option value="DEFECTIVE_PRODUCT">Defective product</option>
                <option value="WRONG_ITEM">Wrong item received</option>
                <option value="NOT_AS_DESCRIBED">Not as described</option>
                <option value="QUALITY_ISSUE">Quality issue</option>
                <option value="SIZE_FIT_ISSUE">Size/fit issue</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Comments */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-[#142653]/70 mb-2">Additional comments (optional)</label>
              <textarea
                value={returnModal.comments}
                onChange={(e) => setReturnModal({ ...returnModal, comments: e.target.value })}
                placeholder="Describe the issue..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setReturnModal({ open: false, order: null, reason: "", comments: "", items: [] })}
                className="flex-1 border-2 border-gray-200 text-[#142653] py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReturnRequest}
                disabled={returnLoading}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-purple-700 transition-all disabled:opacity-60"
              >
                {returnLoading ? "Submitting..." : "Submit Return Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
