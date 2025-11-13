import * as React from "react";
import { v } from "@/lib/variants"; // ili: import { v } from "@/lib/variants";

type Variant = "elevated" | "outline" | "ghost";

export function Card({
  className, variant = "elevated", ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: Variant }) {
  const classes = v({
    base: "rounded-2xl backdrop-blur-xl",
    variants: {
      elevated:
        "border border-white/60 dark:border-white/10 bg-[rgb(var(--surface)/0.7)] shadow-[0_10px_30px_rgba(2,8,23,0.08)]",
      outline:
        "border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50",
      ghost:
        "border border-transparent bg-white/40 dark:bg-slate-900/30",
    },
    variant,
    className,
  });
  return <div className={classes} {...props} />;
}

export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="p-6 pb-2" {...props} />;
}

export function CardTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className="text-2xl font-semibold tracking-tight" {...props} />;
}

export function CardDescription(props: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className="text-[13px] text-slate-500 mt-1" {...props} />;
}

export function CardContent(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="p-6 pt-4 space-y-4" {...props} />;
}

export function CardFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="p-6 pt-0" {...props} />;
}
