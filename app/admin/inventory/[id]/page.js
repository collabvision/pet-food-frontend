'use client';

import { useEffect, useState } from 'react';
import { inventoryService } from '@/services/api-service';
import PageHeader from '@/components/admin/PageHeader';
import LoadingState from '@/components/admin/LoadingState';
import EmptyState from '@/components/admin/EmptyState';

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [action, setAction] = useState({
    productId: '',
    type: 'add',
    quantity: '',
    reason: '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  async function loadInventory() {
    try {
      setLoading(true);

      const response = await inventoryService.getAll();

      const data =
        response?.data?.inventory ||
        response?.data?.data ||
        response?.data ||
        [];

      setInventory(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      const quantity = Number(action.quantity);

      if (action.type === 'add') {
        await inventoryService.addStock(
          action.productId,
          quantity,
          action.reason
        );
      } else {
        await inventoryService.removeStock(
          action.productId,
          quantity,
          action.reason
        );
      }

      setAction({
        productId: '',
        type: 'add',
        quantity: '',
        reason: '',
      });

      await loadInventory();
    } catch (err) {
      setError(err?.message || 'Inventory update failed');
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
        title="Inventory"
        description="Manage product stock"
      />

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form
        onSubmit={handleAction}
        className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
      >
        <h2 className="mb-5 text-lg font-semibold text-white">
          Stock Adjustment
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            placeholder="Product ID"
            value={action.productId}
            onChange={(e) =>
              setAction({
                ...action,
                productId: e.target.value,
              })
            }
            required
          />

          <select
            value={action.type}
            onChange={(e) =>
              setAction({
                ...action,
                type: e.target.value,
              })
            }
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-lime-400"
          >
            <option value="add">Add Stock</option>
            <option value="remove">Remove Stock</option>
          </select>

          <Input
            type="number"
            min="1"
            placeholder="Quantity"
            value={action.quantity}
            onChange={(e) =>
              setAction({
                ...action,
                quantity: e.target.value,
              })
            }
            required
          />

          <Input
            placeholder="Reason"
            value={action.reason}
            onChange={(e) =>
              setAction({
                ...action,
                reason: e.target.value,
              })
            }
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-4 rounded-xl bg-lime-400 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-lime-300 disabled:opacity-50"
        >
          {saving ? 'Updating...' : 'Update Stock'}
        </button>
      </form>

      {inventory.length === 0 ? (
        <EmptyState message="No inventory records found." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="border-b border-zinc-800 bg-zinc-900">
                <tr>
                  <th className="px-5 py-4 text-xs font-medium text-zinc-500">
                    Product
                  </th>
                  <th className="px-5 py-4 text-xs font-medium text-zinc-500">
                    Stock
                  </th>
                  <th className="px-5 py-4 text-xs font-medium text-zinc-500">
                    Reserved
                  </th>
                  <th className="px-5 py-4 text-xs font-medium text-zinc-500">
                    Available
                  </th>
                  <th className="px-5 py-4 text-xs font-medium text-zinc-500">
                    Threshold
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800">
                {inventory.map((item, index) => {
                  const stock = item.stock || 0;
                  const reserved = item.reserved || 0;

                  return (
                    <tr
                      key={item._id || item.id || index}
                      className="hover:bg-zinc-900/50"
                    >
                      <td className="px-5 py-4 text-sm text-white">
                        {item.product?.name ||
                          item.productName ||
                          item.productId ||
                          '—'}
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-300">
                        {stock}
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-300">
                        {reserved}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-lime-400">
                        {item.available ?? stock - reserved}
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-300">
                        {item.lowStockThreshold || 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
    />
  );
}