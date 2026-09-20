"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, Eye } from "lucide-react";
import Link from "next/link";

import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";

import { orderService } from "@/lib/services";

const ORDER_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
];

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const loadOrders = async () => {
        setLoading(true);

        try {
            const response = await orderService.adminGetAll();

            const data = response?.data;

            setOrders(
                Array.isArray(data)
                    ? data
                    : data?.orders || []
            );
        } catch (error) {
            console.error(error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const updateStatus = async (order, status) => {
        setUpdatingId(order._id);

        try {
            await orderService.adminUpdateStatus(
                order._id,
                status,
                `Order status changed to ${status}`
            );

            await loadOrders();
        } catch (error) {
            alert(error?.message || "Failed to update order.");
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredOrders = orders.filter((order) => {
        const value = search.toLowerCase();

        return (
            String(order.orderNumber || "")
                .toLowerCase()
                .includes(value) ||
            String(order.user?.name || "")
                .toLowerCase()
                .includes(value) ||
            String(order.user?.email || "")
                .toLowerCase()
                .includes(value)
        );
    });

    const columns = [
        {
            key: "orderNumber",
            label: "Order",
            render: (order) => (
                <div>
                    <p className="font-semibold text-zinc-900">
                        {order.orderNumber || order._id}
                    </p>

                    <p className="text-xs text-zinc-500">
                        {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString("en-IN")
                            : "-"}
                    </p>
                </div>
            ),
        },
        {
            key: "customer",
            label: "Customer",
            render: (order) => (
                <div>
                    <p className="font-medium">
                        {order.user?.name || "Customer"}
                    </p>
                    <p className="text-xs text-zinc-500">
                        {order.user?.email || "-"}
                    </p>
                </div>
            ),
        },
        {
            key: "totalAmount",
            label: "Amount",
            render: (order) => (
                <span className="font-semibold">
                    ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                </span>
            ),
        },
        {
            key: "paymentStatus",
            label: "Payment",
            render: (order) => (
                <StatusBadge status={order.paymentStatus} />
            ),
        },
        {
            key: "orderStatus",
            label: "Status",
            render: (order) => (
                <select
                    value={order.orderStatus || "PENDING"}
                    disabled={updatingId === order._id}
                    onChange={(e) =>
                        updateStatus(order, e.target.value)
                    }
                    className="rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs font-semibold outline-none focus:border-orange-400"
                >
                    {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                            {status.replaceAll("_", " ")}
                        </option>
                    ))}
                </select>
            ),
        },
        {
            key: "actions",
            label: "View",
            render: (order) => (
                <Link
                    href={`/admin/orders/${order._id}`}
                    className="inline-flex rounded-lg border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-100"
                >
                    <Eye size={16} />
                </Link>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Orders"
                description="Manage customer orders and order status."
                action={
                    <button
                        type="button"
                        onClick={loadOrders}
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                }
            />

            <div className="mb-5 relative">
                <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />

                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search order number or customer..."
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-orange-400"
                />
            </div>

            <DataTable
                columns={columns}
                data={filteredOrders}
                loading={loading}
                emptyTitle="No orders found"
            />
        </div>
    );
}