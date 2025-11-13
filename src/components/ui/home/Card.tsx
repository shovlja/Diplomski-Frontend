import * as React from "react";
import { cx } from "@/features/home/utils";

type Props = { className?: string; children: React.ReactNode };

export default function Card({ className, children }: Props) {
  return (
    <div
      className={cx(
        "rounded-xl border border-zinc-200 bg-white",
        "shadow-[0_1px_0_rgba(0,0,0,.03),0_8px_24px_rgba(0,0,0,.04)]",
        className
      )}
    >
      {children}
    </div>
  );
}
