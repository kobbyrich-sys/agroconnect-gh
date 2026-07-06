import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  new: "bg-blue-50 text-blue-700",
  read: "bg-gray-50 text-gray-600",
  replied: "bg-green-50 text-green-700",
  closed: "bg-red-50 text-red-600",
  pending: "bg-amber-50 text-amber-700",
  reviewed: "bg-blue-50 text-blue-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        statusStyles[status] ?? "bg-gray-50 text-gray-600",
      )}
    >
      {status}
    </span>
  );
}
