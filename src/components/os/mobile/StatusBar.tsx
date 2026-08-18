"use client";

import { useClock, formatTime } from "@/lib/useClock";
import { Signal, Wifi, WifiOff } from "lucide-react";
import { useOS } from "@/lib/store";
import { BatteryWidget } from "../BatteryWidget";

/**
 * iOS status bar: time leading, radios and battery trailing.
 *
 * It floats over the wallpaper, which flips with the appearance, so it takes
 * its colour from `--foreground` rather than being hard-coded white — white
 * would disappear against the light wallpaper.
 */
export function StatusBar() {
  const now = useClock();
  const wifi = useOS((s) => s.wifi);

  return (
    <div className="relative z-30 flex h-11 shrink-0 items-center justify-between px-6 pt-[env(safe-area-inset-top)] text-[13px] font-semibold text-foreground drop-shadow-sm">
      <span className="tabular-nums" suppressHydrationWarning>
        {formatTime(now)}
      </span>
      <div className="flex items-center gap-1.5">
        <Signal className="size-3.5" strokeWidth={2.5} aria-hidden />
        {wifi ? (
          <Wifi className="size-3.5" strokeWidth={2.5} aria-label="Wi-Fi on" />
        ) : (
          <WifiOff
            className="size-3.5 opacity-60"
            strokeWidth={2.5}
            aria-label="Wi-Fi off"
          />
        )}
        <BatteryWidget showPercent={false} />
      </div>
    </div>
  );
}
