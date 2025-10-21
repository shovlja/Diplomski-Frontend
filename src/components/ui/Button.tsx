import * as React from "react";
import { v } from "../../lib/variants";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "subtle";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  rounded?: "md" | "lg" | "xl" | "2xl" | "full";
  elevated?: boolean;         // default=false
  /** Ako je true, neće se renderovati <button>, već tvoje dete (npr. <Link>) sa ubrizganim klasama */
  asChild?: boolean;
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
      rounded = "md",
      elevated = false,        // ⬅️ nema više default shadow-a
      asChild = false,
      children,
      ...rest
    },
    ref
  ) => {
    const classes = v({
      base: `
        inline-flex items-center justify-center select-none font-medium transition
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200
        disabled:opacity-60 disabled:cursor-not-allowed ${roundedMap[rounded]}
      `,
      variants: {
        primary:    "bg-cyan-500 text-white hover:bg-cyan-500/90 active:translate-y-[0.5px]",
        secondary:  "bg-zinc-900 text-white hover:bg-zinc-800",
        outline:    "border border-zinc-300 text-zinc-800 bg-white hover:bg-zinc-50",
        ghost:      "text-zinc-700 hover:bg-zinc-100",
        destructive:"bg-rose-600 text-white hover:bg-rose-500",
        subtle:     "bg-zinc-100 text-zinc-800 hover:bg-zinc-200",
        fullWidth:  "w-full",
        elevated:   "shadow-md shadow-black/5",
      },
      sizes: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-[15px]",
        lg: "h-12 px-5 text-base",
        icon: "h-9 w-9",
      },
      variant,
      size,
      flags: { fullWidth, elevated },
      className,
    });

    if (asChild && React.isValidElement(children)) {
      const child = React.Children.only(children) as React.ReactElement<Record<string, unknown>>;
    
      const mergedClass = [child.props.className as string | undefined, classes]
        .filter(Boolean)
        .join(" ");
    
      // prosledimo sve iz `rest` – onClick je ok i za <a>/<Link>
      return React.cloneElement(child, {
        ...rest,
        className: mergedClass,
        "aria-busy": loading ? "true" : undefined,
      });
    }

    // default: pravi <button>
    return (
      <button
        ref={ref}
        className={classes}
        aria-busy={loading ? "true" : "false"}
        {...rest}
      >
        {loading ? "Please wait…" : children}
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;
