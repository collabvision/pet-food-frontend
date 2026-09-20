"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { categoryService } from "@/lib/services";

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: "",
        slug: "",
        description: "",
        isActive: true,
    });

    const loadCategories = async () => {
        setLoading(true);

        try {
            const response = await categoryService.getAll();
            setCategories(Array.isArray(response?.data) ? response.data : []);
        } catch (error) {
            console.error(error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({
            name: "",
            slug: "",
            description: "",
            isActive: true,
        });
        setFormOpen(true);
    };

    const openEdit = (category) => {
        setEditing(category);

        setForm({
            name: category.name || "",
            slug: category.slug || "",
            description: category.description || "",
            isActive: category.isActive ?? true,
        });

        setFormOpen(true);
    };

    const saveCategory = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editing) {
                await categoryService.update(editing._id, form);
            } else {
                await categoryService.create(form);
            }

            setFormOpen(false);
            await loadCategories();
        } catch (error) {
            alert(error?.message || "Failed to save category.");
        } finally {
            setSaving(false);
        }
    };

    const deleteCategory = async () => {
        if (!deleteId) return;

        try {
            await categoryService.delete(deleteId);
            setDeleteId(null);
            await loadCategories();
        } catch (error) {
            alert(error?.message || "Failed to delete category.");
        }
    };

    const columns = [
        {
            key: "name",
            label: "Category",
            render: (category) => (
                <div>
                    <p className="font-semibold text-zinc-900">
                        {category.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                        /{category.slug}
                    </p>
                </div>
            ),
        },
        {
            key: "description",
            label: "Description",
            render: (category) => (
                <span className="line-clamp-2 max-w-md text-zinc-500">
                    {category.description || "-"}
                </span>
            ),
        },
        {
            key: "isActive",
            label: "Status",
            render: (category) => (
                <StatusBadge
                    status={category.isActive ? "ACTIVE" : "INACTIVE"}
                />
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (category) => (
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => openEdit(category)}
                        className="rounded-lg border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-100"
                    >
                        <Pencil size={15} />
                    </button>

                    <button
                        type="button"
                        onClick={() => setDeleteId(category._id)}
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
                title="Categories"
                description="Create and manage product categories."
                action={
                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 rounded-xl bg-orange-400 px-4 py-2.5 text-sm font-bold text-zinc-950 hover:bg-orange-300"
                    >
                        <Plus size={17} />
                        Add Category
                    </button>
                }
            />

            <DataTable
                columns={columns}
                data={categories}
                loading={loading}
            />

            {formOpen && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
                    <form
                        onSubmit={saveCategory}
                        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
                    >
                        <h2 className="text-xl font-bold text-zinc-950">
                            {editing ? "Edit Category" : "Create Category"}
                        </h2>

                        <div className="mt-6 space-y-4">
                            <input
                                required
                                value={form.name}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                placeholder="Category name"
                                className="h-11 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none focus:border-orange-400"
                            />

                            <input
                                required={!editing}
                                value={form.slug}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        slug: e.target.value,
                                    }))
                                }
                                placeholder="category-slug"
                                className="h-11 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none focus:border-orange-400"
                            />

                            <textarea
                                value={form.description}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                placeholder="Description"
                                rows={4}
                                className="w-full resize-none rounded-xl border border-zinc-200 p-4 text-sm outline-none focus:border-orange-400"
                            />

                            <label className="flex items-center gap-3 text-sm font-medium">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            isActive: e.target.checked,
                                        }))
                                    }
                                    className="h-4 w-4 accent-orange-500"
                                />
                                Active category
                            </label>
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
                                {saving
                                    ? "Saving..."
                                    : editing
                                        ? "Update Category"
                                        : "Create Category"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <ConfirmDialog
                open={Boolean(deleteId)}
                title="Delete category?"
                description="The backend will prevent deletion when products are linked to this category."
                confirmText="Delete"
                onCancel={() => setDeleteId(null)}
                onConfirm={deleteCategory}
            />
        </div>
    );
}