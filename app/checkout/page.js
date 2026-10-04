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
  Upload, FileImage, RefreshCw, MapPin, Home, Briefcase,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  cartService,
  orderService,
  paymentService,
  prescriptionService,
} from "@/lib/services";
import { convertToWebp } from "@/lib/utils/convertToWebp";
import { CustomDropdown, FormField } from "@/components/FormComponents";
import { INDIA_STATES, CITIES_BY_STATE } from "@/components/IndiaLocationData";

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
    description: "Your prescription is awaiting admin review.",
    className: "text-amber-700 bg-amber-50 border-amber-200",
    Icon: Clock3,
  },
  APPROVED: {
    label: "Approved",
    description: "Your prescription has been approved.",
    className: "text-green-700 bg-green-50 border-green-200",
    Icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected — upload again",
    description: "Please upload a corrected prescription.",
    className: "text-red-700 bg-red-50 border-red-200",
    Icon: AlertCircle,
  },
};

/* ─── component ───────────────────────────────────────────── */

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, status: authStatus } = useAuth();

  // "non-prescription" mode is triggered from the cart page when the user
  // wants to check out only non-prescription items.
  const initialMode =
    searchParams?.get("items") === "non-prescription"
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

  /* ── real-time field validation errors ── */
  const [fieldErrors, setFieldErrors] = useState({});

  const setError = (field, msg) =>
    setFieldErrors((prev) => ({ ...prev, [field]: msg }));

  const clearError = (field) =>
    setFieldErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });

  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");

  /* ── prescription upload modal state ── */
  const [prescriptionProduct, setPrescriptionProduct] = useState(null);
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState("");
  const [uploadingPrescription, setUploadingPrescription] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState("");

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

  const fetchPrescriptions = useCallback(async () => {
    try {
      const res = await prescriptionService.getCurrent();
      const rows =
        res?.data?.data || res?.data || [];

      const next = {};
      (Array.isArray(rows) ? rows : []).forEach((prescription) => {
        if (!prescription?.productId) return;
        const productId =
          typeof prescription.productId === "object"
            ? prescription.productId._id
            : prescription.productId;
        if (!productId) return;
        const existing = next[productId];
        if (
          !existing ||
          new Date(prescription.updatedAt || prescription.createdAt || 0) >=
            new Date(existing.updatedAt || existing.createdAt || 0)
        ) {
          next[productId] = prescription;
        }
      });
      setPrescriptions(next);
    } catch (err) {
      console.warn("Could not load prescriptions:", err);
    }
  }, []);

  // Gate on authStatus to avoid the session-timeout race condition on refresh
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    fetchCart();
    fetchPrescriptions();
  }, [authStatus, fetchCart, fetchPrescriptions]);

  useEffect(() => {
    if (user) {
      setContact((prev) => ({
        ...prev,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
      // Auto-fill from default saved address
      const defaultAddr = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
      if (defaultAddr) {
        setAddress({
          name: defaultAddr.name || user.name || "",
          addressLine1: defaultAddr.street || "",
          addressLine2: "",
          pincode: defaultAddr.pincode || "",
          city: defaultAddr.city || "",
          state: defaultAddr.state || "",
          country: defaultAddr.country || "India",
        });
      } else {
        setAddress((prev) => ({
          ...prev,
          name: user.name || prev.name,
        }));
      }
    }
  }, [user]);

  /* ── prescription modal helpers ────────────────────────── */

  const openPrescriptionModal = (product) => {
    setPrescriptionProduct(product);
    setPrescriptionFile(null);
    setPrescriptionPreview("");
    setPrescriptionError("");
  };

  const closePrescriptionModal = () => {
    if (uploadingPrescription) return;
    setPrescriptionProduct(null);
    setPrescriptionFile(null);
    setPrescriptionPreview("");
    setPrescriptionError("");
  };

  const handlePrescriptionFile = (file) => {
    setPrescriptionError("");
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPrescriptionError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPrescriptionError("Image size must be less than 10 MB.");
      return;
    }
    setPrescriptionFile(file);
    setPrescriptionPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (prescriptionPreview) URL.revokeObjectURL(prescriptionPreview);
    };
  }, [prescriptionPreview]);

  const handlePrescriptionUpload = async () => {
    if (!prescriptionFile || !prescriptionProduct) {
      setPrescriptionError("Please select a prescription image.");
      return;
    }
    setUploadingPrescription(true);
    setPrescriptionError("");
    try {
      const webpFile = await convertToWebp(prescriptionFile);
      const formData = new FormData();
      formData.append("file", webpFile, "prescription.webp");
      formData.append("productId", prescriptionProduct._id);

      const response = await prescriptionService.upload(formData);
      const prescription = response?.data?.data || response?.data;

      if (!prescription?._id) {
        throw new Error("The server returned an invalid prescription response.");
      }

      setPrescriptions((prev) => ({
        ...prev,
        [prescriptionProduct._id]: prescription,
      }));

      // Close modal
      setPrescriptionProduct(null);
      setPrescriptionFile(null);
      setPrescriptionPreview("");
      setPrescriptionError("");

      await fetchPrescriptions();
    } catch (err) {
      console.error("Prescription upload failed:", err);
      setPrescriptionError(
        err?.response?.data?.message ||
          err?.message ||
          "Upload failed. Please try again."
      );
    } finally {
      setUploadingPrescription(false);
    }
  };

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
    const errors = {};
    if (!contact.email) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) errors.email = "Enter a valid email address";

    if (!contact.phone) errors.phone = "Phone number is required";
    else if (!/^[+]?[0-9]{10,15}$/.test(contact.phone.replace(/\s/g, ""))) errors.phone = "Enter a valid 10-digit phone number";

    if (!address.name) errors.name = "Full name is required";
    if (!address.addressLine1) errors.addressLine1 = "Address is required";
    if (!address.state) errors.state = "State is required";
    if (!address.city) errors.city = "City is required";
    if (!address.pincode) errors.pincode = "Pincode is required";
    else if (!/^[1-9][0-9]{5}$/.test(address.pincode)) errors.pincode = "Enter a valid 6-digit Indian pincode";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return false;
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
        mode // "ALL" or "NON_PRESCRIPTION"
      );
      const order =
        orderRes?.data?.data || orderRes?.data?.order || orderRes?.data;

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

  if (authStatus === "loading" || isLoading) {
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
        <h2 className="text-2xl font-bold text-[#142653] mb-4">
          Your cart is empty
        </h2>
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
                <span className="block text-xl font-black text-[#142653] leading-none">
                  FurNest
                </span>
                <span className="text-[9px] font-bold text-[#142653]/50">
                  Happy Pets. Happier Humans.
                </span>
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
              <span className="block text-sm font-bold leading-none">
                Secure Checkout
              </span>
              <span className="text-[10px] text-[#142653]/50">
                Your information is safe with us
              </span>
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
                Checking out{" "}
                <strong>non-prescription items only</strong>. Prescription-required
                products remain in your cart until approved.
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
              <div className="w-6 h-6 rounded-full bg-[#ff6f4d] text-white flex items-center justify-center">
                1
              </div>
              Delivery
              <br />
              Address
            </div>
            <div className="w-12 h-px bg-[#ff6f4d]/30" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#142653]/10 flex items-center justify-center">
                2
              </div>
              Payment
              <br />
              Method
            </div>
            <div className="w-12 h-px bg-[#142653]/10" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#142653]/10 flex items-center justify-center">
                3
              </div>
              Review
              <br />& Place Order
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── LEFT COLUMN: forms ── */}
          <div className="lg:col-span-8 space-y-6">

            {/* Contact info */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-orange-50 relative">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#ff6f4d]/20 rounded-l-3xl" />
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#ff6f4d]/10 flex items-center justify-center text-[#ff6f4d]">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#142653]">
                    Contact Information
                  </h2>
                  <p className="text-sm text-[#142653]/50">
                    We'll keep you updated about your order.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
                <FormField
                  label="Email Address"
                  required
                  type="email"
                  value={contact.email}
                  placeholder="riya.sharma@gmail.com"
                  error={fieldErrors.email}
                  onChange={(e) => {
                    setContact({ ...contact, email: e.target.value });
                    if (e.target.value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) clearError("email");
                    else if (!e.target.value) setError("email", "Email is required");
                  }}
                />
                <FormField
                  label="Phone Number"
                  required
                  type="tel"
                  value={contact.phone}
                  placeholder="+91 98765 43210"
                  error={fieldErrors.phone}
                  maxLength={15}
                  onChange={(e) => {
                    setContact({ ...contact, phone: e.target.value });
                    const cleaned = e.target.value.replace(/\s/g, "");
                    if (/^[+]?[0-9]{10,15}$/.test(cleaned)) clearError("phone");
                    else if (!e.target.value) setError("phone", "Phone is required");
                  }}
                />
              </div>
            </div>

            {/* Delivery address */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-orange-50 relative">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#ff6f4d] rounded-l-3xl" />
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#ff6f4d]/10 flex items-center justify-center text-[#ff6f4d]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#142653]">Delivery Address</h2>
                    <p className="text-sm text-[#142653]/50">We'll deliver your order to this address.</p>
                  </div>
                </div>
              </div>

              {/* ── Saved Address Picker ── */}
              {user?.addresses?.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-[#142653]/60 mb-3 ml-1">USE SAVED ADDRESS</p>
                  <div className="flex flex-wrap gap-3">
                    {user.addresses.map((addr) => {
                      const isActive =
                        address.addressLine1 === addr.street &&
                        address.pincode === addr.pincode;
                      return (
                        <button
                          key={addr._id}
                          type="button"
                          onClick={() => {
                            setAddress({
                              name: addr.name || user.name || "",
                              addressLine1: addr.street || "",
                              addressLine2: "",
                              pincode: addr.pincode || "",
                              city: addr.city || "",
                              state: addr.state || "",
                              country: addr.country || "India",
                            });
                            setFieldErrors({});
                          }}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border-2 transition-all ${
                            isActive
                              ? "border-[#ff6f4d] bg-[#fff5ef] text-[#ff6f4d]"
                              : "border-gray-100 bg-gray-50 text-[#142653] hover:border-orange-200"
                          }`}
                        >
                          {addr.type === "Home" ? (
                            <Home className="w-3.5 h-3.5" />
                          ) : (
                            <Briefcase className="w-3.5 h-3.5" />
                          )}
                          {addr.type} — {addr.city}
                          {addr.isDefault && (
                            <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full">Default</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 h-px bg-gray-100" />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField
                  label="Full Name"
                  required
                  value={address.name}
                  placeholder="Riya Sharma"
                  error={fieldErrors.name}
                  onChange={(e) => {
                    setAddress({ ...address, name: e.target.value });
                    if (e.target.value) clearError("name");
                    else setError("name", "Full name is required");
                  }}
                />
                <FormField
                  label="Address Line 1"
                  required
                  value={address.addressLine1}
                  placeholder="123 Green Park, Near City Mall"
                  error={fieldErrors.addressLine1}
                  onChange={(e) => {
                    setAddress({ ...address, addressLine1: e.target.value });
                    if (e.target.value) clearError("addressLine1");
                    else setError("addressLine1", "Address is required");
                  }}
                />
                <FormField
                  label="Apartment, Suite, etc. (Optional)"
                  className="sm:col-span-2"
                  value={address.addressLine2}
                  placeholder="A-101, Sunshine Apartments"
                  onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                />
                <FormField
                  label="Pincode"
                  required
                  value={address.pincode}
                  placeholder="560001"
                  maxLength={6}
                  inputMode="numeric"
                  error={fieldErrors.pincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setAddress({ ...address, pincode: val });
                    if (/^[1-9][0-9]{5}$/.test(val)) clearError("pincode");
                    else if (val.length > 0) setError("pincode", "Enter a valid 6-digit pincode");
                    else setError("pincode", "Pincode is required");
                  }}
                />
                <CustomDropdown
                  label="State"
                  required
                  options={INDIA_STATES}
                  value={address.state}
                  placeholder="Select State"
                  error={fieldErrors.state}
                  onChange={(val) => {
                    setAddress({ ...address, state: val, city: "" });
                    clearError("state");
                  }}
                />
                <CustomDropdown
                  label="City"
                  required
                  options={address.state ? (CITIES_BY_STATE[address.state] || []) : []}
                  value={address.city}
                  placeholder={address.state ? "Select City" : "Select state first"}
                  error={fieldErrors.city}
                  disabled={!address.state}
                  onChange={(val) => {
                    setAddress({ ...address, city: val });
                    clearError("city");
                  }}
                />
              </div>
            </div>

            {/* ── Prescription Status & Upload Panel ── */}
            {rxItems.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-orange-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-amber-400" />
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                    <FileImage className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#142653]">
                      Prescription Status
                    </h2>
                    <p className="text-sm text-[#142653]/50">
                      Upload or check your prescription for the products below.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {rxItems.map((item) => {
                    const product = item.product || {};
                    const productId = product._id;
                    const prescription = prescriptions[productId] || null;
                    const status = prescription?.status;
                    const meta = PRESCRIPTION_STATUS_META[status] || null;
                    const StatusIcon = meta?.Icon;

                    return (
                      <div
                        key={productId}
                        className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-4"
                      >
                        {/* Product thumbnail */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-14 h-14 shrink-0 rounded-xl border border-gray-100 bg-white flex items-center justify-center p-1.5">
                            <img
                              src={
                                product.images?.[0]?.url ||
                                "https://images.unsplash.com/photo-1589924691995-400dc9ecc119"
                              }
                              alt={product.name || "Product"}
                              className="w-full h-full object-contain mix-blend-multiply"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-[#142653] leading-tight truncate">
                              {product.name || "Product"}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {product.unit || "Standard size"}
                            </p>
                          </div>
                        </div>

                        {/* Status + action */}
                        <div className="flex flex-col gap-2 sm:items-end shrink-0">
                          {meta ? (
                            <div
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold ${meta.className}`}
                            >
                              <StatusIcon size={13} />
                              {meta.label}
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-800">
                              <AlertCircle size={13} />
                              Not uploaded
                            </div>
                          )}

                          {status === "REJECTED" && prescription?.adminNote && (
                            <p className="text-[11px] text-red-500 max-w-[220px] text-right leading-snug">
                              Reason: {prescription.adminNote}
                            </p>
                          )}

                          {status !== "APPROVED" && (
                            <button
                              type="button"
                              onClick={() => openPrescriptionModal(product)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#ff6f4d]/40 bg-[#ff6f4d]/5 px-3 py-1.5 text-xs font-bold text-[#ff6f4d] hover:bg-[#ff6f4d]/10 transition"
                            >
                              {status === "REJECTED" ? (
                                <RefreshCw size={13} />
                              ) : (
                                <Upload size={13} />
                              )}
                              {status === "REJECTED"
                                ? "Upload again"
                                : status === "PENDING"
                                ? "Replace prescription"
                                : "Upload prescription"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary counts */}
                <div className="mt-5 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700">
                    Required: {rxItems.length}
                  </span>
                  <span className="rounded-full bg-green-100 px-3 py-1 font-semibold text-green-800">
                    Approved:{" "}
                    {
                      rxItems.filter(
                        (i) =>
                          prescriptions[i.product?._id]?.status === "APPROVED"
                      ).length
                    }
                  </span>
                  <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-900">
                    Awaiting / action needed: {blockedRxItems.length}
                  </span>
                </div>
              </div>
            )}

            {/* Payment method */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-orange-50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#142653]/10" />
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#142653]/5 flex items-center justify-center text-[#142653]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#142653]">
                    Payment Method
                  </h2>
                  <p className="text-sm text-[#142653]/50">
                    Choose your preferred payment method.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "RAZORPAY"
                      ? "border-[#ff6f4d] bg-[#ff6f4d]/5"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
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
                        <span className="text-[10px] font-bold bg-[#142653] text-white px-2 py-0.5 rounded-full uppercase">
                          Secure
                        </span>
                      </div>
                      <div className="text-xs text-[#142653]/60">
                        Pay via UPI, Cards, Net Banking or Wallets
                      </div>
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
                  <svg
                    className="w-6 h-6 text-[#ff6f4d]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Order Summary
                </h2>
                <span className="text-sm font-bold text-[#142653]/50">
                  {eligibleItems.length} item
                  {eligibleItems.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Item list */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6">
                {eligibleItems.map((item) => {
                  const rxStatus = prescriptions[item.product?._id];
                  const statusMeta = rxStatus
                    ? PRESCRIPTION_STATUS_META[rxStatus.status]
                    : null;
                  const StatusIcon = statusMeta?.Icon;

                  return (
                    <div key={item.product._id} className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-xl p-1 border border-gray-100 flex-shrink-0 flex items-center justify-center">
                        <img
                          src={
                            item.product.images?.[0]?.url ||
                            "https://images.unsplash.com/photo-1589924691995-400dc9ecc119"
                          }
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
                              <div
                                className={`mt-1 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${statusMeta.className}`}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {statusMeta.label}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveItem(item.product._id)
                            }
                            className="text-gray-400 hover:text-red-500 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.product._id,
                                  item.quantity,
                                  -1
                                )
                              }
                              className="w-5 h-5 flex items-center justify-center rounded bg-white shadow-sm hover:text-[#ff6f4d] transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-[#142653] w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.product._id,
                                  item.quantity,
                                  1
                                )
                              }
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
              {blockedRxItems.length > 0 &&
                checkoutMode !== "NON_PRESCRIPTION" && (
                  <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-amber-800">
                          {blockedRxItems.length} prescription product
                          {blockedRxItems.length > 1 ? "s" : ""}{" "}
                          pending/rejected
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          These will stay in your cart until approved.
                        </p>
                      </div>
                    </div>
                  </div>
                )}


              {/* Totals */}
              <div className="space-y-3 mb-6 border-b border-gray-100 pb-6">
                <div className="flex justify-between text-sm font-medium text-[#142653]/70">
                  <span>Subtotal ({eligibleItems.length} items)</span>
                  <span className="font-bold text-[#142653]">
                    {formatINR(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium text-[#142653]/70">
                  <span>Discount</span>
                  <span className="font-bold text-green-600">
                    - {formatINR(discount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium text-[#142653]/70">
                  <span>Shipping</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-6">
                <span className="text-lg font-extrabold text-[#142653]">
                  Total Amount
                </span>
                <span className="text-2xl font-black text-[#142653]">
                  {formatINR(total)}
                </span>
              </div>

              <button
                id="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full bg-[#ff6f4d] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-[#ff6f4d]/30 hover:bg-orange-500 hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
              >
                {isProcessing ? (
                  "Processing…"
                ) : (
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
                By placing this order, you agree to our Terms of Service and
                Privacy Policy.
              </p>
            </div>

            {/* Trust badges */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50 grid grid-cols-4 gap-2 text-center divide-x divide-gray-100">
              <div className="flex flex-col items-center justify-center px-1">
                <Truck className="w-5 h-5 text-[#142653] mb-1" />
                <span className="text-[9px] font-bold text-[#142653]/80 leading-tight">
                  Free Shipping
                  <br />
                  <span className="font-normal opacity-70">on orders ₹999+</span>
                </span>
              </div>
              <div className="flex flex-col items-center justify-center px-1">
                <ShieldCheck className="w-5 h-5 text-[#142653] mb-1" />
                <span className="text-[9px] font-bold text-[#142653]/80 leading-tight">
                  Secure
                  <br />
                  Payments
                </span>
              </div>
              <div className="flex flex-col items-center justify-center px-1">
                <Package className="w-5 h-5 text-[#142653] mb-1" />
                <span className="text-[9px] font-bold text-[#142653]/80 leading-tight">
                  Vet Approved
                  <br />
                  Products
                </span>
              </div>
              <div className="flex flex-col items-center justify-center px-1">
                <Headphones className="w-5 h-5 text-[#142653] mb-1" />
                <span className="text-[9px] font-bold text-[#142653]/80 leading-tight">
                  24/7
                  <br />
                  Support
                </span>
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
                  <h2
                    id="mixed-popup-title"
                    className="text-lg font-extrabold text-[#142653]"
                  >
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
                The following{" "}
                <strong>prescription-required products</strong> cannot be ordered
                yet and will remain in your cart:
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
                          src={
                            item.product.images?.[0]?.url ||
                            "https://images.unsplash.com/photo-1589924691995-400dc9ecc119"
                          }
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

              {(nonRxItems.length > 0 ||
                rxItems.filter(
                  (i) => prescriptions[i.product?._id]?.status === "APPROVED"
                ).length > 0) && (
                <>
                  <p className="text-sm text-gray-600">
                    The following <strong>eligible products</strong> will be
                    ordered now:
                  </p>
                  <div className="space-y-2">
                    {[
                      ...nonRxItems,
                      ...rxItems.filter(
                        (i) =>
                          prescriptions[i.product?._id]?.status === "APPROVED"
                      ),
                    ].map((item) => (
                      <div
                        key={item.product._id}
                        className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3"
                      >
                        <img
                          src={
                            item.product.images?.[0]?.url ||
                            "https://images.unsplash.com/photo-1589924691995-400dc9ecc119"
                          }
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
                {isProcessing
                  ? "Processing…"
                  : "Continue with Non-Prescription Products"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Prescription Upload Modal ─────────────────────── */}
      {prescriptionProduct && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/60 p-4 backdrop-blur-sm"
          onClick={closePrescriptionModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-prescription-dialog-title"
            className="w-full max-w-md overflow-hidden rounded-3xl border border-orange-100 bg-[#FFFBF9] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-orange-100 px-6 py-5">
              <div>
                <h2
                  id="checkout-prescription-dialog-title"
                  className="text-xl font-extrabold text-[#0F172A]"
                >
                  {prescriptions[prescriptionProduct._id]?.status === "REJECTED"
                    ? "Upload corrected prescription"
                    : "Upload prescription"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {prescriptionProduct.name}
                </p>
              </div>

              <button
                type="button"
                onClick={closePrescriptionModal}
                disabled={uploadingPrescription}
                aria-label="Close dialog"
                className="rounded-full p-2 text-gray-500 hover:bg-orange-50 disabled:opacity-50"
              >
                <XIcon size={20} />
              </button>
            </header>

            <div className="space-y-5 p-6">
              <label
                htmlFor="checkout-prescription-image"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50/50 px-4 py-7 text-center hover:bg-orange-50"
              >
                {prescriptionPreview ? (
                  <img
                    src={prescriptionPreview}
                    alt="Selected prescription preview"
                    className="mb-3 max-h-48 max-w-full rounded-xl object-contain"
                  />
                ) : (
                  <FileImage className="mb-3 text-orange-500" size={34} />
                )}

                <span className="text-sm font-bold text-[#0F172A]">
                  {prescriptionFile?.name || "Choose prescription image"}
                </span>

                <span className="mt-1 text-xs text-gray-500">
                  JPG, PNG, or WebP · Maximum 10 MB
                </span>

                <span className="mt-3 rounded-xl bg-[#0F172A] px-4 py-2 text-xs font-bold text-white">
                  Browse files
                </span>

                <input
                  id="checkout-prescription-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={uploadingPrescription}
                  onChange={(e) =>
                    handlePrescriptionFile(e.target.files?.[0])
                  }
                />
              </label>

              {prescriptionError && (
                <p role="alert" className="text-sm font-medium text-red-600">
                  {prescriptionError}
                </p>
              )}

              <p className="rounded-xl border border-orange-100 bg-white p-3 text-xs leading-5 text-gray-600">
                The image is converted to WebP before upload and sent for
                review. Ensure all prescription details are clear and readable.
              </p>

              <button
                type="button"
                onClick={handlePrescriptionUpload}
                disabled={!prescriptionFile || uploadingPrescription}
                className="w-full rounded-2xl bg-[#ff6f4d] py-3.5 text-sm font-bold text-white shadow hover:bg-orange-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploadingPrescription ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Submit Prescription
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
