"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    RefreshCw,
} from "lucide-react";

import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

import { productService } from "@/lib/services";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const loadProducts = async () => {
        setLoading(true);

        try {
            const response = await productService.getAll({
                page: 1,
                limit: 100,
                ...(search ? { search } : {}),
            });

            const data = response?.data;

            setProducts(
                Array.isArray(data) ? data : data?.products || []
            );
        } catch (error) {
            console.error(error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(loadProducts, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleDelete = async () => {
        if (!deleteId) return;

        setDeleting(true);

        try {
            await productService.delete(deleteId);
            setDeleteId(null);
            await loadProducts();
        } catch (error) {
            alert(error?.message || "Failed to delete product.");
        } finally {
            setDeleting(false);
        }
    };

    const columns = [
        {
            key: "product",
            label: "Product",
            render: (product) => (
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                        {product.images?.[0]?.url ? (
                            <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                                No image
                            </div>
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate font-semibold text-zinc-900">
                            {product.name}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                            SKU: {product.sku || "-"}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: "brand",
            label: "Brand",
        },
        {
            key: "price",
            label: "Price",
            render: (product) => (
                <div>
                    <p className="font-semibold">
                        ₹{Number(product.price || 0).toLocaleString("en-IN")}
                    </p>

                    {product.compareAtPrice && (
                        <p className="text-xs text-zinc-400 line-through">
                            ₹{Number(product.compareAtPrice).toLocaleString("en-IN")}
                        </p>
                    )}
                </div>
            ),
        },
        {
            key: "requiresPrescription",
            label: "Prescription",
            render: (product) => (
                <StatusBadge
                    status={
                        product.requiresPrescription ? "PENDING" : "ACTIVE"
                    }
                />
            ),
        },
        {
            key: "isActive",
            label: "Status",
            render: (product) => (
                <StatusBadge
                    status={product.isActive ? "ACTIVE" : "INACTIVE"}
                />
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (product) => (
                <div className="flex items-center gap-2">
                    <Link
                        href={`/admin/products/${product._id}`}
                        className="rounded-lg border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-100"
                    >
                        <Pencil size={15} />
                    </Link>

                    <button
                        type="button"
                        onClick={() => setDeleteId(product._id)}
                        className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Products"
                description="Manage products available in your FurNest store."
                action={
                    <Link
                        href="/admin/products/new"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-400 px-4 py-2.5 text-sm font-bold text-zinc-950 hover:bg-orange-300"
                    >
                        <Plus size={17} />
                        Add Product
                    </Link>
                }
            />

            <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products, SKU, brand..."
                        className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    />
                </div>

                <button
                    type="button"
                    onClick={loadProducts}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            <DataTable
                columns={columns}
                data={products}
                loading={loading}
                emptyTitle="No products found"
            />

            <ConfirmDialog
                open={Boolean(deleteId)}
                title="Delete product?"
                description="This action will permanently delete the selected product."
                confirmText="Delete"
                loading={deleting}
                onCancel={() => setDeleteId(null)}
                onConfirm={handleDelete}
            />
        </div>
    );
}