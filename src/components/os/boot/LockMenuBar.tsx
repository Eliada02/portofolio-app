"use client";

import { Lock, Wifi } from "lucide-react";
import { useClock, formatDate, formatTime } from "@/lib/useClock";
import { BatteryWidget } from "../BatteryWidget";

/**
 * The menu bar as it appears before login: status items only, no menus.
 *
 * Reuses the desktop's `BatteryWidget` and clock rather than restating them,
 * so the lock screen and the desktop can't disagree about the time or the
 * charge level.
 */
export function LockMenuBar() {
  const now = useClock();

  return (
    <div className="absolute inset-x-0 top-0 z-20 flex h-7 items-center justify-between gap-2 px-3 text-[13px] text-white/90">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-black/20 backdrop-blur-xl backdrop-saturate-150"
      />

      <span className="flex items-center gap-1.5 font-medium">
        <Lock className="size-3.5" strokeWidth={2.5} aria-hidden />
        Locked
      </span>

      <div className="flex shrink-0 items-center gap-3">
        <BatteryWidget />
        <Wifi className="size-4" aria-label="Wi-Fi on" />
        <span className="hidden sm:inline" suppressHydrationWarning>
          {formatDate(now)}
        </span>
        <span className="tabular-nums" suppressHydrationWarning>
          {formatTime(now)}
        </span>
      </div>
    </div>
  );
}
