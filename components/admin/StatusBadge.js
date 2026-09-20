const styles = {
  ACTIVE: "bg-orange-100 text-orange-700",
  INACTIVE: "bg-zinc-100 text-zinc-600",
  PENDING: "bg-amber-100 text-amber-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-orange-100 text-orange-700",
  CANCELLED: "bg-red-100 text-red-700",
  APPROVED: "bg-orange-100 text-orange-700",
  REJECTED: "bg-red-100 text-red-700",
  REQUESTED: "bg-amber-100 text-amber-700",
  ITEM_RECEIVED: "bg-blue-100 text-blue-700",
  REFUNDED: "bg-orange-100 text-orange-700",
  LABEL_CREATED: "bg-zinc-100 text-zinc-700",
  PICKED_UP: "bg-blue-100 text-blue-700",
  IN_TRANSIT: "bg-indigo-100 text-indigo-700",
  OUT_FOR_DELIVERY: "bg-amber-100 text-amber-700",
  FAILED_ATTEMPT: "bg-red-100 text-red-700",
  RETURNED_TO_SENDER: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }) {
  const normalized = String(status || "UNKNOWN").toUpperCase();

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[normalized] || "bg-zinc-100 text-zinc-600"
        }`}
    >
      {normalized.replaceAll("_", " ")}
    </span>
  );
}