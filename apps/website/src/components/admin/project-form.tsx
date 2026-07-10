"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/types/database";

type Props = {
  project?: Project;
};

export function ProjectForm({ project }: Props) {
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
      description: form.get("description") as string,
      category: form.get("category") as string,
      client: (form.get("client") as string) || null,
      completed_date: (form.get("completed_date") as string) || null,
      featured: form.get("featured") === "on",
      published: form.get("published") === "on",
    };

    const supabase = createClient();

    if (project) {
      const { error: err } = await supabase
        .from("projects")
        .update(data)
        .eq("id", project.id);
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: err } = await supabase.from("projects").insert(data);
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    }

    router.push("/admin/projects");
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
            defaultValue={project?.title ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="slug" className="mb-1 block text-sm font-medium text-gray-700">
            Slug *
          </label>
          <input
            id="slug"
            name="slug"
            required
            defaultValue={project?.slug ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-mono focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            defaultValue={project?.description ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-700">
            Category *
          </label>
          <input
            id="category"
            name="category"
            required
            defaultValue={project?.category ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
        <div>
          <label htmlFor="client" className="mb-1 block text-sm font-medium text-gray-700">
            Client
          </label>
          <input
            id="client"
            name="client"
            defaultValue={project?.client ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
        <div>
          <label htmlFor="completed_date" className="mb-1 block text-sm font-medium text-gray-700">
            Completed Date
          </label>
          <input
            id="completed_date"
            name="completed_date"
            type="date"
            defaultValue={project?.completed_date ?? ""}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={project?.featured ?? false}
              className="rounded border-gray-300 text-brand-700 focus:ring-brand-700"
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="published"
              defaultChecked={project?.published ?? false}
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
          {saving ? "Saving..." : project ? "Update Project" : "Create Project"}
        </button>
        <a
          href="/admin/projects"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
