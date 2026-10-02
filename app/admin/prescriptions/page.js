"use client";

import { useEffect, useState } from "react";
import { Eye, Check, X, Image as ImageIcon } from "lucide-react";

import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";

import { prescriptionService } from "@/lib/services";

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const [imageUrl, setImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");

  const [imageRetry, setImageRetry] = useState(0);

  useEffect(() => {
    if (!reviewing?._id) return;

    let objectUrl;

    const loadImage = async () => {
      setImageLoading(true);
      setImageError("");
      setImageUrl("");

      try {
        const response = await prescriptionService.getImage(reviewing._id);
        console.log("Response:", response);
        console.log("Is Blob:", response instanceof Blob);
        console.log("Response data:", response?.data);

        // Handles both Axios responses and API wrappers returning response.data
        const blob = response instanceof Blob ? response : response?.data;

        console.log("Final Blob:", blob);
        console.log("Blob size:", blob?.size);
        console.log("Blob type:", blob?.type);

        if (!(blob instanceof Blob) || blob.size === 0) {
          throw new Error("Prescription image is empty.");
        }

        // If the server returned a JSON error as a Blob, show its message
        if (blob.type.includes("application/json")) {
          const errorData = JSON.parse(await blob.text());
          throw new Error(errorData.message || "Unable to load image.");
        }

        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      } catch (error) {
        console.error("Prescription image error:", error);
        setImageError(error.message || "Failed to load prescription image.");
      } finally {
        setImageLoading(false);
      }
    };

    loadImage();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [reviewing?._id, imageRetry]);

  // Load all prescriptions
  const loadPrescriptions = async () => {
    setLoading(true);

    try {
      const response = await prescriptionService.adminGetAll();

      setPrescriptions(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load prescriptions:", error);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  // Load the selected prescription image

  // Open review modal
  const openReview = (item) => {
    setRejectionReason("");
    setReviewing(item);
  };

  // Close review modal
  const closeReview = () => {
    if (processing) return;

    setReviewing(null);
    setRejectionReason("");
    setImageUrl("");
    setImageError("");
  };

  // Approve or reject prescription
  const review = async (status) => {
    if (!reviewing || processing) return;

    if (status === "REJECTED" && !rejectionReason.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }

    setProcessing(true);

    try {
      await prescriptionService.adminReview(
        reviewing._id,
        status,
        status === "REJECTED" ? rejectionReason.trim() : "",
      );

      setReviewing(null);
      setRejectionReason("");

      await loadPrescriptions();
    } catch (error) {
      console.error("Prescription review failed:", error);

      alert(error?.message || "Failed to review prescription.");
    } finally {
      setProcessing(false);
    }
  };

  // Table columns
  const columns = [
    {
      key: "user",
      label: "Customer",
      render: (item) => (
        <div>
          <p className="font-semibold text-zinc-900">
            {item.user?.name || item.user?.email || "Customer"}
          </p>

          <p className="text-xs text-zinc-500">{item.user?.email || "-"}</p>
        </div>
      ),
    },
    {
      key: "product",
      label: "Product",
      render: (item) => (
        <div>
          <p className="font-medium text-zinc-800">
            {item.product?.name || item.product?.title || "Product"}
          </p>

          <p className="text-xs text-zinc-500">
            {item.productId?._id || item.productId || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "notes",
      label: "Notes",
      render: (item) => (
        <span className="line-clamp-2 max-w-xs text-sm text-zinc-500">
          {item.notes || "-"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "createdAt",
      label: "Uploaded",
      render: (item) =>
        item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-",
    },
    {
      key: "actions",
      label: "Review",
      render: (item) => (
        <button
          type="button"
          onClick={() => openReview(item)}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
        >
          <Eye size={14} />
          Review
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prescriptions"
        description="Review and manage customer prescription uploads."
      />

      {/* Prescriptions table */}
      <DataTable
        columns={columns}
        data={prescriptions}
        loading={loading}
        emptyTitle="No prescriptions found"
      />

      {/* Prescription review modal */}
      {reviewing && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeReview();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="prescription-modal-title"
            className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Modal header */}
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <h2
                  id="prescription-modal-title"
                  className="text-lg font-bold text-zinc-900 sm:text-xl"
                >
                  Prescription Review
                </h2>

                <p className="mt-1 truncate text-sm text-zinc-500">
                  {reviewing.user?.name || reviewing.user?.email || "Customer"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <StatusBadge status={reviewing.status} />

                <button
                  type="button"
                  onClick={closeReview}
                  disabled={processing}
                  aria-label="Close modal"
                  className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal content */}
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
              {/* Customer and prescription details */}
              <div className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Customer
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-zinc-900">
                    {reviewing.user?.name || "Customer"}
                  </p>
                  <p className="break-all text-xs text-zinc-500">
                    {reviewing.user?.email || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Upload date
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900">
                    {reviewing.createdAt
                      ? new Date(reviewing.createdAt).toLocaleString("en-IN")
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Product
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-zinc-900">
                    {reviewing.product?.name ||
                      reviewing.product?.title ||
                      "Product"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Order ID
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-zinc-900">
                    {reviewing.orderId?._id || reviewing.orderId || "-"}
                  </p>
                </div>
              </div>

              {/* Prescription image preview */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900">
                    Prescription Image
                  </h3>

                  {imageUrl && (
                    <a
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                    >
                      Open full size
                    </a>
                  )}
                </div>

                <div className="flex min-h-[300px] items-center justify-center rounded-xl border bg-gray-50 p-4">
                  {imageLoading ? (
                    <p className="text-gray-500">
                      Loading prescription image...
                    </p>
                  ) : imageError ? (
                    <div className="text-center">
                      <p className="text-red-500">{imageError}</p>
                      <button
                        type="button"
                        onClick={() => setImageRetry((prev) => prev + 1)}
                        className="mt-3 text-orange-600 hover:underline"
                      >
                        Retry
                      </button>
                    </div>
                  ) : imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Prescription"
                      className="max-h-[400px] w-full rounded-lg object-contain"
                      onError={() =>
                        setImageError("The image could not be displayed.")
                      }
                    />
                  ) : (
                    <p className="text-gray-500">
                      No prescription image available.
                    </p>
                  )}
                </div>
              </div>

              {/* Customer notes */}
              {reviewing.notes && (
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <h3 className="mb-2 text-sm font-bold text-zinc-900">
                    Customer Notes
                  </h3>

                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-600">
                    {reviewing.notes}
                  </p>
                </div>
              )}

              {/* Previous admin review */}
              {reviewing.adminNote && (
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <h3 className="mb-2 text-sm font-bold text-zinc-900">
                    Admin Note
                  </h3>

                  <p className="whitespace-pre-wrap break-words text-sm text-zinc-700">
                    {reviewing.adminNote}
                  </p>
                </div>
              )}

              {/* Rejection reason */}
              {reviewing.status === "PENDING" && (
                <div>
                  <label
                    htmlFor="rejectionReason"
                    className="mb-2 block text-sm font-semibold text-zinc-800"
                  >
                    Rejection Reason
                    <span className="ml-1 font-normal text-zinc-400">
                      (Required when rejecting)
                    </span>
                  </label>

                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter the reason for rejecting this prescription..."
                    rows={3}
                    maxLength={2000}
                    disabled={processing}
                    className="w-full resize-y rounded-xl border border-zinc-200 p-4 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:bg-zinc-100"
                  />

                  <p className="mt-1 text-right text-xs text-zinc-400">
                    {rejectionReason.length}/2000
                  </p>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-zinc-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <button
                type="button"
                onClick={closeReview}
                disabled={processing}
                className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Close
              </button>

              {reviewing.status === "PENDING" ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    disabled={processing || !rejectionReason.trim()}
                    onClick={() => review("REJECTED")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X size={16} />
                    {processing ? "Processing..." : "Reject"}
                  </button>

                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => review("APPROVED")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-400 px-5 py-2.5 text-sm font-bold text-zinc-950 transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Check size={16} />
                    {processing ? "Processing..." : "Approve"}
                  </button>
                </div>
              ) : (
                <p className="text-sm font-medium text-zinc-500">
                  This prescription has already been reviewed.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
