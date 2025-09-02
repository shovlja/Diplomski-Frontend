import * as React from "react";
import { v } from "../../lib/variants";
import { cn } from "../../lib/cn";

type Variant = "outline" | "filled" | "ghost" | "default";
type Size = "sm" | "md" | "lg";

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: Variant;
  size?: Size;
  invalid?: boolean;
  fullWidth?: boolean;
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const roundedMap: Record<NonNullable<PasswordInputProps["rounded"]>, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
};

export function PasswordInput({
  className,
  variant = "outline", // screenshot look
  size = "md",
  invalid,
  fullWidth,
  rounded = "md",
  ...props
}: PasswordInputProps) {
  const [show, setShow] = React.useState(false);

  // keep BC: treat "default" as "outline"
  const effVariant = variant === "default" ? "outline" : variant;

  const inputClasses = v({
    base: `w-full outline-none transition text-slate-900 placeholder:text-slate-400 pr-24
           focus-visible:ring-4 focus-visible:ring-violet-200 focus-visible:border-violet-500
           ${roundedMap[rounded]}`,
    variants: {
      outline: "border border-slate-300 bg-white",
      filled: "border border-transparent bg-slate-100 hover:bg-slate-100/90",
      ghost: "border border-transparent bg-transparent hover:bg-slate-50",
      invalid:
        "border-rose-400 ring-rose-200 focus-visible:ring-rose-200 focus-visible:border-rose-500",
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

  return (
    <div className="relative">
      <input
        {...props}
        type={show ? "text" : "password"}
        className={inputClasses}
      />
      <button
        type="button"
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        onClick={() => setShow((s) => !s)}
        className={cn(
          "absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md px-2.5 py-1 text-[13px]",
          "text-violet-600 hover:bg-violet-50"
        )}
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}
