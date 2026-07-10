import { createClient } from "@/lib/supabase/server";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const [
    { count: inquiries },
    { count: quotations },
    { count: projects },
    { count: testimonials },
    { data: invoices },
  ] = await Promise.all([
    supabase.from("inquiries").select("*", { count: "exact", head: true }),
    supabase.from("quotations").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("testimonials").select("*", { count: "exact", head: true }),
    supabase.from("invoices").select("status, total"),
  ]);

  const invoiceStats = {
    total: invoices?.length ?? 0,
    paid: invoices?.filter((i) => i.status === "paid").length ?? 0,
    sent: invoices?.filter((i) => i.status === "sent").length ?? 0,
    overdue: invoices?.filter((i) => i.status === "overdue").length ?? 0,
    draft: invoices?.filter((i) => i.status === "draft").length ?? 0,
    revenue: invoices?.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.total), 0) ?? 0,
    outstanding: invoices?.filter((i) => i.status === "sent" || i.status === "overdue")
      .reduce((s, i) => s + Number(i.total), 0) ?? 0,
  };

  const cards = [
    { label: "Inquiries", value: inquiries ?? 0, color: "bg-blue-50 text-blue-700" },
    { label: "Quotations", value: quotations ?? 0, color: "bg-amber-50 text-amber-700" },
    { label: "Projects", value: projects ?? 0, color: "bg-green-50 text-green-700" },
    { label: "Testimonials", value: testimonials ?? 0, color: "bg-purple-50 text-purple-700" },
    { label: "Invoices", value: invoiceStats.total, color: "bg-indigo-50 text-indigo-700" },
  ];

  const maxBarValue = Math.max(invoiceStats.paid, invoiceStats.sent, invoiceStats.overdue, invoiceStats.draft, 1);

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold">Analytics</h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className={`inline-flex rounded-lg px-3 py-1 text-sm font-semibold ${card.color}`}>
              {card.value}
            </div>
            <p className="mt-2 text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h4 className="mb-4 font-semibold">Invoice Status</h4>
          <div className="space-y-3">
            {[
              { label: "Paid", value: invoiceStats.paid, color: "bg-green-500" },
              { label: "Sent", value: invoiceStats.sent, color: "bg-blue-500" },
              { label: "Overdue", value: invoiceStats.overdue, color: "bg-red-500" },
              { label: "Draft", value: invoiceStats.draft, color: "bg-gray-400" },
            ].map((bar) => (
              <div key={bar.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-600">{bar.label}</span>
                  <span className="font-medium text-gray-900">{bar.value}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div className={`h-full rounded-full transition-all ${bar.color}`}
                    style={{ width: `${(bar.value / maxBarValue) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h4 className="mb-4 font-semibold">Revenue Summary</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-4">
              <span className="text-sm font-medium text-green-700">Paid Revenue</span>
              <span className="text-lg font-bold text-green-700">GHS {invoiceStats.revenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-amber-50 p-4">
              <span className="text-sm font-medium text-amber-700">Outstanding</span>
              <span className="text-lg font-bold text-amber-700">GHS {invoiceStats.outstanding.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-brand-50 p-4">
              <span className="text-sm font-medium text-brand-700">Total Invoiced</span>
              <span className="text-lg font-bold text-brand-700">
                GHS {(invoiceStats.revenue + invoiceStats.outstanding).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
