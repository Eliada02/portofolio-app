"use client";

import { useRef } from "react";
import { APPS } from "@/lib/apps";
import { useOS } from "@/lib/store";
import { useIsTouch } from "@/lib/useMediaQuery";
import { AppIcon } from "./AppIcon";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

function DockIcon({
  mouseX,
  children,
  label,
  onClick,
  running,
  magnify,
}: {
  mouseX: MotionValue<number>;
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  running: boolean;
  magnify: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const sizeSync = useTransform(distance, [-140, 0, 140], [48, 74, 48]);
  const size = useSpring(sizeSync, { stiffness: 300, damping: 20, mass: 0.2 });

  return (
    <div className="group relative flex shrink-0 flex-col items-center">
      <span className="pointer-events-none absolute -top-9 hidden whitespace-nowrap rounded-md bg-black/70 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100 md:block">
        {label}
      </span>
      <motion.button
        ref={ref}
        onClick={onClick}
        aria-label={`Open ${label}`}
        // Touch devices have no hover, so magnification is dead weight there —
        // fall back to a fixed, thumb-sized icon.
        style={magnify ? { width: size, height: size } : undefined}
        className={`grid touch-manipulation place-items-center ${
          magnify ? "" : "size-11 sm:size-12"
        }`}
        whileTap={{ scale: 0.85 }}
      >
        {children}
      </motion.button>
      <span
        className={`mt-1 size-1 rounded-full bg-black/60 transition dark:bg-white/70 ${
          running ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

export function Dock() {
  const mouseX = useMotionValue(Infinity);
  const openApp = useOS((s) => s.openApp);
  const windows = useOS((s) => s.windows);
  const isTouch = useIsTouch();
  const magnify = !isTouch;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(0.5rem+env(safe-area-inset-bottom))] z-[9000] flex justify-center px-2">
      <motion.div
        onMouseMove={(e) => magnify && mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="pointer-events-auto flex max-w-full items-end gap-1.5 overflow-x-auto rounded-2xl border border-white/20 bg-white/25 px-2 pb-2 pt-2.5 shadow-2xl backdrop-blur-2xl [scrollbar-width:none] sm:gap-3 sm:px-3 dark:bg-white/10 [&::-webkit-scrollbar]:hidden"
      >
        {APPS.filter((a) => a.showInDock).map((app) => {
          const running = windows.some((w) => w.id === app.id);
          return (
            <DockIcon
              key={app.id}
              mouseX={mouseX}
              label={app.name}
              running={running}
              magnify={magnify}
              onClick={() => openApp(app.id)}
            >
              <AppIcon app={app} />
            </DockIcon>
          );
        })}
      </motion.div>
    </div>
  );
}
