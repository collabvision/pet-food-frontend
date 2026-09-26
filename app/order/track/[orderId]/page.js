"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package, CheckCircle, Clock, Truck, MapPin, XCircle,
  RefreshCcw, ArrowLeft, ChevronDown, ChevronUp, Download,
  CreditCard, Receipt, ShieldCheck, Phone, Mail, Headphones,
  Calendar, Hash, IndianRupee, Box, RotateCcw
} from "lucide-react";
import { orderService, paymentService, shippingService } from "@/lib/services";

/* ─── Status config ─────────────────────────────────────── */
const STATUS_CONFIG = {
  PENDING:          { label: "Pending",          color: "bg-amber-100 text-amber-700 border-amber-200",   dot: "bg-amber-500",   icon: Clock },
  CONFIRMED:        { label: "Confirmed",        color: "bg-blue-100 text-blue-700 border-blue-200",     dot: "bg-blue-500",    icon: CheckCircle },
  PROCESSING:       { label: "Processing",       color: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-500", icon: Package },
  SHIPPED:          { label: "Shipped",          color: "bg-indigo-100 text-indigo-700 border-indigo-200", dot: "bg-indigo-500", icon: Truck },
  DELIVERED:        { label: "Delivered",        color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", icon: CheckCircle },
  CANCELLED:        { label: "Cancelled",        color: "bg-red-100 text-red-700 border-red-200",         dot: "bg-red-500",    icon: XCircle },
  RETURN_REQUESTED: { label: "Return Requested", color: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500", icon: RefreshCcw },
  RETURNED:         { label: "Returned",         color: "bg-gray-100 text-gray-600 border-gray-200",      dot: "bg-gray-400",   icon: RotateCcw },
};

const NORMAL_STEPS    = ["PENDING","CONFIRMED","PROCESSING","SHIPPED","DELIVERED"];
const CANCELLED_STEPS = ["PENDING","CANCELLED"];
const RETURN_STEPS    = ["DELIVERED","RETURN_REQUESTED","RETURNED"];

function getSteps(order) {
  if (order.orderStatus === "CANCELLED")                              return CANCELLED_STEPS;
  if (["RETURN_REQUESTED","RETURNED"].includes(order.orderStatus))   return RETURN_STEPS;
  return NORMAL_STEPS;
}

function stepDate(order, status) {
  const e = order.statusHistory?.find(h => h.status === status);
  return e ? new Date(e.changedAt) : null;
}

function fmtDate(d) {
  if (!d) return null;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function fmtTime(d) {
  if (!d) return null;
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}
function fmtDateTime(d) {
  if (!d) return "—";
  return `${fmtDate(d)}, ${fmtTime(d)}`;
}

/* ─── Invoice generator (client-side print) ─────────────── */
function generateInvoice(order, payment) {
  const items = order.items?.map(i => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${i.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right">₹${i.price?.toFixed(2)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right">₹${(i.price * i.quantity)?.toFixed(2)}</td>
    </tr>`).join("") || "";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice – ${order.orderNumber}</title>
  <style>
    body{font-family:sans-serif;color:#1e2338;padding:40px;max-width:800px;margin:0 auto}
    .logo{font-size:28px;font-weight:900;color:#142653}
    .badge{display:inline-block;background:#e0f2fe;color:#0369a1;border-radius:99px;padding:2px 12px;font-size:12px;font-weight:700}
    table{width:100%;border-collapse:collapse;margin-top:20px}
    th{background:#f8f9fa;padding:10px 12px;text-align:left;font-size:12px;font-weight:700;text-transform:uppercase;color:#6b7280}
    .total-row td{font-weight:700;font-size:15px;border-top:2px solid #142653;padding-top:12px}
    .footer{margin-top:40px;font-size:12px;color:#6b7280;text-align:center}
    @media print{body{padding:20px}}
  </style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px">
    <div>
      <div class="logo">🐾 FurNest</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px">Happy Pets. Happier Humans.</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:22px;font-weight:800">INVOICE</div>
      <div class="badge">${order.orderNumber}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:6px">${fmtDate(new Date(order.createdAt))}</div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px;background:#f8f9fa;border-radius:12px;padding:20px">
    <div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:6px">Shipping To</div>
      <div style="font-weight:600">${order.shippingAddress?.name || order.shippingAddress?.street}</div>
      <div style="color:#6b7280;font-size:13px">${[order.shippingAddress?.street,order.shippingAddress?.city,order.shippingAddress?.state,order.shippingAddress?.pincode].filter(Boolean).join(", ")}</div>
    </div>
    <div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:6px">Payment</div>
      <div style="font-weight:600">${payment?.paymentId || "—"}</div>
      <div style="color:#6b7280;font-size:13px">Method: ${order.paymentMethod || "Online"}</div>
      <div style="color:#6b7280;font-size:13px">Status: ${payment?.status || order.paymentStatus || "—"}</div>
    </div>
  </div>

  <table>
    <thead><tr>
      <th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Total</th>
    </tr></thead>
    <tbody>${items}</tbody>
    <tfoot>
      ${order.discount > 0 ? `<tr><td colspan="3" style="padding:8px 12px;text-align:right;color:#6b7280">Discount</td><td style="padding:8px 12px;text-align:right;color:#059669">- ₹${order.discount?.toFixed(2)}</td></tr>` : ""}
      ${order.shippingFee > 0 ? `<tr><td colspan="3" style="padding:8px 12px;text-align:right;color:#6b7280">Shipping</td><td style="padding:8px 12px;text-align:right">₹${order.shippingFee?.toFixed(2)}</td></tr>` : ""}
      <tr class="total-row"><td colspan="3" style="padding:12px;text-align:right">Grand Total</td><td style="padding:12px;text-align:right;color:#142653">₹${order.totalAmount?.toFixed(2)}</td></tr>
    </tfoot>
  </table>

  <div class="footer">
    <p>Thank you for shopping with FurNest 🐾</p>
    <p>Questions? Contact us at support@furnest.in</p>
  </div>
  <script>window.print();window.onafterprint=()=>window.close()</script>
</body>
</html>`;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

/* ─── Main Component ──────────────────────────────────── */
export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const router = useRouter();

  const [order,    setOrder]    = useState(null);
  const [payment,  setPayment]  = useState(null);
  const [shipment, setShipment] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // fetch order — try by ID first, fallback to order number
        let orderData;
        try      { orderData = (await orderService.getById(orderId))?.data; }
        catch    { orderData = (await orderService.getByOrderNumber(orderId))?.data; }
        setOrder(orderData);

        // fetch payment
        if (orderData?._id) {
          try {
            const payRes = await paymentService.getByOrderId(orderData._id);
            setPayment(payRes?.data);
          } catch { /* no payment yet */ }

          // fetch shipment
          try {
            const shipRes = await shippingService.getMy();
            const matched = (shipRes?.data || []).find(
              s => s.order === orderData._id || s.orderId === orderData._id
            );
            if (matched) setShipment(matched);
          } catch { /* no shipment */ }
        }
      } catch (err) {
        setError("Could not load order details. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-[#142653]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-4 text-center px-4">
        <Package className="w-16 h-16 text-gray-300" />
        <h2 className="text-2xl font-black text-[#142653]">Order Not Found</h2>
        <p className="text-[#142653]/50 max-w-sm">{error || "We couldn't find this order in our system."}</p>
        <Link href="/account/orders" className="bg-[#142653] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#142653]/90 transition-all">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const cfg      = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PENDING;
  const StatusIcon = cfg.icon;
  const steps    = getSteps(order);
  const currentIdx = steps.findIndex(s => s === order.orderStatus);
  const addr     = order.shippingAddress || {};

  return (
    <div className="space-y-6">

      {/* ── Back button ── */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#142653]/60 hover:text-[#142653] font-semibold text-sm transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Orders
      </button>

      {/* ── Header card ── */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-[#142653]">Order #{order.orderNumber}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            </div>
            <p className="text-sm text-[#142653]/50 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              Placed on {fmtDateTime(new Date(order.createdAt))}
            </p>
          </div>
          <button
            onClick={() => generateInvoice(order, payment)}
            className="flex items-center gap-2 bg-[#142653] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#142653]/90 transition-all shadow-md"
          >
            <Download className="w-4 h-4" />
            Download Invoice
          </button>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-50">
        <h2 className="font-black text-[#142653] text-lg mb-6">Order Timeline</h2>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" />

          <div className="space-y-0">
            {steps.map((step, idx) => {
              const d = stepDate(order, step);
              const isCompleted = idx <= currentIdx;
              const isCurrent   = idx === currentIdx;
              const sCfg        = STATUS_CONFIG[step] || STATUS_CONFIG.PENDING;
              const SIcon       = sCfg.icon;
              const histEntry   = order.statusHistory?.find(h => h.status === step);

              return (
                <div key={step} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* Circle */}
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isCurrent   ? "bg-[#142653] shadow-lg ring-4 ring-[#142653]/10" :
                    isCompleted ? "bg-emerald-500" :
                                  "bg-gray-100"
                  }`}>
                    <SIcon className={`w-4 h-4 ${isCompleted ? "text-white" : "text-gray-400"}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1.5 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <p className={`font-bold text-sm ${isCompleted ? "text-[#142653]" : "text-[#142653]/30"}`}>
                        {sCfg.label}
                      </p>
                      {d && (
                        <p className="text-xs text-[#142653]/40 font-medium whitespace-nowrap">
                          {fmtDate(d)} · {fmtTime(d)}
                        </p>
                      )}
                    </div>
                    {histEntry?.note && (
                      <p className="text-xs text-[#142653]/50 mt-0.5 italic">"{histEntry.note}"</p>
                    )}
                    {!d && !isCompleted && (
                      <p className="text-xs text-[#142653]/25 font-medium">Upcoming</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Shipment info ── */}
      {shipment && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-50">
          <h2 className="font-black text-[#142653] text-lg mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5" /> Shipment Details
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Carrier",         value: shipment.carrier },
              { label: "Tracking Number", value: shipment.trackingNumber || "—" },
              { label: "Status",          value: shipment.status?.replace(/_/g, " ") },
              { label: "Est. Delivery",   value: shipment.estimatedDeliveryDate ? fmtDate(new Date(shipment.estimatedDeliveryDate)) : "—" },
            ].map(f => (
              <div key={f.label} className="bg-[#FFF8F5] rounded-2xl p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#142653]/40 mb-1">{f.label}</p>
                <p className="font-bold text-[#142653] text-sm break-all">{f.value || "—"}</p>
              </div>
            ))}
          </div>
          {shipment.trackingNumber && (
            <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-700 font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              Tracking ID: <span className="font-black">{shipment.trackingNumber}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Items ordered ── */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-50">
        <button
          className="w-full flex items-center justify-between"
          onClick={() => setShowItems(v => !v)}
        >
          <h2 className="font-black text-[#142653] text-lg flex items-center gap-2">
            <Box className="w-5 h-5" /> Items Ordered
            <span className="bg-[#142653]/10 text-[#142653] rounded-full text-xs font-black px-2 py-0.5">
              {order.items?.length}
            </span>
          </h2>
          {showItems ? <ChevronUp className="w-5 h-5 text-[#142653]/40" /> : <ChevronDown className="w-5 h-5 text-[#142653]/40" />}
        </button>

        {showItems && (
          <div className="mt-4 space-y-3">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 bg-[#FFF8F5] rounded-2xl">
                <div className="w-14 h-14 bg-white rounded-xl flex-shrink-0 flex items-center justify-center border border-orange-100 overflow-hidden p-1">
                  <img
                    src={item.image || item.product?.images?.[0] || "/placeholder.png"}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#142653] text-sm truncate">{item.name}</p>
                  <p className="text-xs text-[#142653]/50 font-medium">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#142653]">₹{(item.price * item.quantity)?.toFixed(2)}</p>
                  <p className="text-[10px] text-[#142653]/40 font-medium">₹{item.price} each</p>
                </div>
              </div>
            ))}

            {/* Price breakdown */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-[#142653]/60 font-medium">
                <span>Subtotal</span>
                <span>₹{order.items?.reduce((s, i) => s + i.price * i.quantity, 0)?.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span>- ₹{order.discount?.toFixed(2)}</span>
                </div>
              )}
              {order.shippingFee > 0 && (
                <div className="flex justify-between text-sm text-[#142653]/60 font-medium">
                  <span>Shipping</span>
                  <span>₹{order.shippingFee?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-[#142653] text-base pt-2 border-t border-gray-100">
                <span>Total Paid</span>
                <span>₹{order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* ── Payment details ── */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-50">
          <h2 className="font-black text-[#142653] text-lg mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" /> Payment Details
          </h2>
          <div className="space-y-3">
            {[
              { label: "Transaction ID",   value: payment?.paymentId || payment?.razorpayPaymentId || "—", mono: true },
              { label: "Razorpay Order",   value: payment?.razorpayOrderId || "—", mono: true },
              { label: "Method",           value: order.paymentMethod || "Online" },
              { label: "Amount",           value: `₹${order.totalAmount?.toFixed(2)}` },
              { label: "Payment Status",   value: payment?.status || order.paymentStatus || "—" },
              { label: "Paid At",          value: payment?.paidAt ? fmtDateTime(new Date(payment.paidAt)) : "—" },
            ].map(f => (
              <div key={f.label} className="flex justify-between items-start gap-4 py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs font-bold text-[#142653]/40 uppercase tracking-wide flex-shrink-0">{f.label}</span>
                <span className={`text-sm font-bold text-[#142653] text-right break-all ${f.mono ? "font-mono text-[11px]" : ""}`}>
                  {f.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Shipping address ── */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-50">
          <h2 className="font-black text-[#142653] text-lg mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" /> Delivery Address
          </h2>
          <div className="bg-[#FFF8F5] rounded-2xl p-4 space-y-1">
            {addr.name && <p className="font-black text-[#142653]">{addr.name}</p>}
            <p className="text-sm text-[#142653]/70 font-medium">{addr.street || addr.addressLine1}</p>
            {(addr.addressLine2 || addr.apartment) && (
              <p className="text-sm text-[#142653]/70 font-medium">{addr.addressLine2 || addr.apartment}</p>
            )}
            <p className="text-sm text-[#142653]/70 font-medium">
              {[addr.city, addr.state, addr.pincode || addr.zipCode].filter(Boolean).join(", ")}
            </p>
            {addr.country && <p className="text-sm text-[#142653]/50 font-medium">{addr.country}</p>}
            {addr.phone && (
              <p className="text-sm text-[#142653]/60 font-medium flex items-center gap-1.5 mt-2 pt-2 border-t border-orange-100">
                <Phone className="w-3.5 h-3.5" /> {addr.phone}
              </p>
            )}
          </div>

          {/* Summary box */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 mb-0.5">Items</p>
              <p className="font-black text-emerald-700 text-lg">{order.items?.reduce((s, i) => s + i.quantity, 0)}</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3 text-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600 mb-0.5">Total</p>
              <p className="font-black text-indigo-700 text-lg">₹{order.totalAmount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Help footer ── */}
      <div className="bg-gradient-to-r from-[#142653] to-[#1e3a6e] rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-black text-white">Need Help?</p>
            <p className="text-white/60 text-sm font-medium">Our team is here 24/7 for any order issues.</p>
          </div>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <a href="mailto:support@furnest.in" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-white/20">
            <Mail className="w-4 h-4" /> Email Support
          </a>
          <Link href="/account/orders" className="flex items-center gap-2 bg-white text-[#142653] px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-white/90 transition-all">
            <Package className="w-4 h-4" /> All Orders
          </Link>
        </div>
      </div>

    </div>
  );
}
