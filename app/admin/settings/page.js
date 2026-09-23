'use client';

import { useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';

export default function AdminSettingsPage() {
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage admin panel preferences"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="text-lg font-semibold text-white">
            Appearance
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Customize your admin panel experience.
          </p>

          <div className="mt-5">
            <label className="mb-2 block text-sm text-zinc-300">
              Theme
            </label>

            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-lime-400"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="text-lg font-semibold text-white">
            Notifications
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Configure admin notifications.
          </p>

          <label className="mt-5 flex cursor-pointer items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div>
              <p className="text-sm font-medium text-white">
                Admin notifications
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Receive important order and system updates.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setNotifications(!notifications)}
              className={`relative h-6 w-11 rounded-full ${
                notifications
                  ? 'bg-lime-400'
                  : 'bg-zinc-700'
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  notifications ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </label>
        </section>
      </div>
    </div>
  );
}