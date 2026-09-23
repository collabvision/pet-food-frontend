'use client';

import { useEffect, useState } from 'react';
import { notificationService } from '@/services/api-service';
import PageHeader from '@/components/admin/PageHeader';
import LoadingState from '@/components/admin/LoadingState';
import EmptyState from '@/components/admin/EmptyState';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    orderId: '',
    status: '',
    message: '',
  });

  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);

      const response =
        await notificationService.adminGetAll();

      const data =
        response?.data?.notifications ||
        response?.data?.data ||
        response?.data ||
        [];

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }

  async function sendNotification(e) {
    e.preventDefault();

    try {
      setSending(true);
      setError('');

      await notificationService.adminSendOrderStatus(form);

      setForm({
        orderId: '',
        status: '',
        message: '',
      });

      await loadNotifications();
    } catch (err) {
      setError(err?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Manage order notifications"
      />

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <form
          onSubmit={sendNotification}
          className="h-fit rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
        >
          <h2 className="mb-5 text-lg font-semibold text-white">
            Send Order Notification
          </h2>

          <Input
            label="Order ID"
            value={form.orderId}
            onChange={(e) =>
              setForm({
                ...form,
                orderId: e.target.value,
              })
            }
            required
          />

          <Input
            label="Status"
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value,
              })
            }
            required
          />

          <label className="mt-4 block text-sm text-zinc-300">
            Message
          </label>

          <textarea
            value={form.message}
            onChange={(e) =>
              setForm({
                ...form,
                message: e.target.value,
              })
            }
            rows={5}
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
            placeholder="Notification message"
          />

          <button
            type="submit"
            disabled={sending}
            className="mt-4 w-full rounded-xl bg-lime-400 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-lime-300 disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send Notification'}
          </button>
        </form>

        <div className="xl:col-span-2">
          {notifications.length === 0 ? (
            <EmptyState message="No notifications found." />
          ) : (
            <div className="space-y-3">
              {notifications.map((item, index) => (
                <div
                  key={item._id || item.id || index}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-white">
                        {item.title ||
                          item.type ||
                          'Order Notification'}
                      </p>

                      <p className="mt-1 text-sm text-zinc-400">
                        {item.message || item.body || '—'}
                      </p>
                    </div>

                    <span className="text-xs text-zinc-600">
                      {item.createdAt
                        ? new Date(
                            item.createdAt
                          ).toLocaleString()
                        : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="mt-4">
      <label className="block text-sm text-zinc-300">
        {label}
      </label>

      <input
        {...props}
        className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
      />
    </div>
  );
}