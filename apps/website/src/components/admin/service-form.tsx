"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Service } from "@/types/database";

type Props = {
  service?: Service;
};

export function ServiceForm({ service }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const data = {
      title: form.get("title") as string,
      slug: form.get("slug") as string,
      short_description: form.get("short_description") as string,
      full_description: form.get("full_description") as string,
      icon: (form.get("icon") as string) || null,
      features: (form.get("features") as string).split("\n").filter(Boolean),
      order_index: Number(form.get("order_index")) || 0,
      published: form.get("published") === "on",
    };

    const supabase = createClient();

    if (service) {
      const { error: err } = await supabase
        .from("services")
        .update(data)
        .eq("id", service.id);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from("services").insert(data);
      if (err) { setError(err.message); setSaving(false); return; }
    }

    router.push("/admin/services");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={service?.title ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
        <div>
          <label htmlFor="slug" className="mb-1 block text-sm font-medium text-gray-700">
            Slug *
          </label>
          <input
            id="slug"
            name="slug"
            required
            defaultValue={service?.slug ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
        <div>
          <label htmlFor="order_index" className="mb-1 block text-sm font-medium text-gray-700">
            Order Index
          </label>
          <input
            id="order_index"
            name="order_index"
            type="number"
            defaultValue={service?.order_index ?? 0}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="short_description" className="mb-1 block text-sm font-medium text-gray-700">
            Short Description *
          </label>
          <textarea
            id="short_description"
            name="short_description"
            required
            rows={2}
            defaultValue={service?.short_description ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="full_description" className="mb-1 block text-sm font-medium text-gray-700">
            Full Description *
          </label>
          <textarea
            id="full_description"
            name="full_description"
            required
            rows={4}
            defaultValue={service?.full_description ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="features" className="mb-1 block text-sm font-medium text-gray-700">
            Features (one per line)
          </label>
          <textarea
            id="features"
            name="features"
            rows={5}
            defaultValue={service?.features?.join("\n") ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-mono focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
        <div>
          <label htmlFor="icon" className="mb-1 block text-sm font-medium text-gray-700">
            Icon (optional)
          </label>
          <input
            id="icon"
            name="icon"
            defaultValue={service?.icon ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
        <div className="flex items-center">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="published"
              defaultChecked={service?.published ?? false}
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
          {saving ? "Saving..." : service ? "Update Service" : "Create Service"}
        </button>
        <a href="/admin/services" className="text-sm text-gray-500 hover:text-gray-700">
          Cancel
        </a>
      </div>
    </form>
  );
}
