import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteTestimonial } from "@/components/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function TestimonialsPage() {
  const supabase = await createClient();
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Testimonials</h3>
        <Link
          href="/admin/testimonials/new"
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-800"
        >
          New Testimonial
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        {testimonials && testimonials.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {testimonials.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-gray-900">{t.client_name}</p>
                  <p className="text-sm text-gray-500">
                    {[t.client_title, t.company].filter(Boolean).join(", ") || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {t.featured && (
                    <span className="text-xs font-medium text-amber-600">Featured</span>
                  )}
                  {t.published ? (
                    <span className="text-xs text-green-600">Published</span>
                  ) : (
                    <span className="text-xs text-gray-400">Draft</span>
                  )}
                  <Link
                    href={`/admin/testimonials/${t.id}/edit`}
                    className="text-sm text-brand-700 hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteButton action={deleteTestimonial.bind(null, t.id)} label="Testimonial" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-6 text-sm text-gray-400">No testimonials yet.</p>
        )}
      </div>
    </div>
  );
}
