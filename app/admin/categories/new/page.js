'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { categoryService } from '@/services/api-service';
import PageHeader from '@/components/admin/PageHeader';

export default function NewCategoryPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function generateSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function handleNameChange(value) {
    update('name', value);

    if (!form.slug) {
      update('slug', generateSlug(value));
    }
  }

  async function submit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      await categoryService.create(form);

      router.push('/admin/categories');
      router.refresh();
    } catch (err) {
      setError(err?.message || 'Failed to create category');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Category"
        description="Create a new product category"
        backHref="/admin/categories"
      />

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <form
        onSubmit={submit}
        className="max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6"
      >
        <div className="space-y-5">
          <Field
            label="Category Name"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
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
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
            />
          </div>

          <Toggle
            label="Active Category"
            checked={form.isActive}
            onChange={(value) => update('isActive', value)}
          />
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
            disabled={saving}
            className="rounded-xl bg-lime-400 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-lime-300 disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Category'}
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
        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <span className="text-sm text-zinc-300">{label}</span>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full ${
          checked ? 'bg-lime-400' : 'bg-zinc-700'
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}