"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Testimonial } from "@/types/database";

type Props = {
  testimonial?: Testimonial;
};

export function TestimonialForm({ testimonial }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const data = {
      client_name: form.get("client_name") as string,
      client_title: (form.get("client_title") as string) || null,
      company: (form.get("company") as string) || null,
      content: form.get("content") as string,
      rating: form.get("rating") ? Number(form.get("rating")) : null,
      featured: form.get("featured") === "on",
      published: form.get("published") === "on",
    };

    const supabase = createClient();

    if (testimonial) {
      const { error: err } = await supabase
        .from("testimonials")
        .update(data)
        .eq("id", testimonial.id);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from("testimonials").insert(data);
      if (err) { setError(err.message); setSaving(false); return; }
    }

    router.push("/admin/testimonials");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="client_name" className="mb-1 block text-sm font-medium text-gray-700">
            Client Name *
          </label>
          <input
            id="client_name"
            name="client_name"
            required
            defaultValue={testimonial?.client_name ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
        <div>
          <label htmlFor="client_title" className="mb-1 block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            id="client_title"
            name="client_title"
            defaultValue={testimonial?.client_title ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
        <div>
          <label htmlFor="company" className="mb-1 block text-sm font-medium text-gray-700">
            Company
          </label>
          <input
            id="company"
            name="company"
            defaultValue={testimonial?.company ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
        <div>
          <label htmlFor="rating" className="mb-1 block text-sm font-medium text-gray-700">
            Rating (1-5)
          </label>
          <input
            id="rating"
            name="rating"
            type="number"
            min={1}
            max={5}
            defaultValue={testimonial?.rating ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="content" className="mb-1 block text-sm font-medium text-gray-700">
            Testimonial *
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={4}
            defaultValue={testimonial?.content ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={testimonial?.featured ?? false}
              className="rounded border-gray-300 text-brand-700 focus:ring-brand-700"
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="published"
              defaultChecked={testimonial?.published ?? false}
              className="rounded border-gray-300 text-brand-700 focus:ring-brand-700"
            />
            Published
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-50"
        >
          {saving ? "Saving..." : testimonial ? "Update Testimonial" : "Create Testimonial"}
        </button>
        <a href="/admin/testimonials" className="text-sm text-gray-500 hover:text-gray-700">
          Cancel
        </a>
      </div>
    </form>
  );
}
