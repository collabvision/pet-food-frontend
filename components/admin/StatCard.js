export default function StatCard({
    title,
    value,
    description,
    icon: Icon,
    loading = false,
}) {
    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-zinc-500">{title}</p>

                    {loading ? (
                        <div className="mt-2 h-8 w-24 animate-pulse rounded-lg bg-zinc-200" />
                    ) : (
                        <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
                            {value}
                        </p>
                    )}

                    {description && (
                        <p className="mt-2 text-xs text-zinc-500">{description}</p>
                    )}
                </div>

                {Icon && (
                    <div className="rounded-xl bg-orange-100 p-3 text-orange-700">
                        <Icon size={21} />
                    </div>
                )}
            </div>
        </div>
    );
}