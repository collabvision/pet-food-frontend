export default function DataTable({
  columns,
  data,
  loading = false,
  emptyTitle = "No records found",
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded-xl bg-zinc-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center">
        <p className="font-semibold text-zinc-900">{emptyTitle}</p>
        <p className="mt-1 text-sm text-zinc-500">
          No records are currently available.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100">
            {data.map((row, rowIndex) => (
              <tr
                key={row._id || row.id || rowIndex}
                className="hover:bg-zinc-50"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-5 py-4 text-sm text-zinc-700"
                  >
                    {column.render
                      ? column.render(row)
                      : row[column.key] ?? "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}