export default function EmptyState({
  title = "No data found",
  description = "There is nothing to display here yet.",
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
      <h3 className="font-semibold text-zinc-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-zinc-500">{description}</p>
    </div>
  );
}