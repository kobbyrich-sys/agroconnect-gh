export function SvgPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100">
      <div className="text-center">
        <svg
          className="mx-auto h-16 w-16 text-brand-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="mt-3 text-sm font-medium text-brand-400">{label}</p>
        <p className="mt-1 text-xs text-brand-300">Image placeholder</p>
      </div>
    </div>
  );
}
