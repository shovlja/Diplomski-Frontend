import { v } from "../../lib/variants";

type Type = "error" | "info" | "success" | "warning";
type Tone = "soft" | "solid";

export function Alert({
  type = "error",
  tone = "soft",
  children,
  className,
}: {
  type?: Type;
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  const classes = v({
    base: "w-full text-sm rounded-xl px-3 py-2 border",
    variants: {
      // soft
      "error-soft": "bg-rose-50 text-rose-700 border-rose-200",
      "info-soft": "bg-sky-50 text-sky-700 border-sky-200",
      "success-soft": "bg-emerald-50 text-emerald-700 border-emerald-200",
      "warning-soft": "bg-amber-50 text-amber-800 border-amber-200",
      // solid (more contrast)
      "error-solid": "bg-rose-600 text-white border-rose-700",
      "info-solid": "bg-sky-600 text-white border-sky-700",
      "success-solid": "bg-emerald-600 text-white border-emerald-700",
      "warning-solid": "bg-amber-600 text-white border-amber-700",
    },
    // combine keys
    variant: `${type}-${tone}`,
    className,
  });

  return <div className={classes}>{children}</div>;
}
