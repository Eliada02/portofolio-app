"use client";

import { useRef } from "react";
import { useOS, type WindowState } from "@/lib/store";
import { APP_MAP } from "@/lib/apps";
import { motion } from "motion/react";

/** Desktop-only. Phones use MobileShell, which presents apps full-screen. */
export function Window({ win }: { win: WindowState }) {
  const { focusApp, closeApp, minimizeApp, toggleMaximize, moveWindow } = useOS();
  const meta = APP_MAP[win.id];
  const dragState = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (win.maximized) return;
    focusApp(win.id);
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: win.x,
      origY: win.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragState.current;
    if (!d) return;
    moveWindow(
      win.id,
      d.origX + (e.clientX - d.startX),
      d.origY + (e.clientY - d.startY)
    );
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragState.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  const maximize = () =>
    toggleMaximize(win.id, { w: window.innerWidth, h: window.innerHeight });

  const Content = meta.Component;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{
        opacity: win.minimized ? 0 : 1,
        scale: win.minimized ? 0.9 : 1,
        y: win.minimized ? 40 : 0,
      }}
      exit={{ opacity: 0, scale: 0.96, y: 8 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      style={{
        position: "absolute",
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        zIndex: win.z,
        pointerEvents: win.minimized ? "none" : "auto",
      }}
      onMouseDown={() => focusApp(win.id)}
      className="flex flex-col overflow-hidden rounded-xl border border-black/10 bg-background shadow-2xl ring-1 ring-black/5 dark:border-white/10"
    >
      {/* Title bar */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={maximize}
        className="group relative flex h-9 shrink-0 cursor-grab select-none items-center gap-2 border-b border-border bg-secondary/70 px-3 backdrop-blur active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => closeApp(win.id)}
            className="grid size-3 place-items-center rounded-full bg-[#ff5f57] text-[8px] text-black/50 hover:brightness-95"
            aria-label={`Close ${meta.name}`}
          >
            <span className="opacity-0 group-hover:opacity-100">×</span>
          </button>
          <button
            onClick={() => minimizeApp(win.id)}
            className="grid size-3 place-items-center rounded-full bg-[#febc2e] text-[8px] text-black/50 hover:brightness-95"
            aria-label={`Minimize ${meta.name}`}
          >
            <span className="opacity-0 group-hover:opacity-100">–</span>
          </button>
          <button
            onClick={maximize}
            className="grid size-3 place-items-center rounded-full bg-[#28c840] text-[8px] text-black/50 hover:brightness-95"
            aria-label={`Maximize ${meta.name}`}
          >
            <span className="opacity-0 group-hover:opacity-100">+</span>
          </button>
        </div>
        <span className="pointer-events-none absolute left-1/2 max-w-[60%] -translate-x-1/2 truncate text-xs font-medium text-muted-foreground">
          {meta.name}
        </span>
      </div>

      {/* Content — a container so apps lay out against the window width. */}
      <div className="@container relative min-h-0 flex-1 overflow-hidden bg-background">
        <Content />
      </div>
    </motion.div>
  );
}
