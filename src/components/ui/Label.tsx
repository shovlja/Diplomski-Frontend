import * as React from "react";
import { v } from "../../lib/variants";

type Size = "sm" | "md";
type Tone = "default" | "muted";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  size?: Size;
  tone?: Tone;
  required?: boolean;   // shows a small asterisk
  uppercase?: boolean;  // optional visual variant
};

export function Label({
  className,
  size = "md",
  tone = "default",
  required,
  uppercase,
  children,
  ...props
}: LabelProps) {
  const classes = v({
    base: "block font-medium",
    sizes: { sm: "text-[12px]", md: "text-[13px]" },
    variants: {
      default: "text-slate-800 dark:text-slate-200",
      muted: "text-slate-500",
      uppercase: "uppercase tracking-wide",
    },
    size,
    variant: tone,
    flags: { uppercase },
    className,
  });

  return (
    <label className={classes} {...props}>
      {children}
      {required ? (
        <span aria-hidden="true" className="ml-1 text-violet-600">*</span>
      ) : null}
    </label>
  );
}
