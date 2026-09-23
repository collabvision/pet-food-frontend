'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { prescriptionService } from '@/services/api-service';
import PageHeader from '@/components/admin/PageHeader';
import LoadingState from '@/components/admin/LoadingState';
import StatusBadge from '@/components/admin/StatusBadge';

export default function PrescriptionDetailsPage() {
  const params = useParams();

  const [prescription, setPrescription] = useState(null);
  const [status, setStatus] = useState('APPROVED');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPrescription();
  }, [params.id]);

  async function loadPrescription() {
    try {
      setLoading(true);

      const response = await prescriptionService.getById(
        params.id
      );

      const data =
        response?.data?.prescription ||
        response?.data?.data ||
        response?.data;

      setPrescription(data);

      if (data?.status) {
        setStatus(data.status);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load prescription');
    } finally {
      setLoading(false);
    }
  }

  async function review() {
    try {
      setSaving(true);
      setError('');

      await prescriptionService.adminReview(
        params.id,
        status,
        rejectionReason
      );

      await loadPrescription();
    } catch (err) {
      setError(err?.message || 'Failed to review prescription');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  if (!prescription) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-400">
        Prescription not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prescription Review"
        description="Review uploaded prescription"
        backHref="/admin/prescriptions"
      />

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
            <div className="border-b border-zinc-800 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">
                  Prescription Document
                </h2>

                <StatusBadge status={prescription.status} />
              </div>
            </div>

            {prescription.fileUrl ||
            prescription.imageUrl ||
            prescription.prescriptionUrl ? (
              <div className="flex min-h-[500px] items-center justify-center bg-zinc-900 p-4">
                <img
                  src={
                    prescription.fileUrl ||
                    prescription.imageUrl ||
                    prescription.prescriptionUrl
                  }
                  alt="Prescription"
                  className="max-h-[700px] max-w-full rounded-xl object-contain"
                />
              </div>
            ) : (
              <div className="flex min-h-[400px] items-center justify-center text-zinc-500">
                Prescription image unavailable.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-5 text-lg font-semibold text-white">
              Customer
            </h2>

            <Info
              label="Name"
              value={
                prescription.user?.name ||
                prescription.customer?.name
              }
            />

            <Info
              label="Email"
              value={
                prescription.user?.email ||
                prescription.customer?.email
              }
            />

            <Info
              label="Order"
              value={
                prescription.order?.orderNumber ||
                prescription.orderNumber
              }
            />
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-5 text-lg font-semibold text-white">
              Review
            </h2>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-lime-400"
            >
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="PENDING">PENDING</option>
            </select>

            {status === 'REJECTED' && (
              <textarea
                value={rejectionReason}
                onChange={(e) =>
                  setRejectionReason(e.target.value)
                }
                placeholder="Reason for rejection..."
                rows={5}
                className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
              />
            )}

            <button
              onClick={review}
              disabled={saving}
              className="mt-4 w-full rounded-xl bg-lime-400 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-lime-300 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Submit Review'}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="mb-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 break-words text-sm text-zinc-200">
        {value || '—'}
      </p>
    </div>
  );
}