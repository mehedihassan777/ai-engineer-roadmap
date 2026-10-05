"use client";

import { useSyncExternalStore } from "react";
import { THEME_EVENT, THEME_KEY, isThemePreference, resolveTheme, type ThemePreference } from "@/lib/theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function readPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    return isThemePreference(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

function applyTheme(preference: ThemePreference): void {
  const dark = resolveTheme(preference, window.matchMedia(DARK_QUERY).matches) === "dark";
  document.documentElement.classList.toggle("dark", dark);
}

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(DARK_QUERY);
  const onSystemChange = () => {
    applyTheme(readPreference()); // keeps "system" in sync when the OS theme flips
    onChange();
  };
  window.addEventListener("storage", onSystemChange); // another tab changed the preference
  window.addEventListener(THEME_EVENT, onChange);
  media.addEventListener("change", onSystemChange);
  return () => {
    window.removeEventListener("storage", onSystemChange);
    window.removeEventListener(THEME_EVENT, onChange);
    media.removeEventListener("change", onSystemChange);
  };
}

export function setThemePreference(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_KEY, preference);
  } catch {
    // Storage blocked: the choice still applies until the page is reloaded.
  }
  applyTheme(preference);
  window.dispatchEvent(new Event(THEME_EVENT));
}

/** The stored preference ("system" on the server and until hydrated) and a setter. */
export function useTheme(): { preference: ThemePreference; setPreference: (preference: ThemePreference) => void } {
  const preference = useSyncExternalStore(subscribe, readPreference, () => "system" as ThemePreference);
  return { preference, setPreference: setThemePreference };
}
