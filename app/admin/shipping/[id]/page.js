'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { shippingService } from '@/services/api-service';
import PageHeader from '@/components/admin/PageHeader';
import LoadingState from '@/components/admin/LoadingState';
import StatusBadge from '@/components/admin/StatusBadge';

const STATUSES = [
  'PENDING',
  'PICKED_UP',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'FAILED',
  'RETURNED',
];

export default function ShippingDetailsPage() {
  const params = useParams();

  const [shipment, setShipment] = useState(null);
  const [status, setStatus] = useState('PENDING');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadShipment();
  }, [params.id]);

  async function loadShipment() {
    try {
      setLoading(true);

      const response = await shippingService.getById(params.id);

      const data =
        response?.data?.shipment ||
        response?.data?.data ||
        response?.data;

      setShipment(data);
      setStatus(data?.status || 'PENDING');
    } catch (err) {
      setError(err?.message || 'Failed to load shipment');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus() {
    try {
      setSaving(true);
      setError('');

      await shippingService.adminUpdateStatus(
        params.id,
        status,
        location,
        note
      );

      await loadShipment();

      setNote('');
      setLocation('');
    } catch (err) {
      setError(err?.message || 'Failed to update shipment');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  if (!shipment) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-400">
        Shipment not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipment"
        description="Manage shipment and tracking"
        backHref="/admin/shipping"
      />

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">
                Shipment Information
              </h2>

              <StatusBadge status={shipment.status} />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Info
                label="Tracking Number"
                value={shipment.trackingNumber}
              />

              <Info
                label="Carrier"
                value={shipment.carrier}
              />

              <Info
                label="Order"
                value={
                  shipment.order?.orderNumber ||
                  shipment.orderNumber
                }
              />

              <Info
                label="Estimated Delivery"
                value={
                  shipment.estimatedDeliveryDate
                    ? new Date(
                        shipment.estimatedDeliveryDate
                      ).toLocaleDateString()
                    : '—'
                }
              />
            </div>
          </section>
        </div>

        <section className="h-fit rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-5 text-lg font-semibold text-white">
            Update Tracking
          </h2>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-lime-400"
          >
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Current location"
            className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
          />

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tracking note"
            rows={4}
            className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
          />

          <button
            onClick={updateStatus}
            disabled={saving}
            className="mt-3 w-full rounded-xl bg-lime-400 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-lime-300 disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Update Shipment'}
          </button>
        </section>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 break-words text-sm text-zinc-200">
        {value || '—'}
      </p>
    </div>
  );
}