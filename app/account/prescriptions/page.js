"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  FileImage,
  Clock3,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { prescriptionService } from "@/lib/services";

/* ─── helpers ──────────────────────────────────────────────── */

const STATUS_CONFIG = {
  PENDING: {
    label: "Under Review",
    description: "Waiting for admin approval.",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    Icon: Clock3,
  },
  APPROVED: {
    label: "Approved",
    description: "You may proceed to checkout.",
    className: "border-green-200 bg-green-50 text-green-800",
    badge: "bg-green-100 text-green-800 border-green-200",
    Icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    description: "See the admin note and upload a corrected prescription.",
    className: "border-red-200 bg-red-50 text-red-800",
    badge: "bg-red-100 text-red-800 border-red-200",
    Icon: AlertCircle,
  },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Group prescriptions by productId.
 * The first item in each group (newest) is the "current" prescription.
 */
function groupByProduct(prescriptions) {
  const map = new Map();
  // prescriptions are already sorted newest-first from the API
  for (const rx of prescriptions) {
    const productId =
      typeof rx.productId === "object" ? rx.productId._id : rx.productId;
    if (!map.has(productId)) {
      map.set(productId, []);
    }
    map.get(productId).push(rx);
  }
  return Array.from(map.entries()).map(([productId, versions]) => ({
    productId,
    productName:
      versions[0]?.productId?.name ||
      `Product (${String(productId).slice(-6)})`,
    current: versions[0],        // newest = current
    history: versions.slice(1),  // older versions
  }));
}

/* ─── sub-components ───────────────────────────────────────── */

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;
  const Icon = config.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${config.badge}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

function PrescriptionCard({ group }) {
  const { productName, current, history } = group;
  const [showHistory, setShowHistory] = useState(false);
  const config = STATUS_CONFIG[current.status] || {};
  const Icon = config.Icon || FileImage;

  return (
    <article className="rounded-3xl border border-orange-50 bg-white shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF8F5] border border-orange-100">
            <FileImage className="h-6 w-6 text-[#ff6f4d]" />
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-[#142653] leading-tight truncate">
              {productName}
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Version {current.version} · Uploaded {formatDate(current.createdAt)}
            </p>
          </div>
        </div>
        <StatusBadge status={current.status} />
      </div>

      {/* Status detail */}
      <div className={`mx-5 mb-4 sm:mx-6 rounded-2xl border p-4 ${config.className}`}>
        <div className="flex items-center gap-2 font-bold text-sm">
          <Icon className="w-4 h-4" />
          {config.label}
        </div>
        <p className="mt-1 text-xs leading-5">{config.description}</p>

        {current.status === "REJECTED" && current.adminNote && (
          <div className="mt-3 rounded-xl bg-white/60 border border-red-200 p-3">
            <p className="text-xs font-bold text-red-700 mb-1">Admin Note:</p>
            <p className="text-xs text-red-800 leading-relaxed whitespace-pre-wrap">
              {current.adminNote}
            </p>
          </div>
        )}

        {current.status === "APPROVED" && (
          <Link
            href="/cart"
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-green-300 bg-green-100 px-3 py-1.5 text-xs font-bold text-green-800 hover:bg-green-200 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Proceed to cart
          </Link>
        )}

        {(current.status === "REJECTED" || current.status === "PENDING") && (
          <Link
            href="/cart"
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-current bg-white/40 px-3 py-1.5 text-xs font-bold hover:bg-white/60 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {current.status === "REJECTED" ? "Upload again in cart" : "View in cart"}
          </Link>
        )}
      </div>

      {/* Review info (if reviewed) */}
      {current.reviewedAt && (
        <div className="mx-5 mb-4 sm:mx-6 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-600">
          <span className="font-semibold">Reviewed:</span>{" "}
          {formatDate(current.reviewedAt)}
        </div>
      )}

      {/* Version history toggle */}
      {history.length > 0 && (
        <div className="border-t border-orange-50">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="flex w-full items-center justify-between px-5 py-3 sm:px-6 text-xs font-bold text-gray-500 hover:bg-orange-50/50 transition"
          >
            <span>Previous versions ({history.length})</span>
            {showHistory ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showHistory && (
            <div className="px-5 pb-4 sm:px-6 space-y-3">
              {history.map((rx) => (
                <div
                  key={rx._id}
                  className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-700">
                      Version {rx.version}
                    </span>
                    <StatusBadge status={rx.status} />
                  </div>
                  <p className="text-xs text-gray-500">
                    Uploaded: {formatDate(rx.createdAt)}
                  </p>
                  {rx.reviewedAt && (
                    <p className="text-xs text-gray-500">
                      Reviewed: {formatDate(rx.reviewedAt)}
                    </p>
                  )}
                  {rx.adminNote && (
                    <p className="mt-1.5 text-xs text-gray-600 border-l-2 border-gray-300 pl-2 leading-relaxed">
                      {rx.adminNote}
                    </p>
                  )}
                  <p className="mt-1 text-[10px] text-gray-400 italic">
                    Superseded — cannot be used for checkout
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

/* ─── page ─────────────────────────────────────────────────── */

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const res = await prescriptionService.getMy();
      const rows = res?.data?.data || res?.data || [];
      setPrescriptions(Array.isArray(rows) ? rows : []);
    } catch (err) {
      console.error("Failed to load prescriptions:", err);
      setError(err?.message || "Failed to load prescriptions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const groups = groupByProduct(prescriptions);

  /* ── render ── */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FFF8F5] rounded-2xl flex items-center justify-center border border-orange-100">
              <FileImage className="w-6 h-6 text-[#ff6f4d]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#142653]">
                My Prescriptions
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Upload and track prescriptions for medical pet products.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={load}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Status legend */}
        <div className="mt-5 flex flex-wrap gap-3">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.Icon;
            return (
              <div
                key={key}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.badge}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cfg.label}: {cfg.description}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-[#ff6f4d]" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && groups.length === 0 && (
        <div className="rounded-3xl border border-orange-50 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF8F5]">
            <FileImage className="h-9 w-9 text-[#ff6f4d]" />
          </div>
          <h2 className="text-xl font-black text-[#142653] mb-2">
            No Prescriptions Yet
          </h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            Add a prescription-required product to your cart and upload a prescription to get started.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-[#142653] px-7 py-3 font-bold text-white hover:bg-[#142653]/90 transition"
          >
            Browse Products
          </Link>
        </div>
      )}

      {/* Prescription cards */}
      {!isLoading && groups.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 font-medium">
            {groups.length} product{groups.length !== 1 ? "s" : ""} with prescription records
          </p>
          {groups.map((group) => (
            <PrescriptionCard key={group.productId} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
