import { CalendarClock, PartyPopper } from "lucide-react";
import { formatDate } from "@/lib/dates";
import { plural } from "@/lib/format";
import type { ScheduleInfo } from "@/lib/schedule";
import { LinkButton } from "../ui/Button";

/** Shown before the plan starts and after it ends; renders nothing while it is in progress. */
export function ScheduleBanner({ info, startDate }: { info: ScheduleInfo; startDate: string }) {
  if (info.status === "in-progress") return null;

  const finished = info.status === "finished";
  const Icon = finished ? PartyPopper : CalendarClock;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-accent/30 bg-accent-soft p-4 text-sm">
      <Icon className="size-5 shrink-0 text-accent" aria-hidden="true" />
      <p className="flex-1">
        {finished ? (
          <>The 24-week window has passed. Anything unfinished stays on your list; use All tasks to finish it off.</>
        ) : (
          <>
            Your plan starts on <strong>{formatDate(startDate)}</strong> — in {info.daysUntilStart} {plural(info.daysUntilStart, "day")}. Week 1 is shown below.
          </>
        )}
      </p>
      <LinkButton href="/settings" variant="secondary" size="sm">
        Change start date
      </LinkButton>
    </div>
  );
}
