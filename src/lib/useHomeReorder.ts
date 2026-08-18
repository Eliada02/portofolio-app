"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AppId } from "@/lib/store";

/** Hold this long before the grid enters jiggle mode, as iOS does. */
const LONG_PRESS_MS = 450;
/** Move further than this first and it was a scroll, not a hold. */
const MOVE_TOLERANCE = 8;

export interface DragState {
  id: AppId;
  /** Viewport coordinates of the finger, for the floating drag layer. */
  x: number;
  y: number;
}

export interface HomeReorder {
  editing: boolean;
  /** Null unless an icon is currently under the finger. */
  drag: DragState | null;
  /** The order to paint right now — includes the live gap while dragging. */
  preview: AppId[];
  /** Begin tracking a press. Long-press enters edit mode and starts a drag. */
  onPressStart: (id: AppId, e: React.PointerEvent) => void;
  /** True if the press became a drag, so the click shouldn't open the app. */
  onPressEnd: () => boolean;
  exitEditing: () => void;
}

/** Moves `from` to `to`, returning a new array. */
function move<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

/**
 * iPhone home-screen editing: long-press to jiggle, drag to rearrange.
 *
 * The dragged icon is *not* reordered in the DOM while the finger is down.
 * Moving it would move its own layout origin mid-gesture, and since a drag
 * transform is relative to that origin the icon would jump out from under the
 * finger on every swap. Instead the grid paints a `preview` order with a gap
 * opened at the target slot, the real icon is hidden in place, and a floating
 * layer follows the finger — which is what iOS actually shows.
 */
export function useHomeReorder({
  order,
  columns,
  gridRef,
  onCommit,
}: {
  order: AppId[];
  columns: number;
  gridRef: React.RefObject<HTMLElement | null>;
  onCommit: (order: AppId[]) => void;
}): HomeReorder {
  const [editing, setEditing] = useState(false);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [targetIndex, setTargetIndex] = useState(0);

  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPoint = useRef({ x: 0, y: 0 });
  /** Set as soon as a gesture becomes a drag; read by the click handler. */
  const didDrag = useRef(false);

  const clearHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
  };

  useEffect(() => clearHold, []);

  /** Which grid slot the finger is over. */
  const slotAt = useCallback(
    (x: number, y: number) => {
      const grid = gridRef.current;
      if (!grid) return 0;
      const rect = grid.getBoundingClientRect();
      const rows = Math.max(1, Math.ceil(order.length / columns));
      const col = clamp(
        Math.floor(((x - rect.left) / rect.width) * columns),
        0,
        columns - 1
      );
      const row = clamp(
        Math.floor(((y - rect.top) / rect.height) * rows),
        0,
        rows - 1
      );
      return clamp(row * columns + col, 0, order.length - 1);
    },
    [gridRef, columns, order.length]
  );

  const beginDrag = useCallback(
    (id: AppId, x: number, y: number) => {
      didDrag.current = true;
      setEditing(true);
      setTargetIndex(order.indexOf(id));
      setDrag({ id, x, y });
      // A short tick is the closest the web gets to iOS's pickup haptic.
      navigator.vibrate?.(8);
    },
    [order]
  );

  const onPressStart = useCallback(
    (id: AppId, e: React.PointerEvent) => {
      startPoint.current = { x: e.clientX, y: e.clientY };
      didDrag.current = false;
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);

      // Already jiggling: the press is a drag straight away, no hold needed.
      if (editing) {
        beginDrag(id, e.clientX, e.clientY);
        return;
      }
      clearHold();
      holdTimer.current = setTimeout(
        () => beginDrag(id, startPoint.current.x, startPoint.current.y),
        LONG_PRESS_MS
      );
    },
    [editing, beginDrag]
  );

  /**
   * Called from the click handler. The window `pointerup` above has already
   * committed any reorder — clicks fire after pointerup — so this only has to
   * report whether the gesture was a drag, to suppress the launch.
   */
  const onPressEnd = useCallback(() => {
    clearHold();
    return didDrag.current;
  }, []);

  // Tracking lives on the window so the gesture survives the finger leaving
  // the grid, and so a released pointer always ends the drag.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      // Nothing in progress: cheap early-out on a listener that is always on.
      if (!drag && !holdTimer.current) return;
      if (!drag) {
        // Still waiting on the hold — any real movement means it was a scroll.
        const dx = e.clientX - startPoint.current.x;
        const dy = e.clientY - startPoint.current.y;
        if (Math.hypot(dx, dy) > MOVE_TOLERANCE) clearHold();
        return;
      }
      e.preventDefault();
      setDrag({ id: drag.id, x: e.clientX, y: e.clientY });
      setTargetIndex(slotAt(e.clientX, e.clientY));
    };

    const onUp = () => {
      clearHold();
      if (!drag) return;
      const from = order.indexOf(drag.id);
      if (from !== targetIndex) onCommit(move(order, from, targetIndex));
      setDrag(null);
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [drag, order, targetIndex, slotAt, onCommit]);

  // Escape leaves edit mode, matching the Done button.
  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditing(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing]);

  const preview = drag
    ? move(order, order.indexOf(drag.id), targetIndex)
    : order;

  return {
    editing,
    drag,
    preview,
    onPressStart,
    onPressEnd,
    exitEditing: () => {
      setDrag(null);
      setEditing(false);
    },
  };
}
