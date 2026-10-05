import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  selected: boolean;
  children: ReactNode;
  /** Optional count shown after the label. */
  count?: number;
}

/** A toggle button for filters. Exposes its state with aria-pressed. */
export function Chip({ selected, count, className, children, type = "button", ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors",
        selected
          ? "border-accent bg-accent-soft font-medium text-accent"
          : "border-line bg-surface text-muted hover:bg-surface-muted hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined && <span className="text-xs tabular-nums opacity-80">{count}</span>}
    </button>
  );
}
