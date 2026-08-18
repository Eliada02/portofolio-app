"use client";

import { motion, useDragControls } from "motion/react";
import { MIN_SIZE } from "@/lib/store";
import type { WindowGeometry } from "@/lib/useWindowGeometry";
import { TrafficLights } from "./TrafficLights";

/** macOS Sequoia title bar height. */
export const TITLE_BAR_HEIGHT = 38;

export interface WindowFrameProps {
  title: string;
  /** Only the frontmost window paints its lights and title at full strength. */
  focused: boolean;
  maximized: boolean;
  minimized: boolean;
  zIndex: number;
  /** Position and size as motion values — see `useWindowGeometry`. */
  geometry: WindowGeometry;
  /** False on touch, where dragging a window only fights the scroller. */
  draggable?: boolean;
  resizable?: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  /** Called once per gesture, with the final geometry. */
  onDragCommit: (x: number, y: number) => void;
  onResizeCommit: (geometry: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
  /** Optional trailing title-bar content (window-scoped toolbar items). */
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}

type Edge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const EDGE_CLASS: Record<Edge, string> = {
  n: "top-0 inset-x-3 h-1.5 cursor-ns-resize",
  s: "bottom-0 inset-x-3 h-1.5 cursor-ns-resize",
  e: "right-0 inset-y-3 w-1.5 cursor-ew-resize",
  w: "left-0 inset-y-3 w-1.5 cursor-ew-resize",
  ne: "top-0 right-0 size-3.5 cursor-nesw-resize",
  nw: "top-0 left-0 size-3.5 cursor-nwse-resize",
  se: "bottom-0 right-0 size-3.5 cursor-nwse-resize",
  sw: "bottom-0 left-0 size-3.5 cursor-nesw-resize",
};

const EDGES = Object.keys(EDGE_CLASS) as Edge[];

/**
 * The chrome around every desktop app: glass, rim light, traffic lights, drag
 * and resize. Entirely presentational — it owns no window state, so the same
 * frame works for anything that needs a macOS window.
 */
export function WindowFrame({
  title,
  focused,
  maximized,
  minimized,
  zIndex,
  geometry,
  draggable = true,
  resizable = true,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onDragCommit,
  onResizeCommit,
  toolbar,
  children,
}: WindowFrameProps) {
  const { x, y, width, height } = geometry;
  const dragControls = useDragControls();
  const canDrag = draggable && !maximized;

  const startResize = (edge: Edge) => (event: React.PointerEvent) => {
    if (maximized) return;
    event.preventDefault();
    event.stopPropagation();
    onFocus();

    const handle = event.currentTarget as HTMLElement;
    handle.setPointerCapture(event.pointerId);

    const start = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: x.get(),
      y: y.get(),
      width: width.get(),
      height: height.get(),
    };

    const onMove = (move: PointerEvent) => {
      const dx = move.clientX - start.pointerX;
      const dy = move.clientY - start.pointerY;

      if (edge.includes("e")) {
        width.set(Math.max(MIN_SIZE.width, start.width + dx));
      }
      if (edge.includes("s")) {
        height.set(Math.max(MIN_SIZE.height, start.height + dy));
      }
      // Dragging a leading edge moves the origin as well as the size, and the
      // clamp has to apply to both or the window slides while it bottoms out.
      if (edge.includes("w")) {
        const next = Math.max(MIN_SIZE.width, start.width - dx);
        width.set(next);
        x.set(start.x + (start.width - next));
      }
      if (edge.includes("n")) {
        const next = Math.max(MIN_SIZE.height, start.height - dy);
        height.set(next);
        y.set(start.y + (start.height - next));
      }
    };

    const onEnd = () => {
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onEnd);
      handle.removeEventListener("pointercancel", onEnd);
      onResizeCommit({
        x: Math.round(x.get()),
        y: Math.round(y.get()),
        width: Math.round(width.get()),
        height: Math.round(height.get()),
      });
    };

    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onEnd);
    handle.addEventListener("pointercancel", onEnd);
  };

  return (
    <motion.div
      style={{
        x,
        y,
        width,
        height,
        zIndex,
        // Minimising collapses toward the dock rather than shrinking in place.
        transformOrigin: minimized ? "50% 190%" : "50% 50%",
        pointerEvents: minimized ? "none" : "auto",
      }}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{
        opacity: minimized ? 0 : 1,
        scale: minimized ? 0.55 : 1,
      }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.8 }}
      drag={canDrag}
      dragControls={dragControls}
      // The title bar starts the drag; the body must stay selectable.
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={() => onDragCommit(Math.round(x.get()), Math.round(y.get()))}
      onPointerDownCapture={onFocus}
      role="dialog"
      aria-label={title}
      aria-modal={false}
      className="rim absolute left-0 top-0 flex flex-col overflow-hidden rounded-[12px] elevate-window"
    >
      {/* Title bar */}
      <header
        onPointerDown={(event) => {
          if (!canDrag) return;
          // Ignore secondary buttons and drags started on a control.
          if (event.button !== 0) return;
          dragControls.start(event);
        }}
        onDoubleClick={onToggleMaximize}
        style={{ height: TITLE_BAR_HEIGHT }}
        className={[
          "material-thin relative z-10 flex shrink-0 select-none items-center gap-2 px-3",
          "border-b border-black/7 dark:border-white/7",
          canDrag ? "cursor-grab active:cursor-grabbing" : "",
        ].join(" ")}
      >
        <TrafficLights
          title={title}
          focused={focused}
          maximized={maximized}
          onClose={onClose}
          onMinimize={onMinimize}
          onToggleMaximize={onToggleMaximize}
        />

        <span
          className={[
            "pointer-events-none absolute left-1/2 max-w-[55%] -translate-x-1/2 truncate",
            "text-xs font-medium tracking-tight transition-opacity",
            focused ? "text-foreground/85" : "text-foreground/40",
          ].join(" ")}
        >
          {title}
        </span>

        {toolbar && (
          <div className="ml-auto flex items-center gap-1">{toolbar}</div>
        )}
      </header>

      {/* Content. Kept near-opaque: vibrancy belongs to chrome, not to body
          text — a fully translucent pane over a saturated wallpaper is
          unreadable, and macOS doesn't do it either. */}
      <div className="@container relative min-h-0 flex-1 overflow-hidden bg-background/92 backdrop-blur-2xl backdrop-saturate-150">
        {children}
      </div>

      {resizable && !maximized && (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {EDGES.map((edge) => (
            <div
              key={edge}
              onPointerDown={startResize(edge)}
              className={`pointer-events-auto absolute z-20 ${EDGE_CLASS[edge]}`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
