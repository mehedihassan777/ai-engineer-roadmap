import { ChevronDown } from "lucide-react";
import { PROJECT_TITLES } from "@/data/ids";
import type { Phase } from "@/data/types";
import { roadmap } from "@/lib/content";
import { cn } from "@/lib/cn";
import { formatPercent } from "@/lib/format";
import type { ProgressStat } from "@/lib/progress";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";
import { WeekRow } from "./WeekRow";

interface PhaseSectionProps {
  phase: Phase;
  open: boolean;
  onToggle: () => void;
  stat: ProgressStat | undefined;
  weekStats: Record<number, ProgressStat>;
  currentWeek: number | null;
  startDate: string | null;
}

/** A collapsible phase: summary header (always visible) and its weeks. */
export function PhaseSection({ phase, open, onToggle, stat, weekStats, currentWeek, startDate }: PhaseSectionProps) {
  const panelId = `phase-panel-${phase.id}`;
  const weekNumbers = Array.from({ length: phase.weeks[1] - phase.weeks[0] + 1 }, (_, index) => phase.weeks[0] + index);

  return (
    <Card className="overflow-hidden">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-start gap-3 p-4 text-left hover:bg-surface-muted/60"
        >
          <ChevronDown className={cn("mt-1 size-5 shrink-0 text-muted transition-transform", !open && "-rotate-90")} aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-semibold">
              Phase {phase.number}: {phase.title}
            </span>
            <span className="mt-0.5 block text-sm text-muted">
              Weeks {phase.weeks[0]}–{phase.weeks[1]}
            </span>
            <span className="mt-2 flex flex-wrap gap-1.5">
              {phase.projectIds.map((id) => (
                <Badge key={id} tone="neutral">
                  {PROJECT_TITLES[id]}
                </Badge>
              ))}
            </span>
          </span>
          <span className="w-28 shrink-0 pt-1 sm:w-40">
            <span className="mb-1 block text-right text-sm font-medium tabular-nums">{formatPercent(stat?.percent ?? 0)}</span>
            <ProgressBar value={stat?.percent ?? 0} label={`Phase ${phase.number} progress`} size="sm" />
          </span>
        </button>
      </h2>
      <div id={panelId} hidden={!open} className="border-t border-line">
        <p className="px-4 pt-3 text-sm text-muted">{phase.summary}</p>
        <ul className="mt-2 divide-y divide-line">
          {weekNumbers.map((number) => (
            <WeekRow
              key={number}
              number={number}
              week={roadmap.weeksByNumber.get(number)}
              stat={weekStats[number]}
              isCurrent={currentWeek === number}
              startDate={startDate}
            />
          ))}
        </ul>
      </div>
    </Card>
  );
}
