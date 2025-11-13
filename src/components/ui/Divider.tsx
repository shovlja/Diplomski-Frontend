type Variant = "muted" | "strong";

export function Divider({ children, variant = "muted" }: { children?: React.ReactNode; variant?: Variant }) {
  const line = variant === "strong" ? "bg-slate-300 dark:bg-slate-700" : "bg-slate-200 dark:bg-slate-800";
  return (
    <div className="flex items-center gap-3 my-5">
      <div className={`h-px w-full ${line}`} />
      {children ? <span className="text-xs text-slate-500">{children}</span> : null}
      <div className={`h-px w-full ${line}`} />
    </div>
  );
}
