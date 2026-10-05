"use client";

import { useSchedule } from "@/hooks/useSchedule";
import { PageHeader } from "../layout/PageHeader";
import { Skeleton } from "../ui/Skeleton";
import { BackupReminder } from "./BackupReminder";
import { CarryOverCard } from "./CarryOverCard";
import { CurrentWeekCard } from "./CurrentWeekCard";
import { OverallProgressCard } from "./OverallProgressCard";
import { PhaseProgressCard } from "./PhaseProgressCard";
import { ScheduleBanner } from "./ScheduleBanner";
import { StreakCard } from "./StreakCard";
import { TrackProgressCard } from "./TrackProgressCard";

function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <p className="sr-only" role="status">
        Loading your progress…
      </p>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-44" />
        <Skeleton className="h-44 lg:col-span-2" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-52" />
        <Skeleton className="h-52 lg:col-span-2" />
      </div>
    </div>
  );
}

export function DashboardView() {
  const schedule = useSchedule();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your 24-week path from distributed-systems engineer to AI engineer: where you are, what is next, and what slipped."
      />
      {!schedule.ready || !schedule.info ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-4">
          <ScheduleBanner info={schedule.info} startDate={schedule.startDate} />
          <div className="grid gap-4 lg:grid-cols-3">
            <OverallProgressCard />
            <CurrentWeekCard info={schedule.info} week={schedule.currentWeek} startDate={schedule.startDate} />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <StreakCard today={schedule.today} startDate={schedule.startDate} />
            <div className="space-y-4 lg:col-span-2">
              <CarryOverCard currentWeek={schedule.info.week} />
              <BackupReminder today={schedule.today} />
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <TrackProgressCard />
            <PhaseProgressCard currentWeek={schedule.info.week} />
          </div>
        </div>
      )}
    </>
  );
}
