import * as React from "react";
import { v } from "../../lib/variants";
import { cn } from "../../lib/cn";

type Variant = "default" | "brand";
type Size = "sm" | "md";

export type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  variant?: Variant;
  size?: Size;
  invalid?: boolean;
  labelClassName?: string;
  indeterminate?: boolean;
};

export function Checkbox({
  id,
  className,
  labelClassName,
  children,
  variant = "default",
  size = "md",
  disabled,
  invalid,
  indeterminate,
  onChange,
  ...props
}: CheckboxProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = !!indeterminate && !ref.current.checked;
    }
  }, [indeterminate]);

  const wrapper = v({
    base: "inline-flex items-center gap-2 select-none",
    variants: { disabled: "opacity-60 cursor-not-allowed", enabled: "cursor-pointer" },
    variant: disabled ? "disabled" : "enabled",
    className,
  });

  const box = v({
    base:
      "grid place-items-center border rounded transition " +
      "peer-focus-visible:ring-2 peer-focus-visible:ring-violet-300",
    variants: {
      default:
        "border-slate-300 bg-white peer-checked:bg-slate-900 peer-checked:border-slate-900",
      brand:
        "border-slate-300 bg-white peer-checked:bg-violet-600 peer-checked:border-violet-600",
      invalid:
        "border-rose-500 peer-checked:border-rose-500 peer-focus-visible:ring-rose-300",
    },
    sizes: { sm: "h-4 w-4", md: "h-5 w-5" },
    variant,
    size,
    flags: { invalid },
  });

  const labelText = cn("text-sm text-slate-600", labelClassName);

  return (
    <label htmlFor={inputId} className={wrapper}>
      <input
        id={inputId}
        ref={ref}
        type="checkbox"
        className="peer sr-only"
        disabled={disabled}
        aria-invalid={invalid ? "true" : "false"}
        onChange={(e) => onChange?.(e)}
        {...props}
      />
      <span aria-hidden className={box}>
        {/* check icon */}
        <svg
          className="opacity-0 peer-checked:opacity-100 transition"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {children ? <span className={labelText}>{children}</span> : null}
    </label>
  );
}
