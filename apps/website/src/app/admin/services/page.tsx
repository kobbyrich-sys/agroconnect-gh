import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteService } from "@/components/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function ServicesPage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("order_index");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Services</h3>
        <Link
          href="/admin/services/new"
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-800"
        >
          New Service
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        {services && services.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Order</th>
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="px-6 py-3 font-medium">Slug</th>
                  <th className="px-6 py-3 font-medium">Published</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {services.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-400">{s.order_index}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{s.title}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{s.slug}</td>
                    <td className="px-6 py-4">
                      {s.published ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/services/${s.id}/edit`}
                          className="text-sm text-brand-700 hover:underline"
                        >
                          Edit
                        </Link>
                        <DeleteButton action={deleteService.bind(null, s.id)} label="Service" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-6 text-sm text-gray-400">No services yet.</p>
        )}
      </div>
    </div>
  );
}
