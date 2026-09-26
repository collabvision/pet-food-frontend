'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { shippingService } from '@/services/api-service';
import PageHeader from '@/components/admin/PageHeader';

export default function NewShipmentPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    orderId: '',
    carrier: '',
    trackingNumber: '',
    estimatedDeliveryDate: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

      await shippingService.adminCreate(
        form.orderId,
        form.carrier,
        form.trackingNumber,
        form.estimatedDeliveryDate || undefined
      );

      router.push('/admin/shipping');
      router.refresh();
    } catch (err) {
      setError(err?.message || 'Failed to create shipment');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Shipment"
        description="Create a shipment for an order"
        backHref="/admin/shipping"
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
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field
            label="Order ID"
            value={form.orderId}
            onChange={(e) => update('orderId', e.target.value)}
            required
          />

          <Field
            label="Carrier"
            value={form.carrier}
            onChange={(e) => update('carrier', e.target.value)}
            placeholder="Delhivery"
            required
          />

          <Field
            label="Tracking Number"
            value={form.trackingNumber}
            onChange={(e) =>
              update('trackingNumber', e.target.value)
            }
            required
          />

          <Field
            label="Estimated Delivery"
            type="date"
            value={form.estimatedDeliveryDate}
            onChange={(e) =>
              update('estimatedDeliveryDate', e.target.value)
            }
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-8 w-full rounded-xl bg-lime-400 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-lime-300 disabled:opacity-50 sm:w-auto"
        >
          {saving ? 'Creating...' : 'Create Shipment'}
        </button>
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