"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Invoice } from "@/types/database";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export default function EditInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<LineItem[]>([]);
  const [tax, setTax] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.from("invoices").select("*").eq("id", id).single().then(({ data }) => {
      if (data) {
        setInvoice(data);
        setItems((data.items as any[]) ?? []);
        setTax(data.items.length > 0
          ? (Number(data.tax) / (Number(data.subtotal) || 1)) * 100
          : 0);
        setDueDate(data.due_date);
        setNotes(data.notes ?? "");
      }
    });
  }, [id]);

  function updateItem(index: number, field: keyof LineItem, value: string) {
    const updated = [...items];
    if (field === "quantity" || field === "unit_price") {
      const num = parseFloat(value) || 0;
      (updated[index] as any)[field] = num;
      updated[index].total = updated[index].quantity * updated[index].unit_price;
    } else {
      (updated[index] as any)[field] = value;
    }
    setItems(updated);
  }

  function addItem() {
    setItems([...items, { description: "", quantity: 1, unit_price: 0, total: 0 }]);
  }

  function removeItem(index: number) {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * (tax / 100);
  const total = subtotal + taxAmount;

  if (!invoice) return <p className="text-sm text-gray-400">Loading...</p>;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { error: err } = await supabase.from("invoices").update({
      items: items.filter((i) => i.description),
      subtotal,
      tax: taxAmount,
      total,
      due_date: dueDate,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    }).eq("id", id);

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }

    router.push("/admin/invoices");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin/invoices" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        &larr; Back to Invoices
      </Link>

      <h3 className="text-lg font-semibold">Edit Invoice {invoice.number}</h3>

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Status:</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
              invoice.status === "paid" ? "bg-green-50 text-green-700" :
              invoice.status === "overdue" ? "bg-red-50 text-red-600" :
              invoice.status === "sent" ? "bg-blue-50 text-blue-700" :
              "bg-gray-50 text-gray-500"
            }`}>{invoice.status}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none" />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Line Items</label>
              <button type="button" onClick={addItem}
                className="text-sm text-brand-700 hover:underline">+ Add Item</button>
            </div>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <input type="text" placeholder="Description" value={item.description}
                    onChange={(e) => updateItem(i, "description", e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-700 focus:outline-none" />
                  <input type="number" placeholder="Qty" value={item.quantity || ""}
                    onChange={(e) => updateItem(i, "quantity", e.target.value)}
                    className="w-16 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-700 focus:outline-none" />
                  <input type="number" placeholder="Price" value={item.unit_price || ""}
                    onChange={(e) => updateItem(i, "unit_price", e.target.value)}
                    className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-700 focus:outline-none" />
                  <div className="flex w-28 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    GHS {item.total.toLocaleString()}
                  </div>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)}
                      className="px-2 py-2 text-sm text-red-500 hover:text-red-700">&times;</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="ml-auto w-64 space-y-1.5 border-t border-gray-100 pt-4 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>GHS {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Tax</span>
              <input type="number" value={tax || ""}
                onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                className="w-20 rounded border border-gray-300 px-2 py-1 text-right text-sm" />%
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-1.5 font-semibold text-gray-900">
              <span>Total</span>
              <span>GHS {total.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none" />
          </div>
        </div>

        {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <button type="submit" disabled={saving}
          className="mt-6 rounded-lg bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
