import * as React from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

export default function CreateBoardCard() {
  return (
    <Link
      to="/boards/new"
      className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-6 text-zinc-600 hover:bg-zinc-100 hover:border-zinc-400"
      style={{ borderColor: "rgba(34,211,238,.55)" }}
    >
      <Plus className="h-5 w-5" />
      <span className="font-medium">Create board</span>
    </Link>
  );
}
