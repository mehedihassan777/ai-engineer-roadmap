"use client";

import { useSchedule } from "@/hooks/useSchedule";
import { Skeleton } from "../ui/Skeleton";
import { BackupReminder } from "./BackupReminder";
import { CarryOverCard } from "./CarryOverCard";
import { CurrentWeekCard } from "./CurrentWeekCard";
import { PhaseProgressCard } from "./PhaseProgressCard";
import { RouteStrip } from "./RouteStrip";
import { ScheduleBanner } from "./ScheduleBanner";
import { StreakCard } from "./StreakCard";
import { TrackProgressCard } from "./TrackProgressCard";

function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <h1 className="sr-only">Dashboard</h1>
      <p className="sr-only" role="status">
        Loading your progress…
      </p>
      <Skeleton className="h-9 w-80 max-w-full" />
      <Skeleton className="h-5 w-96 max-w-full" />
      <Skeleton className="mt-6 h-36 sm:h-24" />
      <div className="grid gap-8 pt-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Skeleton className="h-80" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

export function DashboardView() {
  const schedule = useSchedule();

  if (!schedule.ready || !schedule.info) return <DashboardSkeleton />;

  // One bold element (the route), then the current week as the main panel; everything else is quiet ruled lists.
  return (
    <div className="space-y-8">
      <ScheduleBanner info={schedule.info} startDate={schedule.startDate} />
      <RouteStrip info={schedule.info} />
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <CurrentWeekCard info={schedule.info} week={schedule.currentWeek} startDate={schedule.startDate} />
        <div className="space-y-6">
          <BackupReminder today={schedule.today} />
          <StreakCard today={schedule.today} startDate={schedule.startDate} />
          <CarryOverCard currentWeek={schedule.info.week} />
        </div>
      </div>
      <div className="grid gap-10 border-t border-line pt-8 lg:grid-cols-2">
        <TrackProgressCard />
        <PhaseProgressCard currentWeek={schedule.info.week} />
      </div>
    </div>
  );
}
