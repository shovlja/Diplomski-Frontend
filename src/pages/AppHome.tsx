// src/pages/AppHome.tsx
import * as React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";

import HomeDashboard from "@/pages/views/HomeDashboard";
import BoardsView from "@/pages/views/BoardsView";
import AdminUsersView from "@/pages/views/AdminUsersView";
import EventsView from "@/pages/views/EventsView";
import TeamsView from "@/pages/views/TeamsView";
import NotificationsView from "@/pages/views/NotificationsView";

// stubovi...
function MyTasksView() { return <div className="p-4">My tasks</div>; }
function InvitesView() { return <div className="p-4">Invitations</div>; }
function SprintsView() { return <div className="p-4">Sprints</div>; }
function EpicsView() { return <div className="p-4">Epics</div>; }
function StoriesView() { return <div className="p-4">User stories</div>; }
function ReportsView() { return <div className="p-4">Reports</div>; }
function AdminTeams() { return <div className="p-4">System admin • Teams</div>; }
function AdminInvites() { return <div className="p-4">System admin • Invitations</div>; }
function AdminLogs() { return <div className="p-4">System admin • Audit logs</div>; }
function SettingsPage() { return <div className="p-4">System admin • Settings</div>; }



function ViewGate({ adminOnly, children }: { adminOnly?: boolean; children: React.ReactNode }) {
  const { user } = useAuth();
  const nav = useNavigate();
  React.useEffect(() => {
    if (adminOnly && user && user.system_role !== "ADMIN") nav("/", { replace: true });
  }, [adminOnly, user, nav]);
  if (adminOnly && user && user.system_role !== "ADMIN") return null;
  return <>{children}</>;
}

export default function AppHome() {
  const [sp] = useSearchParams();
  const v = sp.get("v") ?? "";

  switch (v) {
    case "":             return <HomeDashboard />;
    case "boards":       return <BoardsView />;
    case "teams":        return <TeamsView />;
    case "my-tasks":     return <MyTasksView />;
    case "notifications":return <NotificationsView />;
    case "invites":      return <InvitesView />;
    case "sprints":      return <SprintsView />;
    case "events":       return <EventsView />;
    case "epics":        return <EpicsView />;
    case "stories":      return <StoriesView />;
    case "reports":      return <ReportsView />;
    case "admin-users":  return <ViewGate adminOnly><AdminUsersView /></ViewGate>;
    case "admin-teams":  return <ViewGate adminOnly><AdminTeams /></ViewGate>;
    case "admin-invites":return <ViewGate adminOnly><AdminInvites /></ViewGate>;
    case "admin-logs":   return <ViewGate adminOnly><AdminLogs /></ViewGate>;
    case "settings":     return <ViewGate adminOnly><SettingsPage /></ViewGate>;
    default:             return <div className="p-4 text-sm text-zinc-500">Unknown view: <code>{v}</code></div>;
  }
}
