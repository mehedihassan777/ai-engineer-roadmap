import type { TrackColor } from "@/data/types";

/** Maps a track's colour name (data) to Tailwind classes (UI). Class strings are written out in full so Tailwind can see them. */
export interface ColorStyle {
  bar: string;
  dot: string;
  text: string;
  soft: string;
  border: string;
}

export const TRACK_STYLES: Record<TrackColor, ColorStyle> = {
  violet: {
    bar: "bg-violet-500",
    dot: "bg-violet-500",
    text: "text-violet-700 dark:text-violet-300",
    soft: "bg-violet-50 dark:bg-violet-500/10",
    border: "border-violet-200 dark:border-violet-500/30",
  },
  sky: {
    bar: "bg-sky-500",
    dot: "bg-sky-500",
    text: "text-sky-700 dark:text-sky-300",
    soft: "bg-sky-50 dark:bg-sky-500/10",
    border: "border-sky-200 dark:border-sky-500/30",
  },
  amber: {
    bar: "bg-amber-500",
    dot: "bg-amber-500",
    text: "text-amber-800 dark:text-amber-300",
    soft: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/30",
  },
  emerald: {
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
    soft: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/30",
  },
  rose: {
    bar: "bg-rose-500",
    dot: "bg-rose-500",
    text: "text-rose-700 dark:text-rose-300",
    soft: "bg-rose-50 dark:bg-rose-500/10",
    border: "border-rose-200 dark:border-rose-500/30",
  },
};

/** The neutral accent used for overall progress and generic UI. */
export const ACCENT_STYLE: ColorStyle = {
  bar: "bg-accent",
  dot: "bg-accent",
  text: "text-accent",
  soft: "bg-accent-soft",
  border: "border-accent/30",
};
