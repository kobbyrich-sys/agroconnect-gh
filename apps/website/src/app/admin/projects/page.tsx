import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteProject } from "@/components/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Projects</h3>
        <Link
          href="/admin/projects/new"
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-800"
        >
          New Project
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        {projects && projects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Featured</th>
                  <th className="px-6 py-3 font-medium">Published</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {projects.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {p.title}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{p.category}</td>
                    <td className="px-6 py-4">
                      {p.featured ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {p.published ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/projects/${p.id}/edit`}
                          className="text-sm text-brand-700 hover:underline"
                        >
                          Edit
                        </Link>
                        <DeleteButton action={deleteProject.bind(null, p.id)} label="Project" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-6 text-sm text-gray-400">No projects yet.</p>
        )}
      </div>
    </div>
  );
}
