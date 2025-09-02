import * as React from "react";
import { v } from "../../lib/variants";

/**
 * White text span with a couple of subtle tones and sizes.
 * Default is pure white.
 */
type Tone = "white" | "muted" | "subtle" | "brand";
type Size = "sm" | "md" | "lg";

export interface SpanProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;   // default: white
  size?: Size;   // default: md
}

export function Span({
  tone = "white",
  size = "md",
  className,
  ...props
}: SpanProps) {
  const classes = v({
    base: "inline",
    variants: {
      white: "text-white",
      muted: "text-white/80",
      subtle: "text-white/60",
      brand: "text-[color:var(--accent-on-dark,#0EA5E9)]",
    },
    sizes: {
      sm: "text-sm",
      md: "text-base",
      lg: "2em",
    },
    variant: tone,
    size,
    className,
  });

  return <span className={classes} {...props} />;
}
