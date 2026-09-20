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
    "ITEM_RECEIVED",
    "REFUNDED",
];

export default function ReturnsPage() {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);

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

    const updateStatus = async (item, status) => {
        setProcessing(item._id);

        try {
            await returnService.adminUpdateStatus(
                item._id,
                status,
                `Return status changed to ${status}`
            );

            await loadReturns();
        } catch (error) {
            alert(error?.message || "Failed to update return.");
        } finally {
            setProcessing(null);
        }
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
        </div>
    );
}