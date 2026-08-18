"use client";

import { useEffect, useState } from "react";

type BatteryManager = EventTarget & {
  level: number;
  charging: boolean;
};

export type BatteryStatus = {
  /** 0–1. */
  level: number;
  charging: boolean;
  /** Safari and Firefox removed the Battery Status API; both report false. */
  supported: boolean;
};

/** What we show when the platform won't tell us: a full, unplugged battery. */
const FALLBACK: BatteryStatus = { level: 1, charging: false, supported: false };

/**
 * Live battery level where the browser exposes it. Deliberately silent on
 * failure — a portfolio menu bar shouldn't surface a permissions error.
 */
export function useBattery(): BatteryStatus {
  const [status, setStatus] = useState<BatteryStatus>(FALLBACK);

  useEffect(() => {
    const nav = navigator as Navigator & {
      getBattery?: () => Promise<BatteryManager>;
    };
    if (typeof nav.getBattery !== "function") return;

    let battery: BatteryManager | null = null;
    let cancelled = false;

    const sync = () => {
      if (!battery) return;
      setStatus({
        level: battery.level,
        charging: battery.charging,
        supported: true,
      });
    };

    nav
      .getBattery()
      .then((b) => {
        if (cancelled) return;
        battery = b;
        sync();
        b.addEventListener("levelchange", sync);
        b.addEventListener("chargingchange", sync);
      })
      .catch(() => {
        /* blocked by permissions policy — keep the fallback */
      });

    return () => {
      cancelled = true;
      battery?.removeEventListener("levelchange", sync);
      battery?.removeEventListener("chargingchange", sync);
    };
  }, []);

  return status;
}
