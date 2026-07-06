import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/admin/project-form";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h3 className="text-lg font-semibold">Edit Project</h3>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <ProjectForm project={project} />
      </div>
    </div>
  );
}
