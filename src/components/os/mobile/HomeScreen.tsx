"use client";

import { APPS } from "@/lib/apps";
import type { AppId } from "@/lib/store";
import { profile } from "@/lib/data";
import { useClock, formatDate, formatTime } from "@/lib/useClock";
import { AppIcon } from "../AppIcon";
import { motion } from "motion/react";

const gridApps = APPS.filter((a) => a.showInDock && !a.iosDock);
const dockApps = APPS.filter((a) => a.iosDock);

function HomeIcon({
  app,
  onOpen,
  withLabel = true,
}: {
  app: (typeof APPS)[number];
  onOpen: (id: AppId) => void;
  withLabel?: boolean;
}) {
  return (
    <button
      onClick={() => onOpen(app.id)}
      className="flex w-full touch-manipulation flex-col items-center gap-1.5"
      aria-label={`Open ${app.name}`}
    >
      <motion.span whileTap={{ scale: 0.88 }} className="block w-full">
        <AppIcon app={app} className="mx-auto size-15" />
      </motion.span>
      {withLabel && (
        <span className="max-w-full truncate text-[11px] leading-tight font-medium text-white drop-shadow-sm">
          {app.name}
        </span>
      )}
    </button>
  );
}

/**
 * The iOS home screen: a widget, an app grid, the page indicator and a pinned
 * dock. Dock apps are deliberately absent from the grid, as on a real iPhone.
 */
export function HomeScreen({ onOpen }: { onOpen: (id: AppId) => void }) {
  const now = useClock();
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="flex h-full flex-col px-6 pb-3 pt-4">
      {/* Widget */}
      <div className="rounded-3xl border border-white/15 bg-white/15 p-4 shadow-lg backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-cerise to-brand-magenta text-sm font-semibold text-white ring-1 ring-white/25">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {profile.name}
            </p>
            <p className="truncate text-xs text-white/70">
              {profile.role} · {profile.company}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-semibold tabular-nums text-white">
            {formatTime(now)}
          </span>
          <span className="text-xs text-white/70">{formatDate(now)}</span>
        </div>
      </div>

      {/* App grid */}
      <div className="mt-6 grid grid-cols-4 gap-x-4 gap-y-5">
        {gridApps.map((app) => (
          <HomeIcon key={app.id} app={app} onOpen={onOpen} />
        ))}
      </div>

      {/* Page indicator — one page, so one dot. */}
      <div className="mt-auto flex justify-center gap-1.5 pb-3">
        <span className="size-1.5 rounded-full bg-white/90" />
      </div>

      {/* Dock */}
      <div className="grid grid-cols-4 gap-4 rounded-3xl border border-white/15 bg-white/15 px-3 py-2.5 backdrop-blur-2xl">
        {dockApps.map((app) => (
          <HomeIcon key={app.id} app={app} onOpen={onOpen} withLabel={false} />
        ))}
      </div>
    </div>
  );
}
