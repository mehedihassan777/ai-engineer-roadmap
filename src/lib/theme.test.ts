import { describe, expect, it } from "vitest";
import { THEME_INIT_SCRIPT, THEME_KEY, isThemePreference, resolveTheme } from "./theme";

describe("resolveTheme", () => {
  it("follows the system only for the system preference", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
});

describe("isThemePreference", () => {
  it("accepts only the three preferences", () => {
    expect(["light", "dark", "system"].every(isThemePreference)).toBe(true);
    expect(isThemePreference("auto")).toBe(false);
    expect(isThemePreference(null)).toBe(false);
  });
});

describe("THEME_INIT_SCRIPT", () => {
  function run(stored: string | null, systemDark: boolean): boolean {
    const classes = new Set<string>();
    const fakeWindow = {
      localStorage: { getItem: (key: string) => (key === THEME_KEY ? stored : null) },
      matchMedia: () => ({ matches: systemDark }),
    };
    const fakeDocument = {
      documentElement: {
        classList: {
          toggle: (name: string, force: boolean) => {
            if (force) classes.add(name);
            else classes.delete(name);
          },
        },
      },
    };
    new Function("window", "document", "localStorage", "matchMedia", THEME_INIT_SCRIPT)(
      fakeWindow,
      fakeDocument,
      fakeWindow.localStorage,
      fakeWindow.matchMedia,
    );
    return classes.has("dark");
  }

  it("applies dark before paint when stored as dark, or when system and the OS is dark", () => {
    expect(run("dark", false)).toBe(true);
    expect(run(null, true)).toBe(true);
    expect(run("system", true)).toBe(true);
  });

  it("stays light otherwise", () => {
    expect(run("light", true)).toBe(false);
    expect(run(null, false)).toBe(false);
  });

  it("never throws when storage is blocked", () => {
    const throwing = {
      localStorage: {
        getItem: () => {
          throw new Error("blocked");
        },
      },
    };
    expect(() => new Function("window", "document", "localStorage", THEME_INIT_SCRIPT)(throwing, {}, throwing.localStorage)).not.toThrow();
  });
});
