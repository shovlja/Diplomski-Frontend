import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { v } from "../../lib/variants";

export type PasswordVariant = "outline" | "filled" | "ghost" | "default";
export type PasswordSize = "sm" | "md" | "lg";

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: PasswordVariant;
  size?: PasswordSize;
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

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
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
    const [show, setShow] = React.useState(false);
    const effVariant = variant === "default" ? "outline" : variant;

    const inputClasses = v({
      base: `
        w-full outline-none transition
        text-zinc-900 placeholder:text-zinc-400
        ${roundedMap[rounded]}
        focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:border-cyan-400
        pr-10
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

    return (
      <div className="relative">
        <input
          ref={ref}
          type={show ? "text" : "password"}
          className={inputClasses}
          {...props}
        />
        <button
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow((s) => !s)}
          className={`
            absolute right-2 top-1/2 -translate-y-1/2
            inline-flex h-8 w-8 items-center justify-center
            rounded-md text-zinc-500
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200
          `}
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
