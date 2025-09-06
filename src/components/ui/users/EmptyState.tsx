import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyState() {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 py-16">
      <div className="text-center">
        <div className="mb-2 text-lg font-semibold text-zinc-900">No users found</div>
        <p className="mb-4 text-sm text-zinc-600">Try adjusting filters or create an account manually.</p>
        <Button asChild variant="outline" className="hover:bg-zinc-100">
          <Link to="/admin/users/new">
            <span className="inline-flex items-center gap-1">
              <Plus className="h-4 w-4 shrink-0" />New user
            </span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
