import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ServiceForm } from "@/components/admin/service-form";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (!service) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h3 className="text-lg font-semibold">Edit Service</h3>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <ServiceForm service={service} />
      </div>
    </div>
  );
}
