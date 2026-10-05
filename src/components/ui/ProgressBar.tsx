import { cn } from "@/lib/cn";
import { ACCENT_STYLE, TRACK_STYLES } from "./track-styles";
import type { TrackColor } from "@/data/types";

interface ProgressBarProps {
  /** 0-100. */
  value: number;
  /** Accessible name, e.g. "Overall progress". */
  label: string;
  color?: TrackColor | "accent";
  className?: string;
  size?: "sm" | "md";
}

export function ProgressBar({ value, label, color = "accent", className, size = "md" }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const bar = color === "accent" ? ACCENT_STYLE.bar : TRACK_STYLES[color].bar;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn("w-full overflow-hidden rounded-full bg-surface-muted", size === "sm" ? "h-1.5" : "h-2.5", className)}
    >
      <div className={cn("h-full rounded-full transition-[width] duration-300", bar)} style={{ width: `${clamped}%` }} />
    </div>
  );
}
