import { cn } from "@/lib/utils";

type SectionProps = React.ComponentPropsWithoutRef<"section"> & {
  dark?: boolean;
};

export function Section({ dark, className, children, ...props }: SectionProps) {
  return (
    <section
      className={cn(
        "px-4 py-16 md:px-6 md:py-24 lg:px-8 lg:py-32",
        dark && "bg-brand-800 text-white",
        className,
      )}
      {...props}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

export function SectionHeader({
  title,
  subtitle,
  centered = true,
}: {
  title: string;
  subtitle?: string;
  centered?: boolean;
}) {
  return (
    <div className={cn("mb-12 max-w-3xl", centered && "mx-auto text-center")}>
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      {subtitle && (
        <p className="mt-4 text-lg text-gray-600">{subtitle}</p>
      )}
    </div>
  );
}
