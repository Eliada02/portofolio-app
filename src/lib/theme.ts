"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_KEY = "portfolio-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Body/status-bar tint per appearance — keeps the browser chrome in step. */
const THEME_COLOR: Record<ResolvedTheme, string> = {
  light: "#f7ece4",
  dark: "#2a1220",
};

/**
 * Inlined into <head> and executed synchronously while the HTML is parsed, so
 * `.dark` lands on <html> before the first paint. Doing this from React would
 * flash the light theme on every load for dark-mode users — the class would
 * only be applied after hydration.
 *
 * This mirrors `resolve()` below; change the two together.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(
  THEME_KEY
)},t=localStorage.getItem(k)||"system",d=t==="dark"||(t==="system"&&window.matchMedia(${JSON.stringify(
  DARK_QUERY
)}).matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light"}catch(e){}})()`;

// --- external store -------------------------------------------------------

const listeners = new Set<() => void>();
/** Cached so `getSnapshot` stays cheap — invalidated by `setTheme`. */
let cachedTheme: Theme | null = null;

function readStoredTheme(): Theme {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" || v === "system" ? v : "system";
  } catch {
    return "system";
  }
}

function resolve(theme: Theme): ResolvedTheme {
  if (theme !== "system") return theme;
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

/**
 * `useSyncExternalStore` requires a primitive (or referentially stable)
 * snapshot, so both halves of the state travel as one string: "system:dark".
 */
function getSnapshot(): string {
  if (cachedTheme === null) cachedTheme = readStoredTheme();
  return `${cachedTheme}:${resolve(cachedTheme)}`;
}

/** The server can't know the preference; the inline script fixes it pre-paint. */
const SERVER_SNAPSHOT = "system:light";

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const mql = window.matchMedia(DARK_QUERY);
  // A system change only repaints when we're actually following the system.
  const onSystemChange = () => {
    if (cachedTheme === "system") applyToDocument();
    onChange();
  };
  mql.addEventListener("change", onSystemChange);
  return () => {
    listeners.delete(onChange);
    mql.removeEventListener("change", onSystemChange);
  };
}

function applyToDocument() {
  const resolved = resolve(cachedTheme ?? readStoredTheme());
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  // Tells the UA to render form controls and scrollbars in the right shade.
  root.style.colorScheme = resolved;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLOR[resolved]);
}

export function setTheme(next: Theme) {
  cachedTheme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* private mode / storage disabled — the theme just won't persist */
  }
  applyToDocument();
  listeners.forEach((l) => l());
}

// --- hook -----------------------------------------------------------------

export type ThemeControls = {
  theme: Theme;
  resolved: ResolvedTheme;
  setTheme: (t: Theme) => void;
  /** Light → dark → light. Breaks out of "system" on first use, as macOS does. */
  toggle: () => void;
};

export function useTheme(): ThemeControls {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => SERVER_SNAPSHOT
  );
  const [theme, resolved] = snapshot.split(":") as [Theme, ResolvedTheme];

  const toggle = useCallback(
    () => setTheme(resolved === "dark" ? "light" : "dark"),
    [resolved]
  );

  return { theme, resolved, setTheme, toggle };
}
