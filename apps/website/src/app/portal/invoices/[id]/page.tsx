"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Invoice, Payment } from "@/types/database";

export default function PortalInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: inv } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", id)
        .eq("customer_id", user.id)
        .single();
      if (inv) {
        setInvoice(inv);
        const { data: pays } = await supabase
          .from("payments")
          .select("*")
          .eq("invoice_id", inv.id)
          .order("paid_at", { ascending: false });
        if (pays) setPayments(pays);
      }
    });
  }, [id]);

  if (!invoice) {
    return <p className="text-sm text-gray-400">Loading...</p>;
  }

  const statusColor = {
    draft: "bg-gray-50 text-gray-500",
    sent: "bg-blue-50 text-blue-700",
    paid: "bg-green-50 text-green-700",
    overdue: "bg-red-50 text-red-600",
    cancelled: "bg-gray-50 text-gray-500",
  }[invoice.status];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/portal/invoices" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        &larr; Back to Invoices
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold">{invoice.number}</h3>
            <p className="text-sm text-gray-500">Issued: {new Date(invoice.issued_date).toLocaleDateString()}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColor}`}>
            {invoice.status}
          </span>
        </div>

        <div className="px-6 py-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium">Qty</th>
                <th className="pb-3 font-medium text-right">Unit Price</th>
                <th className="pb-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(invoice.items as any[]).map((item, i) => (
                <tr key={i}>
                  <td className="py-3 text-gray-900">{item.description}</td>
                  <td className="py-3 text-gray-600">{item.quantity}</td>
                  <td className="py-3 text-right text-gray-600">GHS {Number(item.unit_price).toLocaleString()}</td>
                  <td className="py-3 text-right font-medium text-gray-900">GHS {Number(item.total).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ml-auto mt-4 w-64 space-y-2 border-t border-gray-100 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">GHS {Number(invoice.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tax</span>
              <span className="text-gray-900">GHS {Number(invoice.tax).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-semibold">
              <span>Total</span>
              <span>GHS {Number(invoice.total).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="border-t border-gray-100 px-6 py-4">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Notes</span>
            <p className="mt-1 text-sm text-gray-700">{invoice.notes}</p>
          </div>
        )}

        <div className="border-t border-gray-100 px-6 py-3 text-xs text-gray-400">
          Due: {new Date(invoice.due_date).toLocaleDateString()}
          {invoice.paid_at && ` | Paid: ${new Date(invoice.paid_at).toLocaleString()}`}
        </div>
      </div>

      {payments.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="font-semibold">Payments</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">{p.method.replace("_", " ")}</p>
                  {p.reference && <p className="text-xs text-gray-500">Ref: {p.reference}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">GHS {Number(p.amount).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{new Date(p.paid_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
