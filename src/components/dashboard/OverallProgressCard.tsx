"use client";

import { useProgress } from "@/hooks/useProgress";
import { formatHours, formatPercent } from "@/lib/format";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

export function OverallProgressCard() {
  const { overall } = useProgress();

  return (
    <Card className="p-5">
      <h2 className="text-sm font-medium text-muted">Overall progress</h2>
      <p className="mt-2 text-4xl font-semibold tabular-nums">{formatPercent(overall.percent)}</p>
      <ProgressBar value={overall.percent} label="Overall progress" className="mt-3" />
      <p className="mt-3 text-sm text-muted">
        {overall.doneTasks} of {overall.totalTasks} tasks · {formatHours(overall.doneHours)} of {formatHours(overall.totalHours)}
      </p>
      {overall.inProgressTasks > 0 && <p className="mt-1 text-sm text-muted">{overall.inProgressTasks} in progress</p>}
    </Card>
  );
}
