"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Invoice } from "@/types/database";

export default function PortalDashboard() {
  const [name, setName] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (profile?.full_name) setName(profile.full_name);

      const { data: inv } = await supabase
        .from("invoices")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
      if (inv) setInvoices(inv);
    });
  }, []);

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((i) => i.status === "paid").length;
  const overdueInvoices = invoices.filter((i) => i.status === "overdue").length;
  const totalOutstanding = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + Number(i.total), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome{name ? `, ${name}` : ""}
        </h1>
        <p className="mt-1 text-gray-500">Manage your invoices and account</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Invoices", value: totalInvoices, color: "bg-blue-50 text-blue-700" },
          { label: "Paid", value: paidInvoices, color: "bg-green-50 text-green-700" },
          { label: "Overdue", value: overdueInvoices, color: overdueInvoices > 0 ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-500" },
          { label: "Outstanding", value: `GHS ${totalOutstanding.toLocaleString()}`, color: totalOutstanding > 0 ? "bg-amber-50 text-amber-700" : "bg-gray-50 text-gray-500" },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className={`inline-flex rounded-lg px-3 py-1 text-sm font-semibold ${card.color}`}>
              {card.value}
            </div>
            <p className="mt-2 text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="font-semibold">Recent Invoices</h3>
          <Link href="/portal/invoices" className="text-sm text-brand-700 hover:underline">View All</Link>
        </div>
        {invoices.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {invoices.slice(0, 5).map((inv) => (
              <Link key={inv.id} href={`/portal/invoices/${inv.id}`}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{inv.number}</p>
                  <p className="text-sm text-gray-500">GHS {Number(inv.total).toLocaleString()}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                  inv.status === "paid" ? "bg-green-50 text-green-700" :
                  inv.status === "overdue" ? "bg-red-50 text-red-600" :
                  inv.status === "sent" ? "bg-blue-50 text-blue-700" :
                  inv.status === "draft" ? "bg-gray-50 text-gray-500" :
                  "bg-gray-50 text-gray-500"
                }`}>{inv.status}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="p-6 text-sm text-gray-400">No invoices yet.</p>
        )}
      </div>
    </div>
  );
}
