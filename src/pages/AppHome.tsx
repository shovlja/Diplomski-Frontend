// src/pages/AppHome.tsx
import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import BoardsView from "@/pages/views/BoardsView";

// Uvezi svoje stvarne komponente ako ih imaš već;
// ovde su samo stubovi kao primer:
function HomeDashboard() {
  return <div className="p-4"><strong>Dashboard</strong> — overview</div>;
}
function TeamsView() { return <div className="p-4">Teams (my teams)</div>; }
function MyTasksView() { return <div className="p-4">My tasks</div>; }
function NotificationsView() { return <div className="p-4">Notifications</div>; }
function InvitesView() { return <div className="p-4">Invitations</div>; }
function SprintsView() { return <div className="p-4">Sprints</div>; }
function EpicsView() { return <div className="p-4">Epics</div>; }
function StoriesView() { return <div className="p-4">User stories</div>; }
function ReportsView() { return <div className="p-4">Reports</div>; }

function AdminUsers() { return <div className="p-4">System admin • Users</div>; }
function AdminTeams() { return <div className="p-4">System admin • Teams</div>; }
function AdminInvites() { return <div className="p-4">System admin • Invitations</div>; }
function AdminLogs() { return <div className="p-4">System admin • Audit logs</div>; }
function SettingsPage() { return <div className="p-4">System admin • Settings</div>; }

// ADMIN guard za view-ove
function ViewGate({ adminOnly, children }: { adminOnly?: boolean; children: React.ReactNode }) {
  const { user } = useAuth();
  if (adminOnly && user?.system_role !== "ADMIN") {
    return <div className="p-4 text-sm text-rose-600">Access denied.</div>;
  }
  return <>{children}</>;
}

export default function AppHome() {
  const [sp] = useSearchParams();
  const v = sp.get("v") ?? ""; // "" = dashboard

  switch (v) {
    case "":
      return <HomeDashboard />;

    case "boards":
      return <BoardsView />;
    case "teams":
      return <TeamsView />;
    case "my-tasks":
      return <MyTasksView />;
    case "notifications":
      return <NotificationsView />;
    case "invites":
      return <InvitesView />;

    case "sprints":
      return <SprintsView />;
    case "epics":
      return <EpicsView />;
    case "stories":
      return <StoriesView />;
    case "reports":
      return <ReportsView />;

    // ADMIN views
    case "admin-users":
      return <ViewGate adminOnly><AdminUsers /></ViewGate>;
    case "admin-teams":
      return <ViewGate adminOnly><AdminTeams /></ViewGate>;
    case "admin-invites":
      return <ViewGate adminOnly><AdminInvites /></ViewGate>;
    case "admin-logs":
      return <ViewGate adminOnly><AdminLogs /></ViewGate>;
    case "settings":
      return <ViewGate adminOnly><SettingsPage /></ViewGate>;

    default:
      return <div className="p-4 text-sm text-zinc-500">Unknown view: <code>{v}</code></div>;
  }
}
