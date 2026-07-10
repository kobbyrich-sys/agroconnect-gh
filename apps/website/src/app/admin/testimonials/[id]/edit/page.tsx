import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TestimonialForm } from "@/components/admin/testimonial-form";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: testimonial } = await supabase
    .from("testimonials")
    .select("*")
    .eq("id", id)
    .single();

  if (!testimonial) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h3 className="text-lg font-semibold">Edit Testimonial</h3>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <TestimonialForm testimonial={testimonial} />
      </div>
    </div>
  );
}
