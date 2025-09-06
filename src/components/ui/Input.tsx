import * as React from "react";
import { v } from "../../lib/variants";

export type InputVariant = "outline" | "filled" | "ghost" | "default";
export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  size?: InputSize;
  invalid?: boolean;
  fullWidth?: boolean;
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const roundedMap: Record<NonNullable<InputProps["rounded"]>, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = "outline",
      size = "md",
      invalid,
      fullWidth,
      rounded = "md",
      ...props
    },
    ref
  ) => {
    const effVariant = variant === "default" ? "outline" : variant;

    const classes = v({
      base: `
        w-full outline-none transition
        text-zinc-900 placeholder:text-zinc-400
        ${roundedMap[rounded]}
        focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:border-cyan-400
      `,
      variants: {
        outline: "border border-zinc-300 bg-white",
        filled:  "border border-transparent bg-zinc-100 hover:bg-zinc-100/90",
        ghost:   "border border-transparent bg-transparent hover:bg-zinc-50",
        invalid: "border-rose-400 ring-rose-200 focus-visible:ring-rose-200 focus-visible:border-rose-500",
        fullWidth: "w-full",
      },
      sizes: {
        sm: "px-3 py-2 text-sm",
        md: "px-3.5 py-2.5 text-[15px]",
        lg: "px-4 py-3 text-base",
      },
      variant: effVariant,
      size,
      flags: { invalid, fullWidth },
      className,
    });

    return <input ref={ref} className={classes} {...props} />;
  }
);
Input.displayName = "Input";

export default Input;
