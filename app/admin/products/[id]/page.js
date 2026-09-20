'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { productService, categoryService } from '@/lib/services';
import PageHeader from '@/components/admin/PageHeader';
import LoadingState from '@/components/admin/LoadingState';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);

    const [form, setForm] = useState({
        name: '',
        slug: '',
        category: '',
        description: '',
        price: '',
        compareAtPrice: '',
        sku: '',
        barcode: '',
        brand: '',
        unit: '',
        isMedical: false,
        requiresPrescription: false,
        isActive: true,
    });

    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, [params.id]);

    async function loadData() {
        try {
            setLoading(true);

            const [productResponse, categoryResponse] = await Promise.all([
                productService.getById(params.id),
                categoryService.getAll(),
            ]);

            const product =
                productResponse?.data?.product ||
                productResponse?.data?.data ||
                productResponse?.data;

            const categoryData =
                categoryResponse?.data?.categories ||
                categoryResponse?.data?.data ||
                categoryResponse?.data ||
                [];

            setCategories(Array.isArray(categoryData) ? categoryData : []);

            if (product) {
                setForm({
                    name: product.name || '',
                    slug: product.slug || '',
                    category:
                        product.category?._id ||
                        product.category?.id ||
                        product.category ||
                        '',
                    description: product.description || '',
                    price: product.price ?? '',
                    compareAtPrice: product.compareAtPrice ?? '',
                    sku: product.sku || '',
                    barcode: product.barcode || '',
                    brand: product.brand || '',
                    unit: product.unit || '',
                    isMedical: Boolean(product.isMedical),
                    requiresPrescription: Boolean(product.requiresPrescription),
                    isActive: product.isActive !== false,
                });
            }
        } catch (err) {
            setError(err?.message || 'Failed to load product');
        } finally {
            setLoading(false);
        }
    }

    function updateField(name, value) {
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setSaving(true);
            setError('');

            await productService.update(params.id, {
                ...form,
                price: Number(form.price),
                compareAtPrice: form.compareAtPrice
                    ? Number(form.compareAtPrice)
                    : undefined,
            });

            router.push('/admin/products');
            router.refresh();
        } catch (err) {
            setError(err?.message || 'Failed to update product');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <LoadingState />;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Edit Product"
                description="Update product information"
                backHref="/admin/products"
            />

            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6"
            >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input
                        label="Product Name"
                        value={form.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        required
                    />

                    <Input
                        label="Slug"
                        value={form.slug}
                        onChange={(e) => updateField('slug', e.target.value)}
                    />

                    <div>
                        <label className="mb-2 block text-sm text-zinc-300">
                            Category
                        </label>

                        <select
                            value={form.category}
                            onChange={(e) => updateField('category', e.target.value)}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-orange-400"
                        >
                            <option value="">Select category</option>

                            {categories.map((category) => (
                                <option
                                    key={category._id || category.id}
                                    value={category._id || category.id}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Brand"
                        value={form.brand}
                        onChange={(e) => updateField('brand', e.target.value)}
                    />

                    <Input
                        label="Price"
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={(e) => updateField('price', e.target.value)}
                        required
                    />

                    <Input
                        label="Compare At Price"
                        type="number"
                        min="0"
                        value={form.compareAtPrice}
                        onChange={(e) =>
                            updateField('compareAtPrice', e.target.value)
                        }
                    />

                    <Input
                        label="SKU"
                        value={form.sku}
                        onChange={(e) => updateField('sku', e.target.value)}
                    />

                    <Input
                        label="Barcode"
                        value={form.barcode}
                        onChange={(e) => updateField('barcode', e.target.value)}
                    />

                    <Input
                        label="Unit"
                        value={form.unit}
                        onChange={(e) => updateField('unit', e.target.value)}
                        placeholder="kg, piece, packet..."
                    />

                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm text-zinc-300">
                            Description
                        </label>

                        <textarea
                            rows={6}
                            value={form.description}
                            onChange={(e) =>
                                updateField('description', e.target.value)
                            }
                            className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-orange-400"
                        />
                    </div>

                    <Toggle
                        label="Active Product"
                        checked={form.isActive}
                        onChange={(value) => updateField('isActive', value)}
                    />

                    <Toggle
                        label="Medical Product"
                        checked={form.isMedical}
                        onChange={(value) => updateField('isMedical', value)}
                    />

                    <Toggle
                        label="Requires Prescription"
                        checked={form.requiresPrescription}
                        onChange={(value) =>
                            updateField('requiresPrescription', value)
                        }
                    />
                </div>

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded-xl border border-zinc-800 px-5 py-3 text-sm text-zinc-300 transition hover:bg-zinc-900"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-xl bg-orange-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function Input({
    label,
    type = 'text',
    value,
    onChange,
    required,
    placeholder,
}) {
    return (
        <div>
            <label className="mb-2 block text-sm text-zinc-300">
                {label}
            </label>

            <input
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-orange-400"
            />
        </div>
    );
}

function Toggle({ label, checked, onChange }) {
    return (
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <span className="text-sm text-zinc-300">{label}</span>

            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-orange-400' : 'bg-zinc-700'
                    }`}
            >
                <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? 'left-6' : 'left-1'
                        }`}
                />
            </button>
        </label>
    );
}