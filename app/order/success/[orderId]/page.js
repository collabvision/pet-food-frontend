"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Download, Package, ShoppingBag } from "lucide-react";
import { orderService } from "@/lib/services";

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function generateInvoice(order) {
  const items =
    order.items
      ?.map(
        (i) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${i.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right">₹${Number(i.price).toFixed(2)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right">₹${(Number(i.price) * Number(i.quantity)).toFixed(2)}</td>
    </tr>`
      )
      .join("") || "";

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
      <div style="font-size:12px;color:#6b7280;margin-top:6px">${fmtDate(order.createdAt)}</div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px;background:#f8f9fa;border-radius:12px;padding:20px">
    <div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:6px">Shipping To</div>
      <div style="font-weight:600">${order.shippingAddress?.name || ""}</div>
      <div style="color:#6b7280;font-size:13px">${[order.shippingAddress?.addressLine1, order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.pincode].filter(Boolean).join(", ")}</div>
      <div style="color:#6b7280;font-size:13px">${order.shippingAddress?.phone || ""}</div>
    </div>
    <div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:6px">Payment</div>
      <div style="font-weight:600">Method: ${order.paymentMethod || "Online"}</div>
      <div style="color:#6b7280;font-size:13px">Status: ${order.paymentStatus || "Pending"}</div>
    </div>
  </div>

  <table>
    <thead><tr>
      <th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Total</th>
    </tr></thead>
    <tbody>${items}</tbody>
    <tfoot>
      ${order.discount > 0 ? `<tr><td colspan="3" style="padding:8px 12px;text-align:right;color:#6b7280">Discount</td><td style="padding:8px 12px;text-align:right;color:#059669">- ₹${Number(order.discount).toFixed(2)}</td></tr>` : ""}
      ${order.shippingCharge > 0 ? `<tr><td colspan="3" style="padding:8px 12px;text-align:right;color:#6b7280">Shipping</td><td style="padding:8px 12px;text-align:right">₹${Number(order.shippingCharge).toFixed(2)}</td></tr>` : ""}
      <tr class="total-row"><td colspan="3" style="padding:12px;text-align:right">Grand Total</td><td style="padding:12px;text-align:right;color:#142653">₹${Number(order.totalAmount).toFixed(2)}</td></tr>
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
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await orderService.getById(orderId);
        const data = res?.data?.data || res?.data?.order || res?.data;
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBF9] flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1e2338]" />
      </div>
    );
  }

  const displayOrderNumber = order?.orderNumber || orderId;

  return (
    <div className="min-h-screen bg-[#FFFBF9] relative overflow-hidden flex flex-col justify-center items-center font-sans py-12 px-4 sm:px-6">

      {/* Confetti / Decorative elements background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50 overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-6 h-6 bg-orange-400 rounded-full blur-[2px]" />
        <div className="absolute top-[20%] left-[20%] w-4 h-10 bg-red-400 rounded-full rotate-45 blur-[1px]" />
        <div className="absolute top-[30%] left-[5%] w-8 h-8 bg-blue-600 rounded-full -rotate-12 blur-[1px]" />
        <div className="absolute top-[40%] left-[25%] w-5 h-5 bg-yellow-400 rounded-full blur-[1px]" />
        <div className="absolute top-[50%] left-[10%] w-6 h-12 bg-green-500 rounded-full rotate-[60deg] blur-[1px]" />
        <div className="absolute top-[70%] left-[15%] w-8 h-8 bg-orange-500 rounded-full blur-[2px]" />
        <div className="absolute top-[15%] right-[15%] w-5 h-12 bg-blue-600 rounded-full -rotate-45 blur-[1px]" />
        <div className="absolute top-[25%] right-[25%] w-7 h-7 bg-yellow-400 rounded-full blur-[1px]" />
        <div className="absolute top-[35%] right-[10%] w-6 h-6 bg-red-400 rounded-full blur-[1px]" />
        <div className="absolute top-[45%] right-[30%] w-4 h-10 bg-green-600 rounded-full rotate-[30deg] blur-[2px]" />
        <div className="absolute top-[60%] right-[12%] w-9 h-9 bg-orange-400 rounded-full blur-[1px]" />
      </div>

      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center text-center">

        {/* Check icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6 shadow-lg">
          <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-[#1e2338] mb-4">
          Order Placed!
        </h1>

        <p className="text-lg text-gray-600 font-medium mb-2">
          Thank you for choosing FurNest.
        </p>
        <p className="text-gray-500 mb-8">
          We've sent the order details to your email and WhatsApp.
        </p>

        {/* Order ID badge */}
        <div className="bg-[#D1F2EB] text-[#0A3622] px-8 py-3 rounded-xl font-bold text-lg mb-6 shadow-sm border border-[#A3E4D7] flex items-center gap-2">
          <Package className="w-5 h-5" />
          Order #{displayOrderNumber}
        </div>

        {/* Order summary */}
        {order && (
          <div className="w-full bg-white rounded-2xl p-5 mb-8 shadow-sm border border-gray-100 text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-[#142653]">Order Summary</h3>
              <span className="text-xs font-bold text-[#142653]/50">{fmtDate(order.createdAt)}</span>
            </div>
            <div className="space-y-2 mb-4">
              {(order.items || []).slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-[#142653]/70 truncate flex-1">{item.name} × {item.quantity}</span>
                  <span className="font-bold text-[#142653] ml-3">₹{(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}</span>
                </div>
              ))}
              {(order.items || []).length > 3 && (
                <p className="text-xs text-[#142653]/50 font-medium">+{order.items.length - 3} more items</p>
              )}
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-[#142653]">
              <span>Total Paid</span>
              <span>₹{Number(order.totalAmount).toLocaleString("en-IN")}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-6">
          <button
            onClick={() => router.push(`/order/track/${orderId}`)}
            className="bg-[#1e2338] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#111424] transition-all shadow-lg min-w-[200px] flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            View Order
          </button>
          {order && (
            <button
              onClick={() => generateInvoice(order)}
              className="bg-white border-2 border-gray-200 text-[#1e2338] px-10 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm min-w-[200px] flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Invoice
            </button>
          )}
          <Link
            href="/products"
            className="bg-white border-2 border-gray-200 text-[#1e2338] px-10 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm min-w-[200px] flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        {/* Happy Dog Banner */}
        <div className="relative w-full max-w-md mt-auto">
          <div className="absolute right-0 bottom-1/4 transform translate-x-10 translate-y-10 z-20 hidden sm:block">
            <h2 className="text-3xl font-bold text-[#1e2338] rotate-[-10deg] italic leading-tight">
              Wagging<br />Tails<br />Brighter<br />Days! <span className="text-red-500 not-italic">♥</span>
            </h2>
          </div>
          <img
            src="https://images.unsplash.com/photo-1552053831-71594a27632d"
            alt="Happy Golden Retriever"
            className="w-full object-cover h-[300px] object-top rounded-[4rem_4rem_0_0] shadow-2xl relative z-10"
            style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}
          />
          <div className="absolute bottom-10 left-0 -translate-x-4 z-20">
            <div className="w-16 h-24 bg-[#0F5132] rounded-[100%_0_100%_0] rotate-[-30deg] opacity-90 shadow-lg" />
            <div className="w-12 h-20 bg-[#198754] rounded-[100%_0_100%_0] absolute bottom-2 left-6 rotate-[15deg] opacity-90 shadow-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
