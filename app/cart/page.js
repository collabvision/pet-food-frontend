"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { X, Upload, FileImage, CheckCircle2 } from "lucide-react";
import { uploadPrescription } from "@/lib/services";
import { convertToWebp } from "@/lib/utils/convertToWebp";
import { cartService, prescriptionService } from "@/lib/services";
export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [prescriptionProduct, setPrescriptionProduct] = useState(null);
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState("");
  const [uploadingPrescription, setUploadingPrescription] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState("");
  const [uploadedPrescriptions, setUploadedPrescriptions] = useState({});
  const fetchCart = useCallback(async () => {
    try {
      setIsCartLoading(true);
      const res = await cartService.get();
      setCart(res?.data || null);
    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      setIsCartLoading(false);
    }
  }, []);

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
      setPrescriptionError("Please select a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPrescriptionError("Image size must be less than 10 MB.");
      return;
    }

    setPrescriptionFile(file);
    setPrescriptionPreview(URL.createObjectURL(file));
  };

  const handlePrescriptionUpload = async () => {
    if (!prescriptionFile || !prescriptionProduct) {
      setPrescriptionError("Please select a prescription image.");
      return;
    }

    setUploadingPrescription(true);
    setPrescriptionError("");

    try {
      // Convert image to WebP
      const webpFile = await convertToWebp(prescriptionFile);

      // Prepare multipart form data
      const formData = new FormData();
      formData.append("file", webpFile, "prescription.webp");
      formData.append("productId", prescriptionProduct._id);

      // Call centralized prescription API
      const response = await prescriptionService.upload(formData);

      // Handle the API response
      const prescription = response?.data?.data;

      if (!prescription?._id) {
        throw new Error("Invalid prescription upload response.");
      }

      // Store uploaded prescription against the product
      setUploadedPrescriptions((previous) => ({
        ...previous,
        [prescriptionProduct._id]: prescription,
      }));

      closePrescriptionModal();
    } catch (error) {
      console.error("Prescription upload failed:", error);

      setPrescriptionError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to upload prescription. Please try again.",
      );
    } finally {
      setUploadingPrescription(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

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

  const handleClearCart = async () => {
    try {
      await cartService.clear();
      setCart(null);
    } catch (err) {
      console.error("Cart clear error:", err);
    }
  };

  if (isCartLoading && (!cart || !cart.items || cart.items.length === 0)) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#FDF8F5]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#0F172A]"></div>
      </div>
    );
  }

  const items = cart?.items || [];

  const prescriptionRequiredItems = items.filter(
    (item) => item.product?.requiresPrescription,
  );

  const missingPrescriptions = prescriptionRequiredItems.filter(
    (item) => !uploadedPrescriptions[item.product._id],
  );

  const hasMissingPrescriptions = missingPrescriptions.length > 0;
  const subtotal = cart?.totalAmount || 0;
  const gst = subtotal > 0 ? Math.round(subtotal * 0.18) : 0;
  const shipping = subtotal > 0 ? 0 : 0; // Free shipping
  const total = subtotal + gst + shipping;

  return (
    <div className="min-h-screen bg-[#FFFBF9] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <h1 className="text-3xl font-extrabold text-[#0F172A] flex items-center gap-3">
            Your Cart{" "}
            <span className="text-[#0F172A]">({cart?.totalItems || 0})</span>
          </h1>
          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-red-500 font-semibold hover:text-red-600 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-orange-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              href="/products"
              className="inline-block bg-[#0F172A] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#1E293B] transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product._id}
                  className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-orange-50 flex items-center gap-4 sm:gap-6"
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-gray-50 rounded-2xl flex items-center justify-center p-2 border border-gray-100">
                    <img
                      src={
                        item.product.images?.[0]?.url ||
                        "https://images.unsplash.com/photo-1589924691995-400dc9ecc119"
                      }
                      alt={item.product.name}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>

                  <div className="flex-grow flex flex-col justify-between py-1">
                    <div>
                      <h3 className="text-lg font-bold text-[#0F172A] leading-tight mb-1">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">
                        {item.product.unit || "Standard Size"}
                      </p>
                    </div>

                    {item.product?.requiresPrescription && (
                      <div className="mt-2">
                        {uploadedPrescriptions[item.product._id] ? (
                          <div className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                            <CheckCircle2 size={15} />
                            Prescription uploaded
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openPrescriptionModal(item.product)}
                            className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-800 transition hover:bg-orange-100"
                          >
                            <Upload size={15} />
                            Upload Prescription
                          </button>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xl font-black text-[#0F172A]">
                        ₹{item.price}
                      </span>
                      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.product._id,
                              item.quantity,
                              -1,
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                          disabled={isCartLoading}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-[#0F172A]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.product._id,
                              item.quantity,
                              1,
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                          disabled={isCartLoading}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon & Summary Area */}
            <div className="bg-transparent mt-8">
              <h3 className="text-[#0F172A] font-bold mb-3">Apply Coupon</h3>
              <div className="flex gap-3 mb-8">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="flex-grow bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0F5132] shadow-sm"
                />
                <button className="bg-[#0F5132] text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-[#0A3622] transition-colors">
                  Apply
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Subtotal</span>
                  <span className="text-[#0F172A] font-bold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>GST (18%)</span>
                  <span className="text-[#0F172A] font-bold">₹{gst}</span>
                </div>
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Shipping</span>
                  <span className="text-[#0F5132] font-bold">Free</span>
                </div>

                <div className="h-px bg-gray-200 my-4"></div>

                <div className="flex justify-between items-end">
                  <span className="text-2xl font-extrabold text-[#0F172A]">
                    Total
                  </span>
                  <span className="text-3xl font-black text-[#0F172A]">
                    ₹{total}
                  </span>
                </div>
              </div>

              {hasMissingPrescriptions && (
                <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
                  <p className="font-bold text-amber-800">
                    Prescription Required
                  </p>
                  <p className="mt-1 text-sm text-amber-700">
                    Upload a prescription for each required product before
                    proceeding to checkout.
                  </p>
                  <ul className="mt-2 list-inside list-disc text-sm text-amber-800">
                    {missingPrescriptions.map((item) => (
                      <li key={item.product._id}>{item.product.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                disabled={hasMissingPrescriptions}
                onClick={() => {
                  if (!hasMissingPrescriptions) {
                    router.push("/checkout");
                  }
                }}
                className={`relative flex w-full items-center justify-center rounded-2xl py-5 text-lg font-bold transition-all ${
                  hasMissingPrescriptions
                    ? "cursor-not-allowed bg-gray-400 text-white"
                    : "bg-[#1e2338] text-white shadow-xl hover:bg-[#111424] active:scale-[0.98]"
                }`}
              >
                {hasMissingPrescriptions
                  ? "Upload Required Prescriptions"
                  : "Proceed to Checkout"}
                <ArrowRight className="absolute right-6 h-6 w-6" />
              </button>
            </div>
          </div>
        )}
      </div>

      {prescriptionProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 p-4 backdrop-blur-sm"
          onClick={closePrescriptionModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="prescription-title"
            className="w-full max-w-md overflow-hidden rounded-3xl border border-orange-100 bg-[#FFFBF9] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-orange-100 px-6 py-5">
              <div>
                <h2
                  id="prescription-title"
                  className="text-xl font-extrabold text-[#0F172A]"
                >
                  Upload Prescription
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Required for this medical product
                </p>
              </div>

              <button
                type="button"
                onClick={closePrescriptionModal}
                disabled={uploadingPrescription}
                aria-label="Close popup"
                className="rounded-full p-2 text-gray-500 transition hover:bg-orange-50 hover:text-[#0F172A] disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-5 p-6">
              {/* Product */}
              <div className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-white p-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-orange-50">
                  {prescriptionProduct.images?.[0]?.url ? (
                    <img
                      src={prescriptionProduct.images[0].url}
                      alt={prescriptionProduct.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <FileImage className="text-orange-400" size={26} />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-bold text-[#0F172A]">
                    {prescriptionProduct.name}
                  </p>
                  <p className="mt-1 text-xs text-orange-700">
                    Prescription required
                  </p>
                </div>
              </div>

              {/* Upload area */}
              <div>
                <label
                  htmlFor="prescription-image"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50/50 px-4 py-7 text-center transition hover:border-orange-500 hover:bg-orange-50"
                >
                  {prescriptionPreview ? (
                    <img
                      src={prescriptionPreview}
                      alt="Prescription preview"
                      className="mb-3 max-h-48 max-w-full rounded-xl object-contain"
                    />
                  ) : (
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                      <Upload size={25} />
                    </div>
                  )}

                  <span className="text-sm font-bold text-[#0F172A]">
                    {prescriptionFile
                      ? prescriptionFile.name
                      : "Choose prescription image"}
                  </span>

                  <span className="mt-1 text-xs text-gray-500">
                    JPG, PNG or WebP · Maximum 10 MB
                  </span>

                  <span className="mt-3 rounded-xl bg-[#0F172A] px-4 py-2 text-xs font-bold text-white">
                    Browse Files
                  </span>

                  <input
                    id="prescription-image"
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
                  <p
                    role="alert"
                    className="mt-3 text-sm font-medium text-red-600"
                  >
                    {prescriptionError}
                  </p>
                )}
              </div>

              {/* Privacy note */}
              <div className="rounded-xl border border-orange-100 bg-white p-3">
                <p className="text-xs leading-5 text-gray-600">
                  Your prescription image will be converted to WebP and securely
                  uploaded for review. Please ensure the image is clear and all
                  details are readable.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closePrescriptionModal}
                  disabled={uploadingPrescription}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handlePrescriptionUpload}
                  disabled={!prescriptionFile || uploadingPrescription}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0F5132] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0A3622] disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {uploadingPrescription ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={17} />
                      Upload Prescription
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
