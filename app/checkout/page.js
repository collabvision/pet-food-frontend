"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import {
  Lock, ArrowLeft, Trash2, Minus, Plus,
  CreditCard, Banknote, ShieldCheck, Truck,
  Headphones, Heart, AlertTriangle, X as XIcon,
  Clock3, CheckCircle2, AlertCircle, Package,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cartService, orderService, paymentService, prescriptionService } from "@/lib/services";

/* ─── helpers ─────────────────────────────────────────────── */

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);

const PRESCRIPTION_STATUS_META = {
  PENDING: {
    label: "Under Review",
    className: "text-amber-700 bg-amber-50 border-amber-200",
    Icon: Clock3,
  },
  APPROVED: {
    label: "Approved",
    className: "text-green-700 bg-green-50 border-green-200",
    Icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    className: "text-red-700 bg-red-50 border-red-200",
    Icon: AlertCircle,
  },
};

/* ─── component ───────────────────────────────────────────── */

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, status } = useAuth();

  // "non-prescription" mode is triggered from the cart page when the user
  // wants to check out only non-prescription items.
  const initialMode = searchParams?.get("items") === "non-prescription"
    ? "NON_PRESCRIPTION"
    : "ALL";

  const [cart, setCart] = useState(null);
  const [prescriptions, setPrescriptions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [checkoutMode, setCheckoutMode] = useState(initialMode);

  /* ── mixed-cart popup state ── */
  const [showMixedPopup, setShowMixedPopup] = useState(false);

  const [contact, setContact] = useState({ email: "", phone: "" });
  const [address, setAddress] = useState({
    name: "",
    addressLine1: "",
    addressLine2: "",
    pincode: "",
    city: "",
    state: "",
    country: "India",
  });

  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");

  /* ── data fetching ─────────────────────────────────────── */

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await cartService.get();
      setCart(res?.data || null);
    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPrescriptions = useCallback(async (items) => {
    if (!items || items.length === 0) return;

    const prescriptionItems = items.filter(
      (item) => item.product?.requiresPrescription
    );

    if (prescriptionItems.length === 0) return;

    const results = {};

    await Promise.allSettled(
      prescriptionItems.map(async (item) => {
        const productId = item.product?._id;
        if (!productId) return;
        try {
          const res = await prescriptionService.getByProduct(productId);
          results[productId] = res?.data || null;
        } catch {
          results[productId] = null;
        }
      })
    );

    setPrescriptions(results);
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (cart?.items) {
      fetchPrescriptions(cart.items);
    }
  }, [cart, fetchPrescriptions]);

  useEffect(() => {
    if (user) {
      setContact((prev) => ({
        ...prev,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
      setAddress((prev) => ({
        ...prev,
        name: user.name || prev.name,
      }));
    }
  }, [user]);

  /* ── cart helpers ──────────────────────────────────────── */

  const handleQuantityChange = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    try {
      if (newQuantity < 1) {
        await cartService.removeItem(productId);
      } else {
        await cartService.updateItem(productId, newQuantity);
      }
      await fetchCart();
    } catch (err) {
      console.error("Cart update error:", err);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await cartService.removeItem(productId);
      await fetchCart();
    } catch (err) {
      console.error("Cart remove error:", err);
    }
  };

  /* ── order / payment logic ─────────────────────────────── */

  const loadRazorpay = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const validateForm = () => {
    if (
      !address.name ||
      !contact.phone ||
      !address.addressLine1 ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      alert("Please fill in all required delivery and contact details.");
      return false;
    }
    return true;
  };

  const placeOrder = async (mode) => {
    if (!validateForm()) return;

    try {
      setIsProcessing(true);
      setShowMixedPopup(false);

      const shippingAddress = {
        name: address.name,
        phone: contact.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country,
      };

      const apiPaymentMethod = paymentMethod === "RAZORPAY" ? "ONLINE" : "COD";

      const orderRes = await orderService.create(
        shippingAddress,
        apiPaymentMethod,
        mode           // "ALL" or "NON_PRESCRIPTION"
      );
      const order = orderRes?.data?.data || orderRes?.data?.order || orderRes?.data;

      if (!order || !order._id) throw new Error("Failed to create order");

      if (paymentMethod === "RAZORPAY") {
        const loaded = await loadRazorpay();
        if (!loaded) {
          alert("Razorpay SDK failed to load. Are you online?");
          setIsProcessing(false);
          return;
        }

        const paymentRes = await paymentService.createOrder(order._id);
        const { razorpayOrderId, amount, currency, keyId } = paymentRes.data;

        const options = {
          key: keyId,
          amount,
          currency,
          name: "FurNest",
          description: "Purchase from FurNest",
          order_id: razorpayOrderId,
          handler: async function (response) {
            try {
              await paymentService.verify(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );
              router.push(`/order/success/${order._id}`);
            } catch (err) {
              console.error(err);
              alert("Payment verification failed. Please contact support.");
              setIsProcessing(false);
            }
          },
          prefill: {
            name: address.name,
            email: contact.email,
            contact: contact.phone,
          },
          theme: { color: "#ff6f4d" },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
        paymentObject.on("payment.failed", () => {
          alert("Payment failed! Please try again.");
          setIsProcessing(false);
        });
      } else {
        router.push(`/order/success/${order._id}`);
      }
    } catch (error) {
      console.error(error);
      alert(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to place order."
      );
      setIsProcessing(false);
    }
  };

  /**
   * Called when the user clicks "Place Order".
   *
   * Logic:
   * 1. If checkoutMode is NON_PRESCRIPTION → order only non-prescription items.
   * 2. If ALL items are approved (or non-prescription) → order ALL.
   * 3. If there's a mix of eligible + blocked items → show popup.
   * 4. If ALL items are blocked prescription items → show info, don't order.
   */
  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    if (checkoutMode === "NON_PRESCRIPTION") {
      await placeOrder("NON_PRESCRIPTION");
      return;
    }

    const allItems = cart?.items || [];
    const rxItems = allItems.filter((i) => i.product?.requiresPrescription);
    const nonRxItems = allItems.filter((i) => !i.product?.requiresPrescription);

    const blockedRxItems = rxItems.filter((i) => {
      const rx = prescriptions[i.product?._id];
      return !rx || rx.status !== "APPROVED";
    });

    const approvedRxItems = rxItems.filter((i) => {
      const rx = prescriptions[i.product?._id];
      return rx && rx.status === "APPROVED";
    });

    // Case 1: no blocked items → proceed with ALL
    if (blockedRxItems.length === 0) {
      await placeOrder("ALL");
      return;
    }

    // Case 2: non-prescription items exist alongside blocked items → show popup
    if (nonRxItems.length > 0 || approvedRxItems.length > 0) {
      setShowMixedPopup(true);
      return;
    }

    // Case 3: cart is ALL blocked prescription items → cannot order
    alert(
      "Your cart contains only prescription-required products that are pending or rejected. " +
      "Please wait for admin approval or upload a corrected prescription."
    );
  };

  /* ── derived state ─────────────────────────────────────── */

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#FFF8F5]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#ff6f4d]" />
      </div>
    );
  }

  const allItems = cart?.items || [];
  const nonRxItems = allItems.filter((i) => !i.product?.requiresPrescription);
  const rxItems = allItems.filter((i) => i.product?.requiresPrescription);
  const blockedRxItems = rxItems.filter((i) => {
    const rx = prescriptions[i.product?._id];
    return !rx || rx.status !== "APPROVED";
  });

  // Eligible items to show in cart sidebar based on current mode
  const eligibleItems =
    checkoutMode === "NON_PRESCRIPTION" ? nonRxItems : allItems;

  const subtotal = eligibleItems.reduce(
    (s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 0),
    0
  );
  const shipping = 0;
  const discount = 0;
  const total = subtotal + shipping - discount;

  if (allItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF8F5] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-[#142653] mb-4">Your cart is empty</h2>
        <Link
          href="/products"
          className="bg-[#ff6f4d] text-white px-8 py-3 rounded-full font-bold hover:bg-orange-500 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  /* ── render ──────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-[#FFF8F5] pb-20 font-sans">
      {/* Sticky header */}
      <header className="bg-white/50 backdrop-blur-md sticky top-0 z-40 border-b border-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#ff6f4d] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-sm rotate-3">
                F
              </div>
              <div>
                <span className="block text-xl font-black text-[#142653] leading-none">FurNest</span>
                <span className="text-[9px] font-bold text-[#142653]/50">Happy Pets. Happier Humans.</span>
              </div>
            </Link>
            <Link
              href="/cart"
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[#142653] hover:text-[#ff6f4d] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Cart
            </Link>
          </div>
          <div className="flex items-center gap-2 text-[#142653]">
            <Lock className="w-5 h-5 text-[#142653]/80" />
            <div className="text-right hidden sm:block">
              <span className="block text-sm font-bold leading-none">Secure Checkout</span>
              <span className="text-[10px] text-[#142653]/50">Your information is safe with us</span>
            </div>
          </div>
        </div>
      </header>

      {/* Checkout mode banner */}
      {checkoutMode === "NON_PRESCRIPTION" && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-sm font-semibold text-amber-800">
                Checking out <strong>non-prescription items only</strong>. Prescription-required products remain in your cart until approved.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCheckoutMode("ALL")}
              className="text-xs font-bold text-amber-700 underline hover:no-underline whitespace-nowrap"
            >
              Switch to full cart
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-[#142653] mb-2 flex items-center gap-3">
              Checkout <Heart className="w-8 h-8 text-[#ff6f4d] fill-[#ff6f4d]" />
            </h1>
            <p className="text-[#142653]/70 font-medium">
              Almost there! Complete your order for a happier, healthier pet.
            </p>
          </div>

          {/* Step indicator */}
          <div className="mt-6 md:mt-0 flex items-center justify-center gap-4 text-xs font-bold text-[#142653]/50">
            <div className="flex items-center gap-2 text-[#ff6f4d]">
              <div className="w-6 h-6 rounded-full bg-[#ff6f4d] text-white flex items-center justify-center">1</div>
              Delivery<br />Address
            </div>
            <div className="w-12 h-px bg-[#ff6f4d]/30" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#142653]/10 flex items-center justify-center">2</div>
              Payment<br />Method
            </div>
            <div className="w-12 h-px bg-[#142653]/10" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#142653]/10 flex items-center justify-center">3</div>
              Review<br />&amp; Place Order
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── LEFT COLUMN: forms ── */}
          <div className="lg:col-span-8 space-y-6">

            {/* Contact info */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-orange-50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#ff6f4d]/20" />
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#ff6f4d]/10 flex items-center justify-center text-[#ff6f4d]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#142653]">Contact Information</h2>
                  <p className="text-sm text-[#142653]/50">We'll keep you updated about your order.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
                <div>
                  <label className="block text-xs font-bold text-[#142653]/70 mb-1.5 ml-1">Email Address *</label>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    placeholder="riya.sharma@gmail.com"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#ff6f4d] focus:ring-2 focus:ring-[#ff6f4d]/20 transition-all text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#142653]/70 mb-1.5 ml-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#ff6f4d] focus:ring-2 focus:ring-[#ff6f4d]/20 transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Delivery address */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-orange-50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#ff6f4d]" />
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#ff6f4d]/10 flex items-center justify-center text-[#ff6f4d]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#142653]">Delivery Address</h2>
                    <p className="text-sm text-[#142653]/50">We'll deliver your order to this address.</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#142653]/70 mb-1.5 ml-1">Full Name *</label>
                  <input
                    type="text"
                    value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    placeholder="Riya Sharma"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#ff6f4d] focus:ring-2 focus:ring-[#ff6f4d]/20 transition-all text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#142653]/70 mb-1.5 ml-1">Address *</label>
                  <input
                    type="text"
                    value={address.addressLine1}
                    onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                    placeholder="123 Green Park, Near City Mall"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#ff6f4d] focus:ring-2 focus:ring-[#ff6f4d]/20 transition-all text-sm font-medium"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#142653]/70 mb-1.5 ml-1">Apartment, Suite, etc. (Optional)</label>
                  <input
                    type="text"
                    value={address.addressLine2}
                    onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                    placeholder="A-101, Sunshine Apartments"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#ff6f4d] focus:ring-2 focus:ring-[#ff6f4d]/20 transition-all text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#142653]/70 mb-1.5 ml-1">Pincode *</label>
                  <input
                    type="text"
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    placeholder="560001"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#ff6f4d] focus:ring-2 focus:ring-[#ff6f4d]/20 transition-all text-sm font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#142653]/70 mb-1.5 ml-1">City *</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="Bangalore"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#ff6f4d] focus:ring-2 focus:ring-[#ff6f4d]/20 transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#142653]/70 mb-1.5 ml-1">State *</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      placeholder="Karnataka"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#ff6f4d] focus:ring-2 focus:ring-[#ff6f4d]/20 transition-all text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-orange-50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#142653]/10" />
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#142653]/5 flex items-center justify-center text-[#142653]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#142653]">Payment Method</h2>
                  <p className="text-sm text-[#142653]/50">Choose your preferred payment method.</p>
                </div>
              </div>
              <div className="space-y-3">
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "RAZORPAY" ? "border-[#ff6f4d] bg-[#ff6f4d]/5" : "border-gray-100 hover:border-gray-200"}`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "RAZORPAY"}
                      onChange={() => setPaymentMethod("RAZORPAY")}
                      className="w-5 h-5 text-[#ff6f4d] focus:ring-[#ff6f4d]"
                    />
                    <div>
                      <div className="font-bold text-[#142653] flex items-center gap-2">
                        Razorpay{" "}
                        <span className="text-[10px] font-bold bg-[#142653] text-white px-2 py-0.5 rounded-full uppercase">Secure</span>
                      </div>
                      <div className="text-xs text-[#142653]/60">Pay via UPI, Cards, Net Banking or Wallets</div>
                    </div>
                  </div>
                </label>
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "COD" ? "border-[#ff6f4d] bg-[#ff6f4d]/5" : "border-gray-100 hover:border-gray-200"}`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="w-5 h-5 text-[#ff6f4d] focus:ring-[#ff6f4d]"
                    />
                    <div>
                      <div className="font-bold text-[#142653] flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-green-600" /> Cash on Delivery
                      </div>
                      <div className="text-xs text-[#142653]/60">Pay when your order is delivered</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: order summary ── */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-50">
              <div className="flex justify-between items-end pb-4 border-b border-gray-100 mb-4">
                <h2 className="text-xl font-bold text-[#142653] flex items-center gap-2">
                  <svg className="w-6 h-6 text-[#ff6f4d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Order Summary
                </h2>
                <span className="text-sm font-bold text-[#142653]/50">
                  {eligibleItems.length} item{eligibleItems.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Item list */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6">
                {eligibleItems.map((item) => {
                  const rxStatus = prescriptions[item.product?._id];
                  const statusMeta = rxStatus ? PRESCRIPTION_STATUS_META[rxStatus.status] : null;
                  const StatusIcon = statusMeta?.Icon;

                  return (
                    <div key={item.product._id} className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-xl p-1 border border-gray-100 flex-shrink-0 flex items-center justify-center">
                        <img
                          src={item.product.images?.[0]?.url || "https://images.unsplash.com/photo-1589924691995-400dc9ecc119"}
                          alt={item.product.name}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="flex-grow flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-[#142653] leading-tight line-clamp-2">
                              {item.product.name}
                            </h4>
                            {statusMeta && (
                              <div className={`mt-1 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${statusMeta.className}`}>
                                <StatusIcon className="w-3 h-3" />
                                {statusMeta.label}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.product._id)}
                            className="text-gray-400 hover:text-red-500 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                            <button
                              onClick={() => handleQuantityChange(item.product._id, item.quantity, -1)}
                              className="w-5 h-5 flex items-center justify-center rounded bg-white shadow-sm hover:text-[#ff6f4d] transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-[#142653] w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.product._id, item.quantity, 1)}
                              className="w-5 h-5 flex items-center justify-center rounded bg-white shadow-sm hover:text-[#ff6f4d] transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-sm font-black text-[#142653]">
                            {formatINR(item.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Blocked items notice */}
              {blockedRxItems.length > 0 && checkoutMode !== "NON_PRESCRIPTION" && (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-800">
                        {blockedRxItems.length} prescription product{blockedRxItems.length > 1 ? "s" : ""} pending/rejected
                      </p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        These will stay in your cart until approved.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Coupon */}
              <div className="bg-[#FFF8F5] rounded-2xl p-4 mb-6">
                <p className="text-xs font-bold text-[#ff6f4d] mb-2 flex items-center gap-1">
                  <span className="bg-[#ff6f4d] text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">%</span>
                  Apply Coupon Code
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-grow bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#ff6f4d] transition-colors"
                  />
                  <button
                    onClick={() => alert("Coupon validation coming soon!")}
                    className="bg-[#142653] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#142653]/90 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6 border-b border-gray-100 pb-6">
                <div className="flex justify-between text-sm font-medium text-[#142653]/70">
                  <span>Subtotal ({eligibleItems.length} items)</span>
                  <span className="font-bold text-[#142653]">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-[#142653]/70">
                  <span>Discount</span>
                  <span className="font-bold text-green-600">- {formatINR(discount)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-[#142653]/70">
                  <span>Shipping</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-6">
                <span className="text-lg font-extrabold text-[#142653]">Total Amount</span>
                <span className="text-2xl font-black text-[#142653]">{formatINR(total)}</span>
              </div>

              <button
                id="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full bg-[#ff6f4d] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-[#ff6f4d]/30 hover:bg-orange-500 hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
              >
                {isProcessing ? "Processing…" : (
                  <>
                    <Lock className="w-5 h-5" />
                    {checkoutMode === "NON_PRESCRIPTION"
                      ? "Place Order (Non-Rx Items)"
                      : "Place Order"}
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-[#142653]/50 mt-3 font-medium">
                By placing this order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>

            {/* Trust badges */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50 grid grid-cols-4 gap-2 text-center divide-x divide-gray-100">
              <div className="flex flex-col items-center justify-center px-1">
                <Truck className="w-5 h-5 text-[#142653] mb-1" />
                <span className="text-[9px] font-bold text-[#142653]/80 leading-tight">Free Shipping<br /><span className="font-normal opacity-70">on orders ₹999+</span></span>
              </div>
              <div className="flex flex-col items-center justify-center px-1">
                <ShieldCheck className="w-5 h-5 text-[#142653] mb-1" />
                <span className="text-[9px] font-bold text-[#142653]/80 leading-tight">Secure<br />Payments</span>
              </div>
              <div className="flex flex-col items-center justify-center px-1">
                <Package className="w-5 h-5 text-[#142653] mb-1" />
                <span className="text-[9px] font-bold text-[#142653]/80 leading-tight">Vet Approved<br />Products</span>
              </div>
              <div className="flex flex-col items-center justify-center px-1">
                <Headphones className="w-5 h-5 text-[#142653] mb-1" />
                <span className="text-[9px] font-bold text-[#142653]/80 leading-tight">24/7<br />Support</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Mixed-cart popup ─────────────────────────────── */}
      {showMixedPopup && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMixedPopup(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mixed-popup-title"
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 id="mixed-popup-title" className="text-lg font-extrabold text-[#142653]">
                    Continue with Non-Prescription Products?
                  </h2>
                  <p className="text-xs text-gray-500">
                    Some items need prescription approval
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMixedPopup(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <XIcon size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              <p className="text-sm text-gray-600">
                The following <strong>prescription-required products</strong> cannot be ordered yet and will remain in your cart:
              </p>

              {/* Blocked items */}
              <div className="space-y-2">
                {blockedRxItems.map((item) => {
                  const rx = prescriptions[item.product?._id];
                  const statusKey = rx?.status || "NOT_UPLOADED";
                  const statusLabel =
                    statusKey === "PENDING"
                      ? "⏳ Under Review"
                      : statusKey === "REJECTED"
                      ? "❌ Rejected"
                      : "📤 Not Uploaded";

                  return (
                    <div
                      key={item.product._id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.images?.[0]?.url || "https://images.unsplash.com/photo-1589924691995-400dc9ecc119"}
                          alt={item.product.name}
                          className="w-10 h-10 rounded-lg object-contain bg-white border border-amber-100"
                        />
                        <div>
                          <p className="text-sm font-bold text-amber-900 line-clamp-1">
                            {item.product.name}
                          </p>
                          {rx?.adminNote && statusKey === "REJECTED" && (
                            <p className="text-xs text-red-600 mt-0.5 line-clamp-1">
                              Reason: {rx.adminNote}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-700 whitespace-nowrap shrink-0">
                        {statusLabel}
                      </span>
                    </div>
                  );
                })}
              </div>

              {(nonRxItems.length > 0 || rxItems.filter((i) => prescriptions[i.product?._id]?.status === "APPROVED").length > 0) && (
                <>
                  <p className="text-sm text-gray-600">
                    The following <strong>eligible products</strong> will be ordered now:
                  </p>
                  <div className="space-y-2">
                    {[
                      ...nonRxItems,
                      ...rxItems.filter((i) => prescriptions[i.product?._id]?.status === "APPROVED"),
                    ].map((item) => (
                      <div
                        key={item.product._id}
                        className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3"
                      >
                        <img
                          src={item.product.images?.[0]?.url || "https://images.unsplash.com/photo-1589924691995-400dc9ecc119"}
                          alt={item.product.name}
                          className="w-10 h-10 rounded-lg object-contain bg-white border border-green-100"
                        />
                        <div>
                          <p className="text-sm font-bold text-green-900 line-clamp-1">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-green-700">
                            {formatINR(item.price)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-6 py-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => setShowMixedPopup(false)}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
              >
                Wait for Approval
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => placeOrder("NON_PRESCRIPTION")}
                className="rounded-xl bg-[#ff6f4d] px-5 py-3 text-sm font-bold text-white hover:bg-orange-500 transition disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isProcessing ? "Processing…" : "Continue with Non-Prescription Products"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
