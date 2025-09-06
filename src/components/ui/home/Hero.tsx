import * as React from "react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";
import { CalendarDays, KanbanSquare, Users2 } from "lucide-react";

type Props = {
  role: "ADMIN" | "USER";
  hello: string;
  name: string;
  date: string;
};

export default function Hero({ role, hello, name, date }: Props) {
  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_1px_0_rgba(0,0,0,.05),0_8px_24px_rgba(0,0,0,.06)]">
      <div className="relative isolate flex flex-col gap-4 p-6 sm:p-8">
        {/* soft gradient bg */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(75%_75%_at_0%_0%,rgba(14,165,233,.12),transparent),radial-gradient(90%_60%_at_100%_0%,rgba(14,165,233,.06),transparent)]" />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm text-zinc-500">{date}</div>
            <h1 className="text-2xl font-semibold text-zinc-900">
              {hello}, <span className="text-cyan-600">{name}</span> 👋
            </h1>
            <p className="text-zinc-600">
              Here’s what’s happening across your workspace today.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {role === "ADMIN" ? (
              <>
                <Link to="/?v=admin-users">
                  <Button variant="outline" rounded="full">
                    <Users2 className="mr-2 h-4 w-4" />
                    Manage users
                  </Button>
                </Link>
                <Link to="/?v=admin-logs">
                  <Button rounded="full">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Audit logs
                  </Button>
                </Link>
              </>
            ) : (
              <>
                {/* samo jedno dugme za USER-a */}
                <Link to="/?v=boards">
                  <Button rounded="full">
                    <KanbanSquare className="mr-2 h-4 w-4" />
                    Go to boards
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
