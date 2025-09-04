// src/components/layout/Sidebar.tsx
import * as React from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  LayoutDashboard, KanbanSquare, ListTodo, CalendarDays, BarChart3,
  Milestone, BookOpenText, Bell, Users, CircleUserRound, FileText, Settings, LogOut
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { Button } from "@/components/ui/button";

type Item = { view: string; label: string; icon: React.ElementType; exact?: boolean };
type Section = { title: string; items: Item[]; roles?: Array<"USER" | "ADMIN"> };

const sections: Section[] = [
  {
    title: "General",
    items: [
      { view: "",         label: "Dashboard", icon: LayoutDashboard, exact: true }, // v="" => home "/"
      { view: "boards",   label: "Boards",    icon: KanbanSquare },
      { view: "teams",    label: "Teams",     icon: Users },        // svaki user vidi svoje timove
    ],
  },
  {
    title: "Work",
    items: [
      { view: "my-tasks",      label: "My tasks",      icon: ListTodo },
      { view: "notifications", label: "Notifications", icon: Bell },
      { view: "invites",       label: "Invitations",   icon: CircleUserRound },
    ],
  },
  {
    title: "Planning",
    items: [
      { view: "sprints", label: "Sprints",      icon: CalendarDays },
      { view: "epics",   label: "Epics",        icon: Milestone },
      { view: "stories", label: "User stories", icon: BookOpenText },
      { view: "reports", label: "Reports",      icon: BarChart3 },
    ],
  },
  // SAMO sistemski admin
  {
    title: "System admin",
    roles: ["ADMIN"],
    items: [
      { view: "admin-users",   label: "All users",   icon: CircleUserRound },
      { view: "admin-teams",   label: "All teams",   icon: Users },
      { view: "admin-invites", label: "Invitations", icon: CircleUserRound },
      { view: "admin-logs",    label: "Audit logs",  icon: FileText },
      { view: "settings",      label: "Settings",    icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const role = (user?.system_role ?? "USER") as "USER" | "ADMIN";
  const [sp] = useSearchParams();
  const currentView = sp.get("v") ?? ""; // "" = home

  const visibleSections = React.useMemo(
    () => sections.filter((s) => !s.roles || s.roles.includes(role)),
    [role]
  );

  const makeHref = (view: string) => (view ? `/?v=${encodeURIComponent(view)}` : "/");

  return (
    <aside className="sticky top-14 h-[calc(100dvh-56px)] sm:top-16 sm:h-[calc(100dvh-64px)] w-64 shrink-0 border-r border-zinc-200 bg-white">
      <nav className="px-2 py-2 space-y-3">
        {visibleSections.map((section) => (
          <div key={section.title}>
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map(({ view, label, icon: Icon, exact }) => {
                const isActive = exact ? currentView === "" : currentView === view;
                return (
                  <Link
                    key={view || "home"}
                    to={makeHref(view)}
                    className={[
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                      "cursor-grab active:cursor-grabbing select-none border-l-2",
                      isActive
                        ? "bg-zinc-100 text-zinc-900 border-[rgb(34,211,238)]"
                        : "text-zinc-600 border-transparent hover:bg-zinc-100",
                    ].join(" ")}
                  >
                    <Icon className="h-5 w-5 opacity-80 group-hover:opacity-100" />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto px-2 pb-3">
        <Button variant="outline" className="w-full hover:bg-zinc-100" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </aside>
  );
}
