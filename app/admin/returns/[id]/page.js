'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { returnService } from '@/services/api-service';
import PageHeader from '@/components/admin/PageHeader';
import LoadingState from '@/components/admin/LoadingState';
import StatusBadge from '@/components/admin/StatusBadge';

const STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'PROCESSING',
  'COMPLETED',
];

export default function ReturnDetailsPage() {
  const params = useParams();

  const [returnData, setReturnData] = useState(null);
  const [status, setStatus] = useState('PENDING');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReturn();
  }, [params.id]);

  async function loadReturn() {
    try {
      setLoading(true);

      const response = await returnService.getById(params.id);

      const data =
        response?.data?.return ||
        response?.data?.data ||
        response?.data;

      setReturnData(data);
      setStatus(data?.status || 'PENDING');
      setComment(data?.adminComment || '');
    } catch (err) {
      setError(err?.message || 'Failed to load return');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus() {
    try {
      setSaving(true);
      setError('');

      await returnService.adminUpdateStatus(
        params.id,
        status,
        comment
      );

      await loadReturn();
    } catch (err) {
      setError(err?.message || 'Failed to update return');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  if (!returnData) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-400">
        Return request not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Return ${returnData.returnNumber || ''}`}
        description="Manage customer return request"
        backHref="/admin/returns"
      />

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="mb-5 flex flex-wrap justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">
                Return Details
              </h2>

              <StatusBadge status={returnData.status} />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Info
                label="Return Number"
                value={returnData.returnNumber}
              />

              <Info
                label="Order Number"
                value={
                  returnData.order?.orderNumber ||
                  returnData.orderNumber
                }
              />

              <Info
                label="Reason"
                value={returnData.reason}
              />

              <Info
                label="Created At"
                value={
                  returnData.createdAt
                    ? new Date(
                        returnData.createdAt
                      ).toLocaleString()
                    : '—'
                }
              />
            </div>

            <div className="mt-5">
              <p className="text-xs text-zinc-500">Comments</p>

              <p className="mt-2 whitespace-pre-wrap rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-300">
                {returnData.comments || 'No comments'}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-5 text-lg font-semibold text-white">
              Returned Items
            </h2>

            <div className="space-y-3">
              {(returnData.items || []).map((item, index) => (
                <div
                  key={item._id || item.id || index}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
                >
                  <p className="font-medium text-white">
                    {item.product?.name ||
                      item.productName ||
                      'Product'}
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    Quantity: {item.quantity || 0}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="h-fit rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-5 text-lg font-semibold text-white">
            Update Return
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

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            placeholder="Admin comment..."
            className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
          />

          <button
            onClick={updateStatus}
            disabled={saving}
            className="mt-3 w-full rounded-xl bg-lime-400 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-lime-300 disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Update Return'}
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