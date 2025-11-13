import { cn } from "./cn";

/** Minimal variants helper: base + {variantMap} + {sizeMap} + boolean flags */
export function v({
  base = "",
  variant,
  variants = {},
  size,
  sizes = {},
  flags = {},
  className,
}: {
  base?: string;
  variant?: string;
  variants?: Record<string, string>;
  size?: string;
  sizes?: Record<string, string>;
  flags?: Record<string, boolean | undefined>;
  className?: string;
}) {
  const pickedVariant = variant && variants[variant] ? variants[variant] : "";
  const pickedSize = size && sizes[size] ? sizes[size] : "";
  const flagClasses = Object.entries(flags)
    .filter(([, on]) => !!on)
    .map(([k]) => variants[k] || sizes[k] || k); // allow flag keys to map to class names in either map
  return cn(base, pickedVariant, pickedSize, ...flagClasses, className);
}
