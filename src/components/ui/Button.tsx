import * as React from "react";
import { v } from "../../lib/variants";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  rounded?: "md" | "lg" | "xl" | "2xl" | "full";
  elevated?: boolean; // nice soft shadow for primary
}

const roundedMap: Record<NonNullable<ButtonProps["rounded"]>, string> = {
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      fullWidth,
      rounded = "md",          // ⬅️ default matches screenshot
      elevated = variant === "primary",
      children,
      ...props
    },
    ref
  ) => {
    const classes = v({
      base:
        `inline-flex items-center justify-center select-none font-medium transition
         focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200
         disabled:opacity-60 disabled:cursor-not-allowed ${roundedMap[rounded]}`,
      variants: {
        primary:
        "bg-[color:var(--accent-on-dark,#0EA5E9)] text-white hover:brightness-95 active:translate-y-[0.5px]"
        ,
        secondary:
          "bg-slate-900 text-white hover:bg-slate-800",
        outline:
          "border border-slate-300 text-slate-800 bg-white hover:bg-slate-50",
        ghost:
          "text-slate-800 hover:bg-slate-100/70",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-500",
        fullWidth: "w-full",
        elevated:
          "shadow-[0_10px_20px_rgba(139,92,246,0.25)]", // soft violet shadow
      },
      sizes: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-[15px]",
        lg: "h-12 px-5 text-base", // ⬅️ screenshot button height
      },
      variant,
      size,
      flags: { fullWidth, elevated },
      className,
    });

    return (
      <button
        ref={ref}
        className={classes}
        aria-busy={loading ? "true" : "false"}
        {...props}
      >
        {loading ? "Please wait…" : children}
      </button>
    );
  }
);
Button.displayName = "Button";
