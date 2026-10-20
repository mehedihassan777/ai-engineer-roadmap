"use client";

import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useHydrated } from "@/hooks/useHydrated";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/cn";
import { THEME_OPTIONS, type ThemePreference } from "@/lib/theme";

const ICONS: Record<ThemePreference, LucideIcon> = { light: Sun, system: Monitor, dark: Moon };

/** Light / System / Dark. With `iconOnly` the labels are visually hidden (still read by screen readers). */
export function ThemeToggle({ iconOnly = false }: { iconOnly?: boolean }) {
  const hydrated = useHydrated();
  const { preference, setPreference } = useTheme();

  return (
    <div role="group" aria-label="Colour theme" className={cn("rounded-md border border-line bg-surface p-0.5", iconOnly ? "inline-flex" : "flex w-full")}>
      {THEME_OPTIONS.map((option) => {
        const Icon = ICONS[option.value];
        const selected = hydrated && preference === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            title={option.label}
            onClick={() => setPreference(option.value)}
            className={cn(
              "inline-flex h-8 items-center justify-center gap-1.5 rounded-[4px] text-sm transition-colors",
              iconOnly ? "w-8" : "flex-1 px-2",
              selected ? "bg-foreground font-semibold text-background" : "text-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span className={iconOnly ? "sr-only" : undefined}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
