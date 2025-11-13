import * as React from "react";
import { Label, type LabelProps } from "./Label";
import { ErrorText } from "./ErrorText";
import { HelperText } from "./HelperText";
import { v } from "../../lib/variants";

type Density = "compact" | "comfortable" | "spacious";

export type FormFieldProps = {
  label?: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  labelExtra?: React.ReactNode;   // e.g. "Forgot password?"
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  density?: Density;
  labelProps?: Omit<LabelProps, "children">; // pass tone/size/uppercase, etc.
};

export function FormField({
  label,
  htmlFor,
  required,
  labelExtra,
  error,
  hint,
  children,
  className,
  density = "comfortable",
  labelProps,
}: FormFieldProps) {
  const classes = v({
    base: "w-full",
    sizes: {
      compact: "space-y-1",
      comfortable: "space-y-1.5",
      spacious: "space-y-2.5",
    },
    size: density,
    className,
  });

  return (
    <div className={classes}>
      {(label || labelExtra) && (
        <div className="flex items-baseline justify-between">
          {label ? (
            <Label htmlFor={htmlFor} required={required} {...labelProps}>
              {label}
            </Label>
          ) : (
            <span />
          )}
          {labelExtra ? <div className="text-[13px]">{labelExtra}</div> : null}
        </div>
      )}

      <div>{children}</div>

      {error ? <ErrorText>{error}</ErrorText> : hint ? <HelperText>{hint}</HelperText> : null}
    </div>
  );
}
