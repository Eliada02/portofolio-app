"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * SSR-safe media query hook. Always reports `false` during server render and
 * the first client render, then syncs — so markup never mismatches on hydrate.
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** Below this width the desktop metaphor collapses into full-screen apps. */
export const MOBILE_BREAKPOINT = 768;

/** True on phones / small tablets, where windows are not draggable. */
export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
}

/** True when the primary pointer can't hover — disables dock magnification. */
export function useIsTouch() {
  return useMediaQuery("(pointer: coarse)");
}

/** True when the user asked for reduced motion. */
export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
