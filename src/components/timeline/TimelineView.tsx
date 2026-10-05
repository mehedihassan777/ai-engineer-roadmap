"use client";

import { useState } from "react";
import { useProgress } from "@/hooks/useProgress";
import { useSchedule } from "@/hooks/useSchedule";
import { PHASES } from "@/lib/content";
import { PageHeader } from "../layout/PageHeader";
import { Button } from "../ui/Button";
import { PhaseSection } from "./PhaseSection";

export function TimelineView() {
  const schedule = useSchedule();
  const { byPhase, byWeek } = useProgress();
  // Explicit open/closed choices; phases without a choice default to "open if it contains the current week".
  const [choices, setChoices] = useState<Record<string, boolean>>({});

  const currentWeek = schedule.info && schedule.info.status === "in-progress" ? schedule.info.week : null;
  const isOpen = (id: string, weeks: [number, number]) =>
    choices[id] ?? (currentWeek !== null && currentWeek >= weeks[0] && currentWeek <= weeks[1]);
  const setAll = (open: boolean) => setChoices(Object.fromEntries(PHASES.map((phase) => [phase.id, open])));

  return (
    <>
      <PageHeader
        title="Timeline"
        description="All 24 weeks in four phases. Open a phase to see its weeks; open a week to work through its tasks."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setAll(true)}>
              Expand all
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setAll(false)}>
              Collapse all
            </Button>
          </>
        }
      />
      <div className="space-y-4">
        {PHASES.map((phase) => (
          <PhaseSection
            key={phase.id}
            phase={phase}
            open={isOpen(phase.id, phase.weeks)}
            onToggle={() => setChoices((previous) => ({ ...previous, [phase.id]: !isOpen(phase.id, phase.weeks) }))}
            stat={byPhase[phase.id]}
            weekStats={byWeek}
            currentWeek={currentWeek}
            startDate={schedule.ready ? schedule.startDate : null}
          />
        ))}
      </div>
    </>
  );
}
