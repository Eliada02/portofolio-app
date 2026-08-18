"use client";

import { useEffect } from "react";
import { useMotionValue, useReducedMotion, useSpring } from "motion/react";

export interface PointerParallax {
  /** -0.5 (left) … 0.5 (right), spring-smoothed. */
  x: ReturnType<typeof useSpring>;
  /** -0.5 (top) … 0.5 (bottom), spring-smoothed. */
  y: ReturnType<typeof useSpring>;
}

/**
 * Normalised, spring-smoothed pointer position for parallax.
 *
 * Values are fractions of the viewport rather than pixels, so a consumer
 * multiplies by however much travel it wants and the effect reads the same on
 * a laptop and an ultrawide.
 *
 * Stays at rest for touch pointers and for anyone who asked for reduced
 * motion — a parallax that only fires on hover is noise on a phone.
 */
export function usePointerParallax(): PointerParallax {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const reduced = useReducedMotion();

  // Loose spring: the backdrop should drift after the cursor, not track it.
  const x = useSpring(rawX, { stiffness: 55, damping: 20, mass: 0.6 });
  const y = useSpring(rawY, { stiffness: 55, damping: 20, mass: 0.6 });

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: PointerEvent) => {
      rawX.set(e.clientX / window.innerWidth - 0.5);
      rawY.set(e.clientY / window.innerHeight - 0.5);
    };
    // Recentre when the cursor leaves, so it doesn't stay stuck off-axis.
    const onLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [rawX, rawY, reduced]);

  return { x, y };
}
