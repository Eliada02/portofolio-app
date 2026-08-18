"use client";

import { useEffect } from "react";
import { animate, useMotionValue, type MotionValue } from "motion/react";
import { usePrefersReducedMotion } from "./useMediaQuery";

export type Geometry = { x: number; y: number; width: number; height: number };

export type WindowGeometry = {
  x: MotionValue<number>;
  y: MotionValue<number>;
  width: MotionValue<number>;
  height: MotionValue<number>;
};

/** Snappy but not brittle — settles in ~250ms with no visible overshoot. */
const SPRING = { type: "spring", stiffness: 520, damping: 42, mass: 0.9 } as const;

/** Sub-pixel differences aren't worth an animation frame. */
const EPSILON = 0.5;

/**
 * Mirrors a window's stored geometry into motion values.
 *
 * Position and size live outside React state on purpose: a drag updates a
 * `MotionValue` and Framer writes the transform straight to the compositor,
 * so moving a window costs zero React renders. Committing to the store only
 * happens once, when the gesture ends.
 *
 * When the store changes from somewhere else — zoom, a viewport resize, the
 * clamp applied on commit — the values animate to the new target instead of
 * snapping, which is what makes maximize/restore read as smooth.
 */
export function useWindowGeometry(target: Geometry): WindowGeometry {
  const x = useMotionValue(target.x);
  const y = useMotionValue(target.y);
  const width = useMotionValue(target.width);
  const height = useMotionValue(target.height);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const pairs: [MotionValue<number>, number][] = [
      [x, target.x],
      [y, target.y],
      [width, target.width],
      [height, target.height],
    ];

    const running = pairs
      // Skip anything already on target — after a drag commit the motion value
      // is usually identical, and re-animating it would fight the gesture.
      .filter(([value, next]) => Math.abs(value.get() - next) > EPSILON)
      .map(([value, next]) => {
        if (reducedMotion) {
          value.set(next);
          return null;
        }
        return animate(value, next, SPRING);
      });

    return () => running.forEach((control) => control?.stop());
  }, [
    target.x,
    target.y,
    target.width,
    target.height,
    reducedMotion,
    x,
    y,
    width,
    height,
  ]);

  return { x, y, width, height };
}
