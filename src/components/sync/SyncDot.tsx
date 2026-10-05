import { cn } from "@/lib/cn";
import type { SyncTone } from "@/lib/sync/describe";

const COLORS: Record<SyncTone, string> = {
  off: "bg-muted/50",
  ok: "bg-emerald-500",
  busy: "bg-sky-500 animate-pulse",
  warn: "bg-amber-500",
  error: "bg-rose-500",
};

export function SyncDot({ tone, className }: { tone: SyncTone; className?: string }) {
  return <span aria-hidden="true" className={cn("inline-block size-2 shrink-0 rounded-full", COLORS[tone], className)} />;
}
