import { cn } from "@/lib/cn";

/** Placeholder shown while the client reads saved progress (avoids server/client HTML mismatches). */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-surface-muted", className)} />;
}
