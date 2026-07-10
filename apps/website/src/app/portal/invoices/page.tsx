"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Invoice } from "@/types/database";

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("invoices")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setInvoices(data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>

      <div className="rounded-xl border border-gray-200 bg-white">
        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Invoice</th>
                  <th className="px-6 py-3 font-medium">Issued</th>
                  <th className="px-6 py-3 font-medium">Due</th>
                  <th className="px-6 py-3 font-medium">Total</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/portal/invoices/${inv.id}`}
                        className="font-medium text-brand-700 hover:underline">
                        {inv.number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(inv.issued_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(inv.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      GHS {Number(inv.total).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        inv.status === "paid" ? "bg-green-50 text-green-700" :
                        inv.status === "overdue" ? "bg-red-50 text-red-600" :
                        inv.status === "sent" ? "bg-blue-50 text-blue-700" :
                        inv.status === "draft" ? "bg-gray-50 text-gray-500" :
                        "bg-gray-50 text-gray-500"
                      }`}>{inv.status}</span>
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
