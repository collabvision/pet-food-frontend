"use client";

import { useEffect, useState } from "react";
import { Eye, Check, X } from "lucide-react";

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

    const loadPrescriptions = async () => {
        setLoading(true);

        try {
            const response = await prescriptionService.adminGetAll();

            setPrescriptions(
                Array.isArray(response?.data)
                    ? response.data
                    : []
            );
        } catch (error) {
            console.error(error);
            setPrescriptions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPrescriptions();
    }, []);

    const review = async (status) => {
        if (!reviewing) return;

        setProcessing(true);

        try {
            await prescriptionService.adminReview(
                reviewing._id,
                status,
                status === "REJECTED" ? rejectionReason : ""
            );

            setReviewing(null);
            setRejectionReason("");

            await loadPrescriptions();
        } catch (error) {
            alert(error?.message || "Failed to review prescription.");
        } finally {
            setProcessing(false);
        }
    };

    const columns = [
        {
            key: "user",
            label: "Customer",
            render: (item) => (
                <div>
                    <p className="font-semibold">
                        {item.user?.name || item.user?.email || "Customer"}
                    </p>
                    <p className="text-xs text-zinc-500">
                        {item.user?.email || "-"}
                    </p>
                </div>
            ),
        },
        {
            key: "notes",
            label: "Notes",
            render: (item) => (
                <span className="line-clamp-2 max-w-xs text-zinc-500">
                    {item.notes || "-"}
                </span>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (item) => (
                <StatusBadge status={item.status} />
            ),
        },
        {
            key: "createdAt",
            label: "Uploaded",
            render: (item) =>
                item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("en-IN")
                    : "-",
        },
        {
            key: "actions",
            label: "Review",
            render: (item) => (
                <button
                    type="button"
                    onClick={() => setReviewing(item)}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold hover:bg-zinc-100"
                >
                    <Eye size={14} />
                    Review
                </button>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Prescriptions"
                description="Review customer prescription uploads."
            />

            <DataTable
                columns={columns}
                data={prescriptions}
                loading={loading}
                emptyTitle="No prescriptions found"
            />

            {reviewing && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold">
                                    Prescription Review
                                </h2>

                                <p className="mt-1 text-sm text-zinc-500">
                                    {reviewing.user?.name ||
                                        reviewing.user?.email ||
                                        "Customer"}
                                </p>
                            </div>

                            <StatusBadge status={reviewing.status} />
                        </div>

                        {reviewing.fileUrl && (
                            <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200">
                                <img
                                    src={reviewing.fileUrl}
                                    alt="Prescription"
                                    className="max-h-[500px] w-full object-contain"
                                />
                            </div>
                        )}

                        {reviewing.notes && (
                            <div className="mt-4 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600">
                                {reviewing.notes}
                            </div>
                        )}

                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Rejection reason if rejecting..."
                            rows={3}
                            className="mt-5 w-full resize-none rounded-xl border border-zinc-200 p-4 text-sm outline-none focus:border-orange-400"
                        />

                        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                disabled={processing}
                                onClick={() => review("REJECTED")}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                            >
                                <X size={16} />
                                Reject
                            </button>

                            <button
                                type="button"
                                disabled={processing}
                                onClick={() => review("APPROVED")}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-400 px-4 py-2.5 text-sm font-bold text-zinc-950 disabled:opacity-50"
                            >
                                <Check size={16} />
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}