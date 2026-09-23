'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { categoryService } from '@/services/api-service';
import PageHeader from '@/components/admin/PageHeader';
import LoadingState from '@/components/admin/LoadingState';

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, [params.id]);

  async function load() {
    try {
      setLoading(true);

      const response = await categoryService.getById(params.id);

      const data =
        response?.data?.category ||
        response?.data?.data ||
        response?.data;

      setForm({
        name: data?.name || '',
        slug: data?.slug || '',
        description: data?.description || '',
        isActive: data?.isActive !== false,
      });
    } catch (err) {
      setError(err?.message || 'Failed to load category');
    } finally {
      setLoading(false);
    }
  }

  function update(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function submit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      await categoryService.update(params.id, form);

      router.push('/admin/categories');
      router.refresh();
    } catch (err) {
      setError(err?.message || 'Failed to update category');
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
        title="Edit Category"
        description="Update category information"
        backHref="/admin/categories"
      />

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <form className="max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6">
        <div className="space-y-5">
          <Field
            label="Category Name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
          />

          <Field
            label="Slug"
            value={form.slug}
            onChange={(e) => update('slug', e.target.value)}
            required
          />

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Description
            </label>

            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-lime-400"
            />
          </div>

          <label className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <span className="text-sm text-zinc-300">
              Active Category
            </span>

            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                update('isActive', e.target.checked)
              }
              className="h-5 w-5 accent-lime-400"
            />
          </label>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-zinc-800 px-5 py-3 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            Cancel
          </button>

          <button
            type="submit"
            onClick={submit}
            disabled={saving}
            className="rounded-xl bg-lime-400 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-lime-300 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-zinc-300">
        {label}
      </label>

      <input
        {...props}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-lime-400"
      />
    </div>
  );
}