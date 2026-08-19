"use client";

import { useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { APPS } from "@/lib/apps";
import { frontmostWindow, useOS } from "@/lib/store";
import { useIsTouch, usePrefersReducedMotion } from "@/lib/useMediaQuery";
import { useTheme } from "@/lib/theme";
import { AppIcon } from "./AppIcon";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

/** Resting icon size, and the 1.4x peak the HIG magnification tops out at. */
const BASE_SIZE = 48;
const MAX_SIZE = Math.round(BASE_SIZE * 1.4);
/** How far the cursor's influence reaches, in px either side of an icon. */
const INFLUENCE = 130;

interface DockItemProps {
  /** Cursor x in viewport space, or Infinity when the pointer has left. */
  mouseX: MotionValue<number>;
  label: string;
  /** Announced state — "open" vs "not running" changes what activation does. */
  running?: boolean;
  onClick: () => void;
  magnify: boolean;
  children: React.ReactNode;
}

function DockItem({
  mouseX,
  label,
  running = false,
  onClick,
  magnify,
  children,
}: DockItemProps) {
  const ref = useRef<HTMLButtonElement>(null);

  // Distance from the cursor to this icon's centre, measured live so the
  // curve stays correct while neighbouring icons are themselves growing.
  const distance = useTransform(mouseX, (x) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return Infinity;
    return x - (bounds.x + bounds.width / 2);
  });

  const targetSize = useTransform(
    distance,
    [-INFLUENCE, 0, INFLUENCE],
    [BASE_SIZE, MAX_SIZE, BASE_SIZE],
    { clamp: true }
  );
  const size = useSpring(targetSize, {
    stiffness: 320,
    damping: 22,
    mass: 0.18,
  });

  return (
    <div className="group/item relative flex shrink-0 flex-col items-center justify-end">
      {/* Tooltip. Hidden from the a11y tree — the button is already labelled. */}
      <span
        aria-hidden
        className="material-thick rim pointer-events-none absolute -top-10 hidden whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium text-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover/item:opacity-100 md:block"
      >
        {label}
      </span>

      <motion.button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-label={label}
        // Touch has no hover, so magnification is dead weight — fall back to a
        // fixed, thumb-sized target instead.
        style={magnify ? { width: size, height: size } : undefined}
        className={`grid touch-manipulation place-items-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white/90 ${
          magnify ? "" : "size-11 sm:size-12"
        }`}
        whileTap={{ scale: 0.85 }}
      >
        {children}
      </motion.button>

      {/* Running indicator — a small glowing dot, as in Sequoia. */}
      <span
        aria-hidden
        className={`mt-1 size-1 rounded-full bg-foreground/70 transition-opacity duration-200 ${
          running
            ? "opacity-100 shadow-[0_0_5px_1px_rgb(255_255_255/0.55)] dark:shadow-[0_0_6px_1px_rgb(255_255_255/0.4)]"
            : "opacity-0"
        }`}
      />
    </div>
  );
}

export function Dock() {
  const mouseX = useMotionValue(Infinity);
  const windows = useOS((s) => s.windows);
  const openApp = useOS((s) => s.openApp);
  const minimizeApp = useOS((s) => s.minimizeApp);
  const isTouch = useIsTouch();
  const reducedMotion = usePrefersReducedMotion();
  const { resolved, toggle } = useTheme();

  const magnify = !isTouch && !reducedMotion;

  const frontmostId = frontmostWindow(windows)?.id;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(0.5rem+env(safe-area-inset-bottom))] z-9000 flex justify-center px-2">
      <motion.div
        onMouseMove={(e) => magnify && mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        role="toolbar"
        aria-label="Dock"
        className="material-thin rim pointer-events-auto flex max-w-full items-end gap-1.5 overflow-x-auto rounded-[22px] px-2 pb-1.5 pt-2 elevate-panel [scrollbar-width:none] sm:gap-2.5 sm:px-3 [&::-webkit-scrollbar]:hidden"
      >
        {APPS.filter((a) => a.showInDock).map((app) => {
          const win = windows.find((w) => w.id === app.id);
          const isFrontmost = frontmostId === app.id;

          return (
            <DockItem
              key={app.id}
              mouseX={mouseX}
              label={
                win
                  ? isFrontmost
                    ? `Hide ${app.name}`
                    : `Show ${app.name}`
                  : `Open ${app.name}`
              }
              running={!!win}
              magnify={magnify}
              // Clicking the frontmost app tucks it away; anything else comes
              // forward. This is what a real dock does.
              onClick={() =>
                isFrontmost ? minimizeApp(app.id) : openApp(app.id)
              }
            >
              <AppIcon art={app.Art} />
            </DockItem>
          );
        })}

        {/* Divider, then the utilities — the Trash side of a real dock. */}
        <span
          aria-hidden
          className="mx-1 mb-2 h-10 w-px shrink-0 self-center bg-foreground/15"
        />

        <DockItem
          mouseX={mouseX}
          label={`Switch to ${resolved === "dark" ? "light" : "dark"} appearance`}
          magnify={magnify}
          onClick={toggle}
        >
          <span className="grid size-full place-items-center rounded-[22.5%] bg-linear-to-b from-slate-600 to-slate-900 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35)] dark:from-amber-300 dark:to-amber-500 dark:text-amber-950">
            {resolved === "dark" ? (
              <Sun className="size-1/2" />
            ) : (
              <Moon className="size-1/2" />
            )}
          </span>
        </DockItem>
      </motion.div>
    </div>
  );
}
