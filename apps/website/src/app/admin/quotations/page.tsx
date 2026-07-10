import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/admin/status-badge";

export default async function QuotationsPage() {
  const supabase = await createClient();
  const { data: quotations } = await supabase
    .from("quotations")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h3 className="font-semibold">All Quotations</h3>
        <span className="text-sm text-gray-400">
          {quotations?.length ?? 0} total
        </span>
      </div>

      {quotations && quotations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Service</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {quotations.map((q) => (
                <tr
                  key={q.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/quotations/${q.id}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {q.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {q.service_interest}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{q.phone}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={q.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(q.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="p-6 text-sm text-gray-400">No quotations yet.</p>
      )}
    </div>
  );
}
