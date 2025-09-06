import * as React from "react";
import Card from "./Card";

export default function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-50 text-cyan-600">
          {icon}
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
          <div className="text-xl font-semibold text-zinc-900">{value}</div>
        </div>
      </div>
    </Card>
  );
}
