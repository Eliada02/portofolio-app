"use client";

import { Moon, Sun } from "lucide-react";
import { APPS } from "@/lib/apps";
import type { AppId } from "@/lib/store";
import { profile } from "@/lib/data";
import { useClock, formatDate, formatTime } from "@/lib/useClock";
import { useTheme } from "@/lib/theme";
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
      type="button"
      onClick={() => onOpen(app.id)}
      // min-h keeps the target at 44pt even for the unlabelled dock icons.
      className="flex min-h-11 w-full touch-manipulation flex-col items-center gap-1.5 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`Open ${app.name}`}
    >
      <motion.span whileTap={{ scale: 0.92 }} className="block w-full">
        <AppIcon app={app} className="mx-auto size-15" />
      </motion.span>
      {withLabel && (
        <span className="max-w-full truncate text-[11px] font-medium leading-tight text-foreground drop-shadow-sm">
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
  const { resolved, toggle } = useTheme();
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="flex h-full flex-col px-6 pb-3 pt-4">
      {/* Widget */}
      <div className="material-thin rim relative rounded-3xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand-cerise to-brand-magenta text-sm font-semibold text-white ring-1 ring-white/25">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {profile.name}
            </p>
            <p className="truncate text-xs text-foreground/65">
              {profile.role} · {profile.company}
            </p>
          </div>

          {/* Appearance lives here on phones — there's no dock to put it in. */}
          <button
            type="button"
            onClick={toggle}
            aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} appearance`}
            className="ml-auto grid size-11 shrink-0 place-items-center rounded-full bg-foreground/8 text-foreground transition active:scale-95"
          >
            {resolved === "dark" ? (
              <Sun className="size-4.5" />
            ) : (
              <Moon className="size-4.5" />
            )}
          </button>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span
            className="text-2xl font-semibold tabular-nums text-foreground"
            suppressHydrationWarning
          >
            {formatTime(now)}
          </span>
          <span
            className="text-xs text-foreground/65"
            suppressHydrationWarning
          >
            {formatDate(now)}
          </span>
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
        <span className="size-1.5 rounded-full bg-foreground/70" />
      </div>

      {/* Dock */}
      <div className="material-thin rim grid grid-cols-4 gap-4 rounded-3xl px-3 py-2.5">
        {dockApps.map((app) => (
          <HomeIcon key={app.id} app={app} onOpen={onOpen} withLabel={false} />
        ))}
      </div>
    </div>
  );
}
