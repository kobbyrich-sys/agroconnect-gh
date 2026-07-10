import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateInvoiceStatus, deleteInvoice } from "@/components/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function AdminInvoicesPage() {
  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false });

  const statuses = ["draft", "sent", "paid", "overdue", "cancelled"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Invoices</h3>
        <Link href="/admin/invoices/new"
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-800">
          New Invoice
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        {invoices && invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Invoice</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Total</th>
                  <th className="px-6 py-3 font-medium">Due</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{inv.number}</td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{(inv.profiles as any)?.full_name ?? "Unknown"}</p>
                      <p className="text-xs text-gray-500">{(inv.profiles as any)?.email ?? ""}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      GHS {Number(inv.total).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(inv.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {statuses.map((s) => (
                          <form key={s} action={updateInvoiceStatus.bind(null, inv.id, s)}>
                            <button type="submit" disabled={s === inv.status}
                              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors disabled:opacity-100 ${
                                s === inv.status
                                  ? "bg-brand-700 text-white"
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              }`}>{s}</button>
                          </form>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/invoices/${inv.id}/edit`}
                          className="text-sm text-brand-700 hover:underline">Edit</Link>
                        <DeleteButton action={deleteInvoice.bind(null, inv.id)} label="Invoice" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-6 text-sm text-gray-400">No invoices yet.</p>
        )}
      </div>
    </div>
  );
}
