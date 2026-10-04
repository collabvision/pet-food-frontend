"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { paymentService } from "@/lib/services";

export default function PaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const loadPayments = async () => {
        setLoading(true);
        try {
            const res = await paymentService.adminGetAll();
            const data = res?.data?.data?.payments || res?.data?.payments || [];
            setPayments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayments();
    }, []);

    const filteredPayments = payments.filter((payment) => {
        const val = search.toLowerCase();
        return (
            (payment.razorpayOrderId || "").toLowerCase().includes(val) ||
            (payment.razorpayPaymentId || "").toLowerCase().includes(val) ||
            (payment.orderId?.orderNumber || "").toLowerCase().includes(val) ||
            (payment.userId?.name || "").toLowerCase().includes(val)
        );
    });

    const columns = [
        {
            key: "order",
            label: "Order No.",
            render: (payment) => payment.orderId?.orderNumber || "-",
        },
        {
            key: "customer",
            label: "Customer",
            render: (payment) => (
                <div>
                    <p className="font-semibold text-zinc-900">{payment.userId?.name || "Unknown"}</p>
                    <p className="text-xs text-zinc-500">{payment.userId?.email || "-"}</p>
                </div>
            ),
        },
        {
            key: "amount",
            label: "Amount",
            render: (payment) => `₹${(payment.amount / 100).toFixed(2)}`,
        },
        {
            key: "ids",
            label: "Razorpay IDs",
            render: (payment) => (
                <div className="text-xs text-zinc-500">
                    <p>Order: {payment.razorpayOrderId}</p>
                    {payment.razorpayPaymentId && <p>Pay: {payment.razorpayPaymentId}</p>}
                </div>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (payment) => {
                let badgeStatus = "PENDING";
                if (payment.status === "AUTHORIZED" || payment.status === "CAPTURED") badgeStatus = "ACTIVE";
                if (payment.status === "FAILED") badgeStatus = "INACTIVE";
                if (payment.status === "REFUNDED") badgeStatus = "INACTIVE";
                return <StatusBadge status={badgeStatus} label={payment.status} />;
            },
        },
        {
            key: "date",
            label: "Date",
            render: (payment) => new Date(payment.createdAt).toLocaleString(),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Payments"
                description="View Razorpay payment records."
                action={
                    <button
                        type="button"
                        onClick={loadPayments}
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-zinc-50 transition-colors"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                }
            />

            <div className="mb-6 flex items-center justify-between">
                <input
                    type="text"
                    placeholder="Search order no, customer, or Razorpay ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-11 w-full max-w-md rounded-xl border border-zinc-200 px-4 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all"
                />
            </div>

            <DataTable
                columns={columns}
                data={filteredPayments}
                loading={loading}
                emptyTitle="No payments found"
            />
        </div>
    );
}
