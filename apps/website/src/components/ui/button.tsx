import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900",
  outline:
    "border-2 border-brand-700 text-brand-700 hover:bg-brand-700 hover:text-white",
  ghost: "text-brand-700 hover:bg-brand-50",
} as const;

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-base",
  lg: "h-13 px-8 text-lg",
} as const;

type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-colors",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center font-semibold transition-colors",
    variants[variant],
    sizes[size],
    className,
  );
}
