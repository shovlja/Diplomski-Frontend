import * as React from "react";

export default function CreateBoardCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-6 text-zinc-600 hover:bg-zinc-100 hover:border-zinc-400"
      style={{ borderColor: "rgba(34,211,238,.55)" }}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      <span className="font-medium">Create board</span>
    </button>
  );
}
