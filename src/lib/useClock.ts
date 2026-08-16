"use client";

import { useSyncExternalStore } from "react";

const subscribeToSeconds = (onTick: () => void) => {
  const t = setInterval(onTick, 1000);
  return () => clearInterval(t);
};

/**
 * Ticks once a second. Returns null on the server and during hydration so the
 * markup matches, then fills in on the client.
 */
export function useClock() {
  const seconds = useSyncExternalStore(
    subscribeToSeconds,
    () => Math.floor(Date.now() / 1000),
    () => null
  );
  return seconds === null ? null : new Date(seconds * 1000);
}

export const formatTime = (now: Date | null) =>
  now ? now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "";

export const formatDate = (now: Date | null) =>
  now
    ? now.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "";
