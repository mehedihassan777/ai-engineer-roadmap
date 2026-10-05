"use client";

import type { ReactNode } from "react";
import { TRACKS } from "@/lib/content";
import { cn } from "@/lib/cn";
import {
  DEFAULT_FILTERS,
  SCOPE_OPTIONS,
  STATUS_OPTIONS,
  type FilterCounts,
  type ScopeFilter,
  type TaskFilters,
} from "@/lib/task-filters";
import { Button } from "../ui/Button";
import { Chip } from "../ui/Chip";
import { TRACK_STYLES } from "../ui/track-styles";

interface TaskFilterBarProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  counts: FilterCounts;
  /** Show the "which weeks" selector (used on the All tasks page). */
  showScope?: boolean;
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="w-14 shrink-0 text-xs font-semibold tracking-wide text-muted uppercase">{label}</span>
      {children}
    </div>
  );
}

/** Filter chips for track and status (and optionally week scope). Shared by This week and All tasks. */
export function TaskFilterBar({ filters, onChange, counts, showScope = false }: TaskFilterBarProps) {
  const isDefault =
    filters.track === DEFAULT_FILTERS.track && filters.status === DEFAULT_FILTERS.status && filters.scope === DEFAULT_FILTERS.scope;

  return (
    <div className="space-y-3 rounded-xl border border-line bg-surface p-4">
      <FilterRow label="Track">
        <Chip selected={filters.track === "all"} count={counts.byTrack.all} onClick={() => onChange({ ...filters, track: "all" })}>
          All
        </Chip>
        {TRACKS.map((track) => (
          <Chip
            key={track.id}
            selected={filters.track === track.id}
            count={counts.byTrack[track.id]}
            onClick={() => onChange({ ...filters, track: track.id })}
          >
            <span className={cn("size-2 rounded-full", TRACK_STYLES[track.color].dot)} aria-hidden="true" />
            {track.shortName}
          </Chip>
        ))}
      </FilterRow>

      <FilterRow label="Status">
        {STATUS_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            selected={filters.status === option.value}
            count={counts.byStatus[option.value]}
            onClick={() => onChange({ ...filters, status: option.value })}
          >
            {option.label}
          </Chip>
        ))}
      </FilterRow>

      {showScope && (
        <FilterRow label="Weeks">
          <select
            aria-label="Which weeks to include"
            value={filters.scope}
            onChange={(event) => onChange({ ...filters, scope: event.target.value as ScopeFilter })}
            className="h-8 rounded-lg border border-line bg-surface px-2 text-sm"
          >
            {SCOPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterRow>
      )}

      {!isDefault && (
        <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_FILTERS)}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
