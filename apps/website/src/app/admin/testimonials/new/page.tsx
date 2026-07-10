import { TestimonialForm } from "@/components/admin/testimonial-form";

export default function NewTestimonialPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h3 className="text-lg font-semibold">New Testimonial</h3>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <TestimonialForm />
      </div>
    </div>
  );
}
