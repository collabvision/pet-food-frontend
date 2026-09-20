import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PageHeader({
  title,
  description,
  action,
  backHref,
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="mt-1 rounded-lg border border-zinc-200 bg-white p-2 text-zinc-600 hover:bg-zinc-100"
          >
            <ArrowLeft size={17} />
          </Link>
        )}

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 md:text-3xl">
            {title}
          </h1>

          {description && (
            <p className="mt-1 text-sm text-zinc-500">
              {description}
            </p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
}