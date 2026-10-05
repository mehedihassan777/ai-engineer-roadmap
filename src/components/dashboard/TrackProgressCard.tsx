"use client";

import { useProgress } from "@/hooks/useProgress";
import { TRACKS } from "@/lib/content";
import { formatHours, formatPercent } from "@/lib/format";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

export function TrackProgressCard() {
  const { byTrack } = useProgress();

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold">Progress by track</h2>
      <ul className="mt-4 space-y-4">
        {TRACKS.map((track) => {
          const stat = byTrack[track.id];
          return (
            <li key={track.id}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium">{track.name}</span>
                <span className="shrink-0 text-muted tabular-nums">
                  <span className="font-medium text-foreground">{formatPercent(stat.percent)}</span> · {formatHours(stat.doneHours)} / {formatHours(stat.totalHours)}
                </span>
              </div>
              <ProgressBar value={stat.percent} color={track.color} label={`${track.name} progress`} />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
