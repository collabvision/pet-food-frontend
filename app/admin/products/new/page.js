"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import PageHeader from "@/components/admin/PageHeader";
import { categoryService, productService } from "@/lib/services";

export default function NewProductPage() {
    const router = useRouter();

    const [categories, setCategories] = useState([]);
    const [saving, setSaving] = useState(false);
    const [images, setImages] = useState([]);

    const [form, setForm] = useState({
        name: "",
        slug: "",
        description: "",
        category: "",
        price: "",
        compareAtPrice: "",
        sku: "",
        barcode: "",
        brand: "",
        unit: "",
        isMedical: false,
        requiresPrescription: false,
    });

    useEffect(() => {
        categoryService
            .getAll()
            .then((response) => {
                setCategories(
                    Array.isArray(response?.data)
                        ? response.data
                        : []
                );
            })
            .catch(console.error);
    }, []);

    const update = (key, value) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const submit = async (e) => {
        e.preventDefault();

        setSaving(true);

        try {
            if (images.length > 0) {
                const formData = new FormData();

                Object.entries(form).forEach(([key, value]) => {
                    formData.append(key, value);
                });

                images.forEach((file) => {
                    formData.append("images", file);
                });

                await productService.createWithFiles(formData);
            } else {
                await productService.create({
                    ...form,
                    price: Number(form.price),
                    compareAtPrice: form.compareAtPrice
                        ? Number(form.compareAtPrice)
                        : undefined,
                });
            }

            router.push("/admin/products");
        } catch (error) {
            alert(error?.message || "Failed to create product.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="Add Product"
                description="Create a new product."
                backHref="/admin/products"
            />

            <form
                onSubmit={submit}
                className="mx-auto max-w-5xl space-y-6"
            >
                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-2xl border border-zinc-200 bg-white p-5">
                        <h2 className="font-bold">Basic Information</h2>

                        <div className="mt-5 space-y-4">
                            <input
                                required
                                value={form.name}
                                onChange={(e) => update("name", e.target.value)}
                                placeholder="Product name"
                                className="input"
                            />

                            <input
                                required
                                value={form.slug}
                                onChange={(e) => update("slug", e.target.value)}
                                placeholder="product-slug"
                                className="input"
                            />

                            <textarea
                                required
                                value={form.description}
                                onChange={(e) =>
                                    update("description", e.target.value)
                                }
                                placeholder="Product description"
                                rows={6}
                                className="w-full resize-none rounded-xl border border-zinc-200 p-4 text-sm outline-none focus:border-orange-400"
                            />

                            <select
                                required
                                value={form.category}
                                onChange={(e) =>
                                    update("category", e.target.value)
                                }
                                className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-orange-400"
                            >
                                <option value="">Select category</option>

                                {categories.map((category) => (
                                    <option
                                        key={category._id}
                                        value={category._id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-zinc-200 bg-white p-5">
                        <h2 className="font-bold">Pricing & Stock Information</h2>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <input
                                required
                                type="number"
                                min="0"
                                value={form.price}
                                onChange={(e) =>
                                    update("price", e.target.value)
                                }
                                placeholder="Price"
                                className="input"
                            />

                            <input
                                type="number"
                                min="0"
                                value={form.compareAtPrice}
                                onChange={(e) =>
                                    update("compareAtPrice", e.target.value)
                                }
                                placeholder="Compare at price"
                                className="input"
                            />

                            <input
                                required
                                value={form.sku}
                                onChange={(e) => update("sku", e.target.value)}
                                placeholder="SKU"
                                className="input"
                            />

                            <input
                                value={form.barcode}
                                onChange={(e) =>
                                    update("barcode", e.target.value)
                                }
                                placeholder="Barcode"
                                className="input"
                            />

                            <input
                                value={form.brand}
                                onChange={(e) => update("brand", e.target.value)}
                                placeholder="Brand"
                                className="input"
                            />

                            <input
                                value={form.unit}
                                onChange={(e) => update("unit", e.target.value)}
                                placeholder="Unit e.g. 5kg"
                                className="input"
                            />
                        </div>
                    </section>
                </div>

                <section className="rounded-2xl border border-zinc-200 bg-white p-5">
                    <h2 className="font-bold">Product Images</h2>

                    <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp"
                        multiple
                        onChange={(e) =>
                            setImages(Array.from(e.target.files || []).slice(0, 5))
                        }
                        className="mt-4 block w-full rounded-xl border border-zinc-200 p-3 text-sm"
                    />

                    {images.length > 0 && (
                        <div className="mt-3 text-sm text-zinc-500">
                            {images.length} image(s) selected.
                        </div>
                    )}
                </section>

                <section className="rounded-2xl border border-zinc-200 bg-white p-5">
                    <h2 className="font-bold">Product Type</h2>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <label className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 text-sm">
                            <input
                                type="checkbox"
                                checked={form.isMedical}
                                onChange={(e) =>
                                    update("isMedical", e.target.checked)
                                }
                                className="h-4 w-4 accent-orange-500"
                            />
                            Medical product
                        </label>

                        <label className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 text-sm">
                            <input
                                type="checkbox"
                                checked={form.requiresPrescription}
                                onChange={(e) =>
                                    update(
                                        "requiresPrescription",
                                        e.target.checked
                                    )
                                }
                                className="h-4 w-4 accent-orange-500"
                            />
                            Requires prescription
                        </label>
                    </div>
                </section>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-xl bg-orange-400 px-5 py-3 text-sm font-bold text-zinc-950 disabled:opacity-50"
                    >
                        {saving ? "Creating Product..." : "Create Product"}
                    </button>
                </div>
            </form>
        </div>
    );
}