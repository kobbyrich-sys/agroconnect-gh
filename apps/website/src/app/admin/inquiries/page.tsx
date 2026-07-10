import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/admin/status-badge";

export default async function InquiriesPage() {
  const supabase = await createClient();
  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h3 className="font-semibold">All Inquiries</h3>
        <span className="text-sm text-gray-400">
          {inquiries?.length ?? 0} total
        </span>
      </div>

      {inquiries && inquiries.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Message</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inquiries.map((inq) => (
                <tr
                  key={inq.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/inquiries/${inq.id}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {inq.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{inq.email}</td>
                  <td className="max-w-xs truncate px-6 py-4 text-gray-600">
                    {inq.message}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={inq.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(inq.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="p-6 text-sm text-gray-400">No inquiries yet.</p>
      )}
    </div>
  );
}
