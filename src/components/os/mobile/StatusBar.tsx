"use client";

import { useClock, formatTime } from "@/lib/useClock";
import { Signal, Wifi, BatteryFull } from "lucide-react";

/**
 * iOS status bar: time on the left, radios and battery on the right. It floats
 * over whatever is beneath it, so the caller picks the tone that stays legible.
 */
export function StatusBar({ tone }: { tone: "light" | "dark" }) {
  const now = useClock();

  return (
    <div
      className={`relative z-50 flex h-11 shrink-0 items-center justify-between px-6 pt-[env(safe-area-inset-top)] text-[13px] font-semibold ${
        tone === "light" ? "text-white" : "text-foreground"
      }`}
    >
      <span className="tabular-nums">{formatTime(now)}</span>
      <div className="flex items-center gap-1.5">
        <Signal className="size-3.5" strokeWidth={2.5} />
        <Wifi className="size-3.5" strokeWidth={2.5} />
        <BatteryFull className="size-5" strokeWidth={2} />
      </div>
    </div>
  );
}
