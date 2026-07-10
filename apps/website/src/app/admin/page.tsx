import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ count: inquiries }, { count: quotations }, { count: projects }, { count: testimonials }] =
    await Promise.all([
      supabase.from("inquiries").select("*", { count: "exact", head: true }),
      supabase.from("quotations").select("*", { count: "exact", head: true }),
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase.from("testimonials").select("*", { count: "exact", head: true }),
    ]);

  const { data: recentInquiries } = await supabase
    .from("inquiries")
    .select("id, name, email, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const cards = [
    { label: "Inquiries", count: inquiries ?? 0, href: "/admin/inquiries", color: "bg-blue-50 text-blue-700" },
    { label: "Quotations", count: quotations ?? 0, href: "/admin/quotations", color: "bg-amber-50 text-amber-700" },
    { label: "Projects", count: projects ?? 0, href: "/admin/projects", color: "bg-green-50 text-green-700" },
    { label: "Testimonials", count: testimonials ?? 0, href: "/admin/testimonials", color: "bg-purple-50 text-purple-700" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <a
            key={card.label}
            href={card.href}
            className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <div className={`inline-flex rounded-lg px-3 py-1 text-sm font-semibold ${card.color}`}>
              {card.count}
            </div>
            <p className="mt-3 text-sm font-medium text-gray-600">{card.label}</p>
          </a>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="font-semibold">Recent Inquiries</h3>
        </div>
        {recentInquiries && recentInquiries.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentInquiries.map((inq) => (
              <a
                key={inq.id}
                href={`/admin/inquiries/${inq.id}`}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{inq.name}</p>
                  <p className="text-sm text-gray-500">{inq.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">
                    {new Date(inq.created_at).toLocaleDateString()}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    inq.status === "new" ? "bg-blue-50 text-blue-700" :
                    inq.status === "read" ? "bg-gray-50 text-gray-600" :
                    inq.status === "replied" ? "bg-green-50 text-green-700" :
                    "bg-red-50 text-red-600"
                  }`}>
                    {inq.status}
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="p-6 text-sm text-gray-400">No inquiries yet.</p>
        )}
      </div>
    </div>
  );
}
