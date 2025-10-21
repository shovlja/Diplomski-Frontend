// src/pages/views/HomeDashboard.tsx
import * as React from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { useClock } from "@/hooks/useClock";
import { greetingByTime } from "@/features/home/utils";
import { useMockActivity, useMockStats } from "@/features/home/mock";

import Hero from "@/components/ui/home/Hero";
import StatCard from "@/components/ui/home/StatCard";
import ActivityCard from "@/components/ui/home/ActivityCard";
import UpcomingCard from "@/components/ui/home/UpcomingCard";
import ClockCalendarCard from "@/components/ui/home/ClockCalendarCard";
import { CalendarDays, KanbanSquare, ListTodo, Users2 } from "lucide-react";

export default function HomeDashboard() {
  const { user } = useAuth();
  const role = (user?.system_role ?? "USER") as "ADMIN" | "USER";
  const name = user?.display_name || "there";
  const { time, date } = useClock();
  const hello = greetingByTime();
  const stats = useMockStats(role);
  const activity = useMockActivity();

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
      {/* 1) Hero */}
      <Hero role={role} hello={hello} name={name} date={date} />

      {/* 2) Stats */}
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {role === "ADMIN" ? (
          <>
            <StatCard label="New users"    value={stats.a} icon={<Users2 className="h-5 w-5" />} />
            <StatCard label="Active users" value={stats.b} icon={<Users2 className="h-5 w-5" />} />
            <StatCard label="Boards"       value={stats.c} icon={<KanbanSquare className="h-5 w-5" />} />
            <StatCard label="Audit events" value={stats.d} icon={<CalendarDays className="h-5 w-5" />} />
          </>
        ) : (
          <>
            <StatCard label="My tasks"       value={stats.a} icon={<ListTodo className="h-5 w-5" />} />
            <StatCard label="Done this week" value={stats.b} icon={<ListTodo className="h-5 w-5" />} />
            <StatCard label="Boards"         value={stats.c} icon={<KanbanSquare className="h-5 w-5" />} />
            <StatCard label="Mentions"       value={stats.d} icon={<Users2 className="h-5 w-5" />} />
          </>
        )}
      </div>

      {/* 3) Jedan red – tri kartice iste visine */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ActivityCard series={activity} />
        <UpcomingCard />
        <ClockCalendarCard time={time} />
      </div>

      <div className="h-6" />
    </div>
  );
}
