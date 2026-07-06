import { ServiceForm } from "@/components/admin/service-form";

export default function NewServicePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h3 className="text-lg font-semibold">New Service</h3>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <ServiceForm />
      </div>
    </div>
  );
}
