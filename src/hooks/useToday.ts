"use client";

import { useSyncExternalStore } from "react";
import { todayString } from "@/lib/dates";

const ONE_MINUTE = 60_000;

function subscribe(onChange: () => void): () => void {
  // Re-check "today" when the tab regains focus and once a minute, so the day rolls over without a reload.
  const timer = window.setInterval(onChange, ONE_MINUTE);
  window.addEventListener("focus", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("focus", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}

/** Today's local date (YYYY-MM-DD), or "" on the server and during hydration. */
export function useToday(): string {
  return useSyncExternalStore(
    subscribe,
    () => todayString(),
    () => "",
  );
}
