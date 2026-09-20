"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";

import { shippingService, orderService } from "@/lib/services";

const STATUSES = [
    "LABEL_CREATED",
    "PICKED_UP",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "FAILED_ATTEMPT",
    "RETURNED_TO_SENDER",
];

export default function ShippingPage() {
    const [shipments, setShipments] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        orderId: "",
        carrier: "",
        trackingNumber: "",
        estimatedDeliveryDate: "",
    });

    const loadData = async () => {
        setLoading(true);

        try {
            const [shipmentsResponse, ordersResponse] =
                await Promise.all([
                    shippingService.adminGetAll(),
                    orderService.adminGetAll(),
                ]);

            setShipments(
                Array.isArray(shipmentsResponse?.data)
                    ? shipmentsResponse.data
                    : []
            );

            const ordersData = ordersResponse?.data;

            setOrders(
                Array.isArray(ordersData)
                    ? ordersData
                    : ordersData?.orders || []
            );
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const createShipment = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await shippingService.adminCreate(
                form.orderId,
                form.carrier,
                form.trackingNumber,
                form.estimatedDeliveryDate
            );

            setFormOpen(false);

            setForm({
                orderId: "",
                carrier: "",
                trackingNumber: "",
                estimatedDeliveryDate: "",
            });

            await loadData();
        } catch (error) {
            alert(error?.message || "Failed to create shipment.");
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (shipment, status) => {
        try {
            await shippingService.adminUpdateStatus(
                shipment._id,
                status,
                "",
                `Shipment status changed to ${status}`
            );

            await loadData();
        } catch (error) {
            alert(error?.message || "Failed to update shipment.");
        }
    };

    const columns = [
        {
            key: "order",
            label: "Order",
            render: (item) => (
                <span className="font-semibold">
                    {item.order?.orderNumber ||
                        item.orderNumber ||
                        item.orderId ||
                        "-"}
                </span>
            ),
        },
        {
            key: "carrier",
            label: "Carrier",
            render: (item) => item.carrier || "-",
        },
        {
            key: "trackingNumber",
            label: "Tracking",
            render: (item) => (
                <span className="font-mono text-xs">
                    {item.trackingNumber || "-"}
                </span>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (item) => (
                <select
                    value={item.status || "LABEL_CREATED"}
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
        {
            key: "estimatedDeliveryDate",
            label: "ETA",
            render: (item) =>
                item.estimatedDeliveryDate
                    ? new Date(
                        item.estimatedDeliveryDate
                    ).toLocaleDateString("en-IN")
                    : "-",
        },
    ];

    return (
        <div>
            <PageHeader
                title="Shipping"
                description="Create and manage shipment tracking records."
                action={
                    <button
                        type="button"
                        onClick={() => setFormOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-orange-400 px-4 py-2.5 text-sm font-bold text-zinc-950"
                    >
                        <Plus size={17} />
                        Create Shipment
                    </button>
                }
            />

            <DataTable
                columns={columns}
                data={shipments}
                loading={loading}
                emptyTitle="No shipments found"
            />

            {formOpen && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
                    <form
                        onSubmit={createShipment}
                        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
                    >
                        <h2 className="text-xl font-bold">
                            Create Shipment
                        </h2>

                        <div className="mt-6 space-y-4">
                            <select
                                required
                                value={form.orderId}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        orderId: e.target.value,
                                    }))
                                }
                                className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-orange-400"
                            >
                                <option value="">Select order</option>

                                {orders.map((order) => (
                                    <option key={order._id} value={order._id}>
                                        {order.orderNumber || order._id}
                                    </option>
                                ))}
                            </select>

                            <input
                                required
                                value={form.carrier}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        carrier: e.target.value,
                                    }))
                                }
                                placeholder="Carrier e.g. BlueDart"
                                className="h-11 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none focus:border-orange-400"
                            />

                            <input
                                required
                                value={form.trackingNumber}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        trackingNumber: e.target.value,
                                    }))
                                }
                                placeholder="Tracking number"
                                className="h-11 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none focus:border-orange-400"
                            />

                            <input
                                required
                                type="datetime-local"
                                value={form.estimatedDeliveryDate}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        estimatedDeliveryDate: e.target.value,
                                    }))
                                }
                                className="h-11 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none focus:border-orange-400"
                            />
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setFormOpen(false)}
                                className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-xl bg-orange-400 px-4 py-2.5 text-sm font-bold text-zinc-950 disabled:opacity-50"
                            >
                                {saving ? "Creating..." : "Create Shipment"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}