"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export default function NewInvoicePage() {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unit_price: 0, total: 0 },
  ]);
  const [tax, setTax] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.from("profiles").select("*").eq("role", "customer").then(({ data }) => {
      if (data) setCustomers(data);
    });
  }, []);

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!customerId || !dueDate) {
      setError("Please select a customer and due date");
      return;
    }
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { data, error: err } = await supabase.from("invoices").insert({
      customer_id: customerId,
      items: items.filter((i) => i.description),
      subtotal,
      tax: taxAmount,
      total,
      status: "draft",
      due_date: dueDate,
      notes: notes || null,
    }).select("id").single();

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

      <h3 className="text-lg font-semibold">New Invoice</h3>

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Customer</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none">
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name ?? c.email}</option>
                ))}
              </select>
            </div>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Tax (%)</label>
              <input type="number" value={tax || ""} onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none" />
            </div>
          </div>

          <div className="ml-auto w-64 space-y-1.5 border-t border-gray-100 pt-4 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>GHS {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Tax</span>
              <span>GHS {taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-1.5 font-semibold text-gray-900">
              <span>Total</span>
              <span>GHS {total.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none" />
          </div>
        </div>

        {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <button type="submit" disabled={saving}
          className="mt-6 rounded-lg bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-50">
          {saving ? "Creating..." : "Create Invoice"}
        </button>
      </form>
    </div>
  );
}
