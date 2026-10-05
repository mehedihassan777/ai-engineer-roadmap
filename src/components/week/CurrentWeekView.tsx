"use client";

import { useSchedule } from "@/hooks/useSchedule";
import { PageHeader } from "../layout/PageHeader";
import { Skeleton } from "../ui/Skeleton";
import { WeekView } from "./WeekView";

/** /week: shows whichever plan week today falls in (client-side, because it depends on your saved start date). */
export function CurrentWeekView() {
  const schedule = useSchedule();

  if (!schedule.ready || !schedule.info) {
    return (
      <div aria-busy="true">
        <PageHeader title="This week" />
        <div className="space-y-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }
  return <WeekView weekNumber={schedule.info.week} />;
}
