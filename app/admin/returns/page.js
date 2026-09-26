"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { returnService } from "@/lib/services";

const STATUSES = [
    "REQUESTED",
    "APPROVED",
    "REJECTED",
    "PICKUP_PENDING",
    "PICKED_UP",
    "REFUNDED",
    "CANCELLED"
];

export default function ReturnsPage() {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [refundModal, setRefundModal] = useState({ open: false, item: null, amount: "", paymentId: "" });

    const loadReturns = async () => {
        setLoading(true);

        try {
            const response = await returnService.adminGetAll();

            setReturns(
                Array.isArray(response?.data)
                    ? response.data
                    : []
            );
        } catch (error) {
            console.error(error);
            setReturns([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReturns();
    }, []);

    const updateStatus = async (item, status, extraPayload = {}) => {
        if (status === "REFUNDED" && !extraPayload.refundAmount) {
            // Open modal to get refund details
            setRefundModal({ 
                open: true, 
                item, 
                amount: item.refundAmount || 0, 
                paymentId: item.refundPaymentId || "" 
            });
            return;
        }

        setProcessing(item._id);

        try {
            await returnService.adminUpdateStatus(
                item._id,
                status,
                `Return status changed to ${status}`,
                extraPayload
            );

            await loadReturns();
        } catch (error) {
            alert(error?.response?.data?.message || error?.message || "Failed to update return.");
        } finally {
            setProcessing(null);
            setRefundModal({ open: false, item: null, amount: "", paymentId: "" });
        }
    };

    const submitRefund = () => {
        if (!refundModal.amount || refundModal.amount <= 0) {
            alert("Refund amount must be greater than 0");
            return;
        }
        
        updateStatus(refundModal.item, "REFUNDED", { 
            refundAmount: Number(refundModal.amount),
            refundPaymentId: refundModal.paymentId 
        });
    };

    const columns = [
        {
            key: "returnNumber",
            label: "Return",
            render: (item) => (
                <div>
                    <p className="font-semibold">
                        {item.returnNumber || item._id}
                    </p>

                    <p className="text-xs text-zinc-500">
                        {item.order?.orderNumber || item.orderId || "-"}
                    </p>
                </div>
            ),
        },
        {
            key: "reason",
            label: "Reason",
            render: (item) => (
                <span className="font-medium">
                    {item.reason || "-"}
                </span>
            ),
        },
        {
            key: "comments",
            label: "Comments",
            render: (item) => (
                <span className="line-clamp-2 max-w-sm text-zinc-500">
                    {item.comments || "-"}
                </span>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (item) => (
                <select
                    value={item.status || "REQUESTED"}
                    disabled={processing === item._id}
                    onChange={(e) =>
                        updateStatus(item, e.target.value)
                    }
                    className="rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs font-semibold outline-none focus:border-orange-400"
                >
                    {STATUSES.map((status) => (
                        <option key={status} value={status}>
                            {status.replaceAll("_", " ")}
                        </option>
                    ))}
                </select>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Returns"
                description="Review and manage customer return requests."
            />

            <DataTable
                columns={columns}
                data={returns}
                loading={loading}
                emptyTitle="No return requests"
            />

            {/* Refund Modal */}
            {refundModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="mb-4 text-lg font-bold text-zinc-900">Process Refund</h3>
                        <p className="mb-4 text-sm text-zinc-500">
                            Please enter the final refund details for Return {refundModal.item?.returnNumber}.
                            The calculated refund amount is ₹{refundModal.item?.refundAmount}.
                        </p>

                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-semibold text-zinc-700">Refund Amount (₹)</label>
                            <input 
                                type="number" 
                                value={refundModal.amount}
                                onChange={(e) => setRefundModal({...refundModal, amount: e.target.value})}
                                className="w-full rounded-xl border border-zinc-200 px-4 py-2 outline-none focus:border-orange-400"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="mb-1 block text-sm font-semibold text-zinc-700">Payment/Transaction ID (Optional)</label>
                            <input 
                                type="text" 
                                value={refundModal.paymentId}
                                onChange={(e) => setRefundModal({...refundModal, paymentId: e.target.value})}
                                placeholder="e.g. txn_12345"
                                className="w-full rounded-xl border border-zinc-200 px-4 py-2 outline-none focus:border-orange-400"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setRefundModal({ open: false, item: null, amount: "", paymentId: "" })}
                                className="flex-1 rounded-xl border border-zinc-200 py-2.5 font-bold text-zinc-700 hover:bg-zinc-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={submitRefund}
                                disabled={processing === refundModal.item?._id}
                                className="flex-1 rounded-xl bg-orange-500 py-2.5 font-bold text-white hover:bg-orange-600 disabled:opacity-50"
                            >
                                {processing === refundModal.item?._id ? "Processing..." : "Confirm Refund"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}