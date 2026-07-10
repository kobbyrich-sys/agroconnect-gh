import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/admin/status-badge";
import { updateQuotationStatus } from "@/components/admin/actions";

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: q } = await supabase
    .from("quotations")
    .select("*")
    .eq("id", id)
    .single();

  if (!q) notFound();

  const statuses = ["pending", "reviewed", "approved", "rejected"];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/admin/quotations"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; Back to Quotations
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{q.name}</h3>
            <StatusBadge status={q.status} />
          </div>
          <p className="text-sm text-gray-500">{q.email}</p>
        </div>

        <div className="space-y-4 px-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Phone
              </span>
              <p className="mt-0.5 text-gray-700">{q.phone}</p>
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Company
              </span>
              <p className="mt-0.5 text-gray-700">{q.company ?? "—"}</p>
            </div>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Service Interest
            </span>
            <p className="mt-0.5 text-gray-700">{q.service_interest}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Project Details
            </span>
            <p className="mt-0.5 whitespace-pre-wrap text-gray-700">
              {q.project_details}
            </p>
          </div>
          {q.preferred_date && (
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Preferred Date
              </span>
              <p className="mt-0.5 text-gray-700">{q.preferred_date}</p>
            </div>
          )}
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Received
            </span>
            <p className="mt-0.5 text-gray-700">
              {new Date(q.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
            Update Status
          </p>
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <form key={s} action={updateQuotationStatus.bind(null, id, s)}>
                <button
                  type="submit"
                  disabled={s === q.status}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                    s === q.status
                      ? "bg-brand-700 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s}
                </button>
              </form>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
