"use client";

import { ArrowLeft, ArrowRight, CalendarRange, Code, Flag, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSchedule } from "@/hooks/useSchedule";
import { PROJECT_TITLES } from "@/data/ids";
import { PLAN, patternById, phaseById, roadmap } from "@/lib/content";
import { formatDayMonth } from "@/lib/dates";
import type { ResolvedWeek } from "@/lib/roadmap";
import { weekDateRange } from "@/lib/schedule";
import { PageHeader } from "../layout/PageHeader";
import { Badge } from "../ui/Badge";
import { Button, LinkButton } from "../ui/Button";

function WeekNavigation({ week }: { week: number }) {
  const router = useRouter();
  const hasPrevious = roadmap.weeksByNumber.has(week - 1);
  const hasNext = roadmap.weeksByNumber.has(week + 1);

  return (
    <>
      {hasPrevious ? (
        <LinkButton href={`/week/${week - 1}`} variant="secondary" size="sm" aria-label="Previous week">
          <ArrowLeft className="size-4" aria-hidden="true" />
        </LinkButton>
      ) : (
        <Button variant="secondary" size="sm" disabled aria-label="Previous week">
          <ArrowLeft className="size-4" aria-hidden="true" />
        </Button>
      )}
      <select
        aria-label="Jump to week"
        value={week}
        onChange={(event) => router.push(`/week/${event.target.value}`)}
        className="h-8 rounded-lg border border-line bg-surface px-2 text-sm"
      >
        {roadmap.weeks.map((candidate) => (
          <option key={candidate.number} value={candidate.number}>
            Week {candidate.number}
          </option>
        ))}
      </select>
      {hasNext ? (
        <LinkButton href={`/week/${week + 1}`} variant="secondary" size="sm" aria-label="Next week">
          <ArrowRight className="size-4" aria-hidden="true" />
        </LinkButton>
      ) : (
        <Button variant="secondary" size="sm" disabled aria-label="Next week">
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      )}
    </>
  );
}

export function WeekHeader({ week }: { week: ResolvedWeek }) {
  const schedule = useSchedule();
  const phase = phaseById.get(week.phaseId);
  const range = schedule.ready ? weekDateRange(schedule.startDate, week.number) : null;
  const dsaLabel = week.dsa.kind === "mock" ? "Mock interview week" : (patternById.get(week.dsa.patternId)?.name ?? week.dsa.patternId);

  return (
    <>
      <PageHeader
        eyebrow={phase ? `Phase ${phase.number} · ${phase.title}` : undefined}
        title={`Week ${week.number}: ${week.title}`}
        description={week.summary}
        actions={<WeekNavigation week={week.number} />}
      />
      <ul className="-mt-2 mb-6 flex flex-wrap items-center gap-2" aria-label="Week details">
        <li>
          <Badge>
            <CalendarRange className="size-3.5" aria-hidden="true" />
            {range ? `${formatDayMonth(range.start)} – ${formatDayMonth(range.end)}` : `Week ${week.number} of ${PLAN.totalWeeks}`}
          </Badge>
        </li>
        <li>
          <Badge tone="neutral">
            <Code className="size-3.5" aria-hidden="true" />
            DSA: {dsaLabel}
          </Badge>
        </li>
        {week.projectId && (
          <li>
            <Badge tone="neutral">
              <Rocket className="size-3.5" aria-hidden="true" />
              Project: {PROJECT_TITLES[week.projectId]}
            </Badge>
          </li>
        )}
        {week.milestone && (
          <li>
            <Badge tone="accent">
              <Flag className="size-3.5" aria-hidden="true" />
              {week.milestone}
            </Badge>
          </li>
        )}
      </ul>
    </>
  );
}
