import * as React from "react";
import Card from "./Card";
import MiniCalendar from "./MiniCalendar";

export default function RightColumn({ time }: { time: string }) {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="text-xs uppercase tracking-wide text-zinc-500">Local time</div>
        <div className="mt-1 text-3xl font-semibold text-zinc-900">{time}</div>
        <div className="text-sm text-zinc-500">Stay focused and have a great day!</div>
      </Card>

      <Card className="p-4">
        <div className="mb-2 text-sm font-medium text-zinc-900">Calendar</div>
        <MiniCalendar />
      </Card>
    </div>
  );
}
