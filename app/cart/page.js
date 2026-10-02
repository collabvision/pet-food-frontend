
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Minus,
  Plus,
  ArrowRight,
  Loader2,
  X,
  Upload,
  FileImage,
  CheckCircle2,
  Clock3,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cartService, prescriptionService } from "@/lib/services";
import { convertToWebp } from "@/lib/utils/convertToWebp";

const STATUS_META = {
  PENDING: {
    label: "Under review",
    description: "Your prescription is awaiting admin review.",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    Icon: Clock3,
  },
  APPROVED: {
    label: "Approved",
    description: "Your prescription has been approved.",
    className: "border-green-200 bg-green-50 text-green-800",
    Icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected — upload again",
    description: "Please upload a corrected prescription.",
    className: "border-red-200 bg-red-50 text-red-800",
    Icon: AlertCircle,
  },
};

const formatPrice = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState(null);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [coupon, setCoupon] = useState("");

  const [prescriptions, setPrescriptions] = useState({});
  const [prescriptionProduct, setPrescriptionProduct] = useState(null);
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState("");
  const [uploadingPrescription, setUploadingPrescription] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState("");

  const fetchCart = useCallback(async () => {
    try {
      setIsCartLoading(true);
      setPageError("");

      const response = await cartService.get();
      setCart(response?.data || null);
    } catch (error) {
      console.error("Cart fetch error:", error);
      setPageError(error?.message || "Unable to load your cart.");
    } finally {
      setIsCartLoading(false);
    }
  }, []);

  const fetchPrescriptions = useCallback(async () => {
    try {
      const response = await prescriptionService.getMy();

      const rows =
        response?.data?.data ||
        response?.data ||
        [];

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
          new Date(
            prescription.updatedAt ||
              prescription.createdAt ||
              0
          ) >=
            new Date(
              existing.updatedAt ||
                existing.createdAt ||
                0
            )
        ) {
          next[productId] = prescription;
        }
      });

      setPrescriptions(next);
    } catch (error) {
      console.warn("Could not load prescription statuses:", error);
    }
  }, []);

  useEffect(() => {
    fetchCart();
    fetchPrescriptions();
  }, [fetchCart, fetchPrescriptions]);

  const items = cart?.items || [];

  const prescriptionItems = useMemo(
    () =>
      items.filter(
        (item) => item.product?.requiresPrescription
      ),
    [items]
  );

  const nonPrescriptionItems = useMemo(
    () =>
      items.filter(
        (item) => !item.product?.requiresPrescription
      ),
    [items]
  );

  const getPrescription = (productId) =>
    prescriptions[productId] || null;

  const isApproved = (productId) =>
    getPrescription(productId)?.status === "APPROVED";

  const pendingItems = prescriptionItems.filter(
    (item) => !isApproved(item.product?._id)
  );

  const subtotal =
    Number(cart?.totalAmount) ||
    items.reduce(
      (sum, item) =>
        sum +
        (Number(item.price) || 0) *
          (Number(item.quantity) || 0),
      0
    );

  const gst =
    subtotal > 0
      ? Math.round(subtotal * 0.18 * 100) / 100
      : 0;

  const shipping = 0;
  const total = subtotal + gst + shipping;

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

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(
        file.type
      )
    ) {
      setPrescriptionError(
        "Choose a JPG, PNG, or WebP image."
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPrescriptionError(
        "Image size must be less than 10 MB."
      );
      return;
    }

    setPrescriptionFile(file);
    setPrescriptionPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (prescriptionPreview) {
        URL.revokeObjectURL(prescriptionPreview);
      }
    };
  }, [prescriptionPreview]);

  const handlePrescriptionUpload = async () => {
    if (!prescriptionFile || !prescriptionProduct) {
      setPrescriptionError(
        "Please select a prescription image."
      );
      return;
    }

    setUploadingPrescription(true);
    setPrescriptionError("");

    try {
      const webpFile = await convertToWebp(
        prescriptionFile
      );

      const formData = new FormData();
      formData.append(
        "file",
        webpFile,
        "prescription.webp"
      );
      formData.append(
        "productId",
        prescriptionProduct._id
      );

      const response =
        await prescriptionService.upload(formData);

      const prescription =
        response?.data?.data || response?.data;

      if (!prescription?._id) {
        throw new Error(
          "The server returned an invalid prescription response."
        );
      }

      setPrescriptions((previous) => ({
        ...previous,
        [prescriptionProduct._id]: prescription,
      }));

      // Close directly here because uploading is still true.
      setPrescriptionProduct(null);
      setPrescriptionFile(null);
      setPrescriptionPreview("");
      setPrescriptionError("");

      await fetchPrescriptions();
    } catch (error) {
      console.error(
        "Prescription upload failed:",
        error
      );

      setPrescriptionError(
        error?.response?.data?.message ||
          error?.message ||
          "Upload failed. Please try again."
      );
    } finally {
      setUploadingPrescription(false);
    }
  };

  const changeQuantity = async (
    productId,
    quantity,
    delta
  ) => {
    const nextQuantity = quantity + delta;

    try {
      setPageError("");

      if (nextQuantity < 1) {
        await cartService.removeItem(productId);
      } else {
        await cartService.updateItem(
          productId,
          nextQuantity
        );
      }

      await fetchCart();
    } catch (error) {
      console.error("Cart update error:", error);
      setPageError(
        error?.message || "Unable to update cart."
      );
    }
  };

  const clearCart = async () => {
    try {
      setPageError("");
      await cartService.clear();
      setCart(null);
      setPrescriptions({});
    } catch (error) {
      console.error("Clear cart error:", error);
      setPageError(
        error?.message || "Unable to clear cart."
      );
    }
  };

  const proceedToCheckout = (mode = "all") => {
    if (mode === "all" && pendingItems.length > 0) {
      return;
    }

    if (
      mode === "non-prescription" &&
      nonPrescriptionItems.length === 0
    ) {
      return;
    }

    router.push(
      mode === "non-prescription"
        ? "/checkout?items=non-prescription"
        : "/checkout"
    );
  };

  if (isCartLoading && !cart) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFBF9]">
        <Loader2 className="h-10 w-10 animate-spin text-[#0F5132]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFBF9] px-4 py-10 font-sans sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Page heading */}
        <header className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0F172A]">
              Your Cart{" "}
              <span className="text-[#0F5132]">
                ({cart?.totalItems || 0})
              </span>
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Review your items and prescription status.
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-sm font-semibold text-red-600 hover:text-red-700"
            >
              Clear all
            </button>
          )}
        </header>

        {pageError && (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {pageError}
          </p>
        )}

        {/* Empty cart */}
        {items.length === 0 ? (
          <section className="rounded-3xl border border-orange-50 bg-white p-12 text-center shadow-sm">
            <h2 className="mb-3 text-2xl font-bold text-gray-800">
              Your cart is empty
            </h2>
            <p className="mb-7 text-gray-500">
              Looks like you have not added anything yet.
            </p>
            <Link
              href="/products"
              className="inline-flex rounded-full bg-[#0F172A] px-8 py-3 font-semibold text-white hover:bg-[#1E293B]"
            >
              Start shopping
            </Link>
          </section>
        ) : (
          <div className="space-y-6">
            {/* Cart products */}
            <section className="space-y-4">
              {items.map((item) => {
                const product = item.product || {};
                const productId = product._id;

                const prescription =
                  product.requiresPrescription
                    ? getPrescription(productId)
                    : null;

                const status = prescription?.status;
                const meta = STATUS_META[status] || null;
                const StatusIcon = meta?.Icon;

                return (
                  <article
                    key={productId}
                    className="flex flex-col gap-4 rounded-3xl border border-orange-50 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:gap-6 sm:p-6"
                  >
                    {/* Product image */}
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 p-2 sm:h-28 sm:w-28">
                      <img
                        src={
                          product.images?.[0]?.url ||
                          "https://images.unsplash.com/photo-1589924691995-400dc9ecc119"
                        }
                        alt={product.name || "Product"}
                        className="h-full w-full object-contain mix-blend-multiply"
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                      <div>
                        <h2 className="font-bold leading-tight text-[#0F172A]">
                          {product.name || "Product"}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          {product.unit || "Standard size"}
                        </p>
                      </div>

                      {/* Prescription status and actions */}
                      {product.requiresPrescription && (
                        <div className="space-y-2">
                          {meta ? (
                            <div
                              className={`rounded-xl border p-3 ${meta.className}`}
                            >
                              <div className="flex items-center gap-2 text-sm font-bold">
                                <StatusIcon size={16} />
                                {meta.label}
                              </div>
                              <p className="mt-1 text-xs leading-5">
                                {meta.description}
                              </p>

                              {status === "REJECTED" &&
                                prescription?.adminNote && (
                                  <p className="mt-1 text-xs">
                                    <strong>
                                      Review note:
                                    </strong>{" "}
                                    {prescription.adminNote}
                                  </p>
                                )}
                            </div>
                          ) : (
                            <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs font-semibold text-orange-800">
                              Prescription required — not
                              uploaded yet.
                            </div>
                          )}

                          {status !== "APPROVED" && (
                            <button
                              type="button"
                              onClick={() =>
                                openPrescriptionModal(product)
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-800 transition hover:bg-orange-100"
                            >
                              {status === "REJECTED" ? (
                                <RefreshCw size={15} />
                              ) : (
                                <Upload size={15} />
                              )}

                              {status === "REJECTED"
                                ? "Upload again"
                                : status === "PENDING"
                                  ? "Replace prescription"
                                  : "Upload prescription"}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Price and quantity */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xl font-black text-[#0F172A]">
                          {formatPrice(item.price)}
                        </span>

                        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                          <button
                            type="button"
                            aria-label={`Decrease ${product.name} quantity`}
                            onClick={() =>
                              changeQuantity(
                                productId,
                                item.quantity,
                                -1
                              )
                            }
                            disabled={isCartLoading}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Minus size={16} />
                          </button>

                          <span className="w-8 text-center font-bold text-[#0F172A]">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            aria-label={`Increase ${product.name} quantity`}
                            onClick={() =>
                              changeQuantity(
                                productId,
                                item.quantity,
                                1
                              )
                            }
                            disabled={isCartLoading}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* Prescription overview */}
            {prescriptionItems.length > 0 && (
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h2 className="font-bold text-amber-900">
                  Prescription review
                </h2>
                <p className="mt-1 text-sm text-amber-800">
                  Prescription products require approval before
                  checkout. You can check out eligible
                  non-prescription items separately.
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-white px-3 py-1 font-semibold text-gray-700">
                    Required: {prescriptionItems.length}
                  </span>
                  <span className="rounded-full bg-green-100 px-3 py-1 font-semibold text-green-800">
                    Approved:{" "}
                    {
                      prescriptionItems.filter((item) =>
                        isApproved(item.product?._id)
                      ).length
                    }
                  </span>
                  <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-900">
                    Awaiting/action needed: {pendingItems.length}
                  </span>
                </div>
              </section>
            )}

            {/* Coupon and order summary */}
            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
              <h2 className="mb-4 font-bold text-[#0F172A]">
                Apply coupon
              </h2>

              <div className="mb-7 flex gap-3">
                <input
                  value={coupon}
                  onChange={(event) =>
                    setCoupon(event.target.value)
                  }
                  placeholder="Enter coupon code"
                  className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
                />
                <button
                  type="button"
                  onClick={() =>
                    alert("Coupon validation is not connected yet.")
                  }
                  className="rounded-xl bg-[#0F5132] px-5 py-3 font-bold text-white hover:bg-[#0A3622]"
                >
                  Apply
                </button>
              </div>

              <div className="space-y-3 text-sm font-medium text-gray-600">
                <div className="flex justify-between">
                  <span>Cart subtotal</span>
                  <strong className="text-[#0F172A]">
                    {formatPrice(subtotal)}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <strong className="text-[#0F172A]">
                    {formatPrice(gst)}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <strong className="text-green-700">
                    Free
                  </strong>
                </div>

                <div className="my-4 h-px bg-gray-200" />

                <div className="flex items-end justify-between">
                  <span className="text-xl font-extrabold text-[#0F172A]">
                    Total
                  </span>
                  <strong className="text-2xl font-black text-[#0F172A]">
                    {formatPrice(total)}
                  </strong>
                </div>
              </div>

              {/* Checkout options */}
              <div className="mt-6 space-y-3">
                {nonPrescriptionItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      proceedToCheckout("non-prescription")
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0F5132] px-5 py-4 font-bold text-white transition hover:bg-[#0A3622] active:scale-[0.99]"
                  >
                    Checkout non-prescription items
                    <ArrowRight size={19} />
                  </button>
                )}

                <button
                  type="button"
                  disabled={pendingItems.length > 0}
                  onClick={() => proceedToCheckout("all")}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1e2338] px-5 py-4 font-bold text-white transition hover:bg-[#111424] disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {pendingItems.length > 0
                    ? "Approve all prescriptions to checkout"
                    : "Proceed to checkout"}
                  <ArrowRight size={19} />
                </button>

                {pendingItems.length > 0 && (
                  <p className="text-center text-xs text-gray-500">
                    Prescription items remain in your cart until
                    approved. You can still check out eligible
                    non-prescription items above.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Prescription upload modal */}
      {prescriptionProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 p-4 backdrop-blur-sm"
          onClick={closePrescriptionModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="prescription-dialog-title"
            className="w-full max-w-md overflow-hidden rounded-3xl border border-orange-100 bg-[#FFFBF9] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-orange-100 px-6 py-5">
              <div>
                <h2
                  id="prescription-dialog-title"
                  className="text-xl font-extrabold text-[#0F172A]"
                >
                  {prescriptions[prescriptionProduct._id]
                    ?.status === "REJECTED"
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
                <X size={20} />
              </button>
            </header>

            <div className="space-y-5 p-6">
              <label
                htmlFor="prescription-image"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50/50 px-4 py-7 text-center hover:bg-orange-50"
              >
                {prescriptionPreview ? (
                  <img
                    src={prescriptionPreview}
                    alt="Selected prescription preview"
                    className="mb-3 max-h-48 max-w-full rounded-xl object-contain"
                  />
                ) : (
                  <FileImage
                    className="mb-3 text-orange-500"
                    size={34}
                  />
                )}

                <span className="text-sm font-bold text-[#0F172A]">
                  {prescriptionFile?.name ||
                    "Choose prescription image"}
                </span>

                <span className="mt-1 text-xs text-gray-500">
                  JPG, PNG, or WebP · Maximum 10 MB
                </span>

                <span className="mt-3 rounded-xl bg-[#0F172A] px-4 py-2 text-xs font-bold text-white">
                  Browse files
                </span>

                <input
                  id="prescription-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={uploadingPrescription}
                  onChange={(event) =>
                    handlePrescriptionFile(
                      event.target.files?.[0]
                    )
                  }
                />
              </label>

              {prescriptionError && (
                <p
                  role="alert"
                  className="text-sm font-medium text-red-600"
                >
                  {prescriptionError}
                </p>
              )}

              <p className="rounded-xl border border-orange-100 bg-white p-3 text-xs leading-5 text-gray-600">
                The image is converted to WebP before upload
                and sent for review. Ensure all prescription
                details are clear and readable.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closePrescriptionModal}
                  disabled={uploadingPrescription}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handlePrescriptionUpload}
                  disabled={
                    !prescriptionFile ||
                    uploadingPrescription
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0F5132] px-4 py-3 text-sm font-bold text-white hover:bg-[#0A3622] disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {uploadingPrescription ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={17} />
                      Submit for review
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}