'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { orderService } from '@/services/api-service';
import PageHeader from '@/components/admin/PageHeader';
import LoadingState from '@/components/admin/LoadingState';
import StatusBadge from '@/components/admin/StatusBadge';

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  async function loadOrder() {
    try {
      setLoading(true);

      const response = await orderService.getById(params.id);

      const data =
        response?.data?.order ||
        response?.data?.data ||
        response?.data;

      setOrder(data);
      setStatus(data?.orderStatus || data?.status || 'PENDING');
    } catch (err) {
      setError(err?.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus() {
    try {
      setSaving(true);
      setError('');

      await orderService.adminUpdateStatus(
        params.id,
        status,
        note
      );

      await loadOrder();
      setNote('');
    } catch (err) {
      setError(err?.message || 'Failed to update order');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  if (!order) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-400">
        Order not found.
      </div>
    );
  }

  const items = order.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order ${order.orderNumber || ''}`}
        description="View and manage order"
        backHref="/admin/orders"
      />

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">
                Order Items
              </h2>

              <StatusBadge
                status={order.orderStatus || order.status}
              />
            </div>

            <div className="space-y-4">
              {items.map((item, index) => {
                const product =
                  item.product ||
                  item.productId ||
                  {};

                return (
                  <div
                    key={item._id || item.id || index}
                    className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {product.name ||
                          item.productName ||
                          'Product'}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Quantity: {item.quantity || 0}
                      </p>
                    </div>

                    <p className="font-semibold text-lime-400">
                      ₹{item.total || item.price || 0}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-5 text-lg font-semibold text-white">
              Shipping Address
            </h2>

            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <Info
                label="Name"
                value={
                  order.shippingAddress?.name ||
                  order.shippingAddress?.fullName
                }
              />

              <Info
                label="Phone"
                value={order.shippingAddress?.phone}
              />

              <Info
                label="Address"
                value={order.shippingAddress?.address}
              />

              <Info
                label="City"
                value={order.shippingAddress?.city}
              />

              <Info
                label="State"
                value={order.shippingAddress?.state}
              />

              <Info
                label="Pincode"
                value={
                  order.shippingAddress?.pincode ||
                  order.shippingAddress?.postalCode
                }
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-5 text-lg font-semibold text-white">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <SummaryRow
                label="Subtotal"
                value={order.subtotal}
              />

              <SummaryRow
                label="Shipping"
                value={order.shippingCost}
              />

              <SummaryRow
                label="Discount"
                value={order.discount}
              />

              <div className="border-t border-zinc-800 pt-3">
                <SummaryRow
                  label="Total"
                  value={order.total}
                  strong
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-5 text-lg font-semibold text-white">
              Update Status
            </h2>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-lime-400"
            >
              {ORDER_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note..."
              rows={4}
              className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
            />

            <button
              onClick={updateStatus}
              disabled={saving}
              className="mt-3 w-full rounded-xl bg-lime-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-lime-300 disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Update Status'}
            </button>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Customer
            </h2>

            <Info
              label="Name"
              value={
                order.user?.name ||
                order.customer?.name ||
                '—'
              }
            />

            <Info
              label="Email"
              value={
                order.user?.email ||
                order.customer?.email ||
                '—'
              }
            />

            <Info
              label="Payment"
              value={order.paymentMethod || '—'}
            />
          </section>
        </div>
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

function SummaryRow({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={strong ? 'font-semibold text-white' : 'text-zinc-400'}>
        {label}
      </span>

      <span
        className={
          strong
            ? 'text-lg font-bold text-lime-400'
            : 'text-zinc-200'
        }
      >
        ₹{value || 0}
      </span>
    </div>
  );
}