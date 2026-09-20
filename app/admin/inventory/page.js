"use client";

import { useEffect, useState } from "react";
import { Plus, Minus, RefreshCw } from "lucide-react";

import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";

import { inventoryService } from "@/lib/services";

export default function InventoryPage() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [quantity, setQuantity] = useState("");
    const [reason, setReason] = useState("");
    const [action, setAction] = useState(null);
    const [processing, setProcessing] = useState(false);

    const loadInventory = async () => {
        setLoading(true);

        try {
            const response = await inventoryService.getAll();

            setInventory(
                Array.isArray(response?.data) ? response.data : []
            );
        } catch (error) {
            console.error(error);
            setInventory([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInventory();
    }, []);

    const handleStock = async () => {
        if (!selected || !quantity || Number(quantity) <= 0) return;

        setProcessing(true);

        try {
            if (action === "add") {
                await inventoryService.addStock(
                    selected.product?._id || selected.productId,
                    Number(quantity),
                    reason
                );
            } else {
                await inventoryService.removeStock(
                    selected.product?._id || selected.productId,
                    Number(quantity),
                    reason
                );
            }

            setSelected(null);
            setQuantity("");
            setReason("");
            setAction(null);

            await loadInventory();
        } catch (error) {
            alert(error?.message || "Inventory update failed.");
        } finally {
            setProcessing(false);
        }
    };

    const columns = [
        {
            key: "product",
            label: "Product",
            render: (item) => (
                <div>
                    <p className="font-semibold text-zinc-900">
                        {item.product?.name || item.productName || "-"}
                    </p>

                    <p className="text-xs text-zinc-500">
                        {item.product?.sku || item.sku || "-"}
                    </p>
                </div>
            ),
        },
        {
            key: "stock",
            label: "Stock",
            render: (item) => {
                const stock = Number(item.stock || 0);
                const threshold = Number(item.lowStockThreshold || 0);

                return (
                    <div>
                        <p className="font-bold text-zinc-900">{stock}</p>

                        {stock <= threshold && (
                            <StatusBadge status="PENDING" />
                        )}
                    </div>
                );
            },
        },
        {
            key: "reservedStock",
            label: "Reserved",
            render: (item) => item.reservedStock || 0,
        },
        {
            key: "availableStock",
            label: "Available",
            render: (item) =>
                Number(item.stock || 0) -
                Number(item.reservedStock || 0),
        },
        {
            key: "allowBackorder",
            label: "Backorder",
            render: (item) => (
                <StatusBadge
                    status={item.allowBackorder ? "ACTIVE" : "INACTIVE"}
                />
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (item) => (
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setSelected(item);
                            setAction("add");
                        }}
                        className="rounded-lg bg-orange-100 p-2 text-orange-700 hover:bg-orange-200"
                    >
                        <Plus size={15} />
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setSelected(item);
                            setAction("remove");
                        }}
                        className="rounded-lg bg-red-100 p-2 text-red-700 hover:bg-red-200"
                    >
                        <Minus size={15} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Inventory"
                description="Monitor and update product stock."
                action={
                    <button
                        type="button"
                        onClick={loadInventory}
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                }
            />

            <DataTable
                columns={columns}
                data={inventory}
                loading={loading}
                emptyTitle="No inventory records"
            />

            {selected && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <h2 className="text-xl font-bold">
                            {action === "add" ? "Add Stock" : "Remove Stock"}
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            {selected.product?.name || selected.productName}
                        </p>

                        <div className="mt-6 space-y-4">
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="Quantity"
                                className="h-11 w-full rounded-xl border border-zinc-200 px-4 outline-none focus:border-orange-400"
                            />

                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Reason"
                                rows={4}
                                className="w-full resize-none rounded-xl border border-zinc-200 p-4 outline-none focus:border-orange-400"
                            />
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelected(null);
                                    setAction(null);
                                }}
                                className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={processing}
                                onClick={handleStock}
                                className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                            >
                                {processing ? "Updating..." : "Update Stock"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}