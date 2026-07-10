"use client";

export function DeleteButton({
  action,
  label = "Delete",
}: {
  action: () => Promise<void>;
  label?: string;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="text-sm text-red-600 hover:underline"
        onClick={(e) => {
          if (!confirm(`Delete this ${label.toLowerCase()}?`)) e.preventDefault();
        }}
      >
        {label}
      </button>
    </form>
  );
}
