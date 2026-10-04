"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Truck } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { shippingService } from "@/lib/services";

const SHIPMENT_STATUSES = [
    "PENDING",
    "READY_TO_SHIP",
    "SHIPPED",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
];

export default function ShippingPage() {
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const loadShipments = async () => {
        setLoading(true);
        try {
            const res = await shippingService.adminGetAll();
            const data = res?.data?.data || res?.data || [];
            setShipments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setShipments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadShipments();
    }, []);

    const updateStatus = async (shipmentId, status) => {
        setUpdatingId(shipmentId);
        try {
            await shippingService.adminUpdateStatus(shipmentId, status, "", `Status updated to ${status}`);
            await loadShipments();
        } catch (error) {
            alert(error?.message || "Failed to update shipment status.");
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredShipments = shipments.filter((shipment) => {
        const val = search.toLowerCase();
        return (
            (shipment.trackingNumber || "").toLowerCase().includes(val) ||
            (shipment.orderId?.orderNumber || "").toLowerCase().includes(val) ||
            (shipment.userId?.name || "").toLowerCase().includes(val)
        );
    });

    const columns = [
        {
            key: "order",
            label: "Order No.",
            render: (shipment) => shipment.orderId?.orderNumber || "-",
        },
        {
            key: "customer",
            label: "Customer",
            render: (shipment) => (
                <div>
                    <p className="font-semibold text-zinc-900">{shipment.userId?.name || "Unknown"}</p>
                    <p className="text-xs text-zinc-500">{shipment.userId?.email || "-"}</p>
                </div>
            ),
        },
        {
            key: "tracking",
            label: "Tracking Info",
            render: (shipment) => (
                <div>
                    <p className="font-semibold">{shipment.trackingNumber || "N/A"}</p>
                    <p className="text-xs text-zinc-500">{shipment.provider || "Manual"} - {shipment.courierName || ""}</p>
                </div>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (shipment) => {
                let badgeStatus = "PENDING";
                if (["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "READY_TO_SHIP"].includes(shipment.status)) badgeStatus = "ACTIVE";
                if (shipment.status === "DELIVERED") badgeStatus = "ACTIVE";
                if (["CANCELLED", "RETURNED"].includes(shipment.status)) badgeStatus = "INACTIVE";
                return <StatusBadge status={badgeStatus} label={shipment.status} />;
            },
        },
        {
            key: "actions",
            label: "Update Status",
            render: (shipment) => (
                <div className="flex items-center gap-2">
                    <select
                        value={shipment.status}
                        onChange={(e) => updateStatus(shipment._id, e.target.value)}
                        disabled={updatingId === shipment._id}
                        className="rounded-lg border border-zinc-200 bg-white p-2 text-sm outline-none disabled:opacity-50"
                    >
                        {SHIPMENT_STATUSES.map((status) => (
                            <option key={status} value={status}>
                                {status.replace(/_/g, " ")}
                            </option>
                        ))}
                    </select>
                </div>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Shipments"
                description="Manage shipments and tracking statuses."
                action={
                    <button
                        type="button"
                        onClick={loadShipments}
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
                    placeholder="Search order no, customer, or tracking no..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-11 w-full max-w-md rounded-xl border border-zinc-200 px-4 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all"
                />
            </div>

            <DataTable
                columns={columns}
                data={filteredShipments}
                loading={loading}
                emptyTitle="No shipments found"
            />
        </div>
    );
}