"use client";

import { useCallback, useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { APPS, APP_MAP, type AppMeta } from "@/lib/apps";
import { useOS, type AppId } from "@/lib/store";
import { profile } from "@/lib/data";
import { useClock, formatDate, formatTime } from "@/lib/useClock";
import { useTheme } from "@/lib/theme";
import { useHomeReorder } from "@/lib/useHomeReorder";
import { AppIcon } from "../AppIcon";
import { Avatar } from "@/components/Avatar";

const COLUMNS = 4;

/** Everything that isn't pinned to the dock, in registry order. */
const DEFAULT_GRID: AppId[] = APPS.filter((a) => !a.iosDock).map((a) => a.id);
const DOCK_APPS = APPS.filter((a) => a.iosDock);

interface HomeIconProps {
  app: AppMeta;
  withLabel?: boolean;
  editing?: boolean;
  /** Staggers the wiggle so the grid doesn't pulse in unison. */
  index?: number;
  hidden?: boolean;
  onOpen: () => void;
  onPressStart?: (e: React.PointerEvent) => void;
}

function HomeIcon({
  app,
  withLabel = true,
  editing = false,
  index = 0,
  hidden = false,
  onOpen,
  onPressStart,
}: HomeIconProps) {
  return (
    <motion.button
      type="button"
      onPointerDown={onPressStart}
      onClick={onOpen}
      // The grid doesn't scroll, so claiming the gesture outright makes
      // long-press-to-drag reliable instead of racing the browser's panning.
      className="flex min-h-11 w-full touch-none flex-col items-center gap-1.5 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={editing ? `Move ${app.name}` : `Open ${app.name}`}
      animate={{
        rotate: editing ? [-1.6, 1.6] : 0,
        opacity: hidden ? 0 : 1,
      }}
      transition={
        editing
          ? {
              rotate: {
                duration: 0.22,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                delay: (index % 5) * 0.045,
              },
              opacity: { duration: 0.12 },
            }
          : { duration: 0.15 }
      }
      whileTap={editing ? undefined : { scale: 0.92 }}
    >
      <span className="block w-full">
        <AppIcon art={app.Art} className="mx-auto size-15" />
      </span>
      {withLabel && (
        <span className="max-w-full truncate text-[11px] font-medium leading-tight text-foreground drop-shadow-sm">
          {app.name}
        </span>
      )}
    </motion.button>
  );
}

/**
 * The iOS home screen: a widget, a rearrangeable app grid, the page indicator
 * and a pinned dock.
 *
 * Hold an icon to enter jiggle mode, then drag to rearrange — the same gesture
 * as the real thing. The dock is deliberately excluded from editing and dims
 * while you rearrange, so it reads as out of scope rather than broken.
 */
export function HomeScreen({ onOpen }: { onOpen: (id: AppId) => void }) {
  const now = useClock();
  const { resolved, toggle } = useTheme();
  const gridRef = useRef<HTMLDivElement>(null);

  const stored = useOS((s) => s.homeOrder);
  const setHomeOrder = useOS((s) => s.setHomeOrder);
  // Guard against a stored order going stale if the app registry changes.
  const order =
    stored && stored.length === DEFAULT_GRID.length ? stored : DEFAULT_GRID;

  const commit = useCallback(
    (next: AppId[]) => setHomeOrder(next),
    [setHomeOrder]
  );

  const { editing, drag, preview, onPressStart, onPressEnd, exitEditing } =
    useHomeReorder({ order, columns: COLUMNS, gridRef, onCommit: commit });

  const draggedApp = drag ? APP_MAP[drag.id] : null;

  return (
    <div className="relative flex h-full flex-col px-6 pb-3 pt-4">
      {/* Widget */}
      <div className="material-thin rim relative rounded-3xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <Avatar className="size-11 shrink-0 rounded-full ring-1 ring-white/25" />
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
          <span className="text-xs text-foreground/65" suppressHydrationWarning>
            {formatDate(now)}
          </span>
        </div>
      </div>

      {/* Done — iOS puts it top-trailing while the grid is jiggling. */}
      {editing && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={exitEditing}
          className="material-thick rim absolute right-6 top-2 z-30 rounded-full px-4 py-1.5 text-[13px] font-semibold text-foreground shadow-lg"
        >
          Done
        </motion.button>
      )}

      {/* App grid */}
      <div
        ref={gridRef}
        role="list"
        className="mt-6 grid grid-cols-4 gap-x-4 gap-y-5"
      >
        {preview.map((id, i) => (
          // `layout` is what makes the other icons slide aside to open a gap.
          <motion.div
            key={id}
            layout
            role="listitem"
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
          >
            <HomeIcon
              app={APP_MAP[id]}
              index={i}
              editing={editing}
              hidden={drag?.id === id}
              onOpen={() => {
                // A press that turned into a drag must not also launch.
                if (onPressEnd()) return;
                if (editing) return;
                onOpen(id);
              }}
              onPressStart={(e) => onPressStart(id, e)}
            />
          </motion.div>
        ))}
      </div>

      {/* Page indicator — one page, so one dot. */}
      <div className="mt-auto flex justify-center gap-1.5 pb-3">
        <span className="size-1.5 rounded-full bg-foreground/70" />
      </div>

      {/* Dock */}
      <div
        className={`material-thin rim grid grid-cols-4 gap-4 rounded-3xl px-3 py-2.5 transition-opacity ${
          editing ? "pointer-events-none opacity-40" : ""
        }`}
      >
        {DOCK_APPS.map((app) => (
          <HomeIcon
            key={app.id}
            app={app}
            withLabel={false}
            onOpen={() => onOpen(app.id)}
          />
        ))}
      </div>

      {/* The floating icon that follows the finger. Rendering the dragged icon
          here rather than in the grid is what stops it jumping when the slots
          reshuffle underneath it. */}
      {drag && draggedApp && (
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.18 }}
          style={{ left: drag.x, top: drag.y, x: "-50%", y: "-50%" }}
          className="pointer-events-none fixed z-50"
        >
          <AppIcon
            art={draggedApp.Art}
            className="size-15 drop-shadow-[0_10px_20px_rgb(0_0_0/0.45)]"
          />
        </motion.div>
      )}
    </div>
  );
}
