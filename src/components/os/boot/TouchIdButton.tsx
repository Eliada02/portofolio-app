"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Fingerprint } from "lucide-react";

export type UnlockPhase = "idle" | "scanning" | "unlocked";

export interface TouchIdButtonProps {
  phase: UnlockPhase;
  /** Begins the scan. Ignored unless idle. */
  onScan: () => void;
  /** Fires once the scan animation has played out. */
  onComplete: () => void;
}

/** How long the fingerprint reads before it succeeds. */
const SCAN_MS = 950;

const LABEL: Record<UnlockPhase, string> = {
  idle: "Touch ID to unlock",
  scanning: "Reading…",
  unlocked: "Welcome back",
};

/**
 * The macOS login control: a glass pill with a Touch ID sensor.
 *
 * The scan is theatre, but it's honest theatre — there's no biometric API in
 * a browser, and the delay it adds is the point at which the desktop behind
 * has already started composing.
 */
export function TouchIdButton({ phase, onScan, onComplete }: TouchIdButtonProps) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (phase !== "scanning") return;
    const t = setTimeout(onComplete, reduced ? 200 : SCAN_MS);
    return () => clearTimeout(t);
  }, [phase, onComplete, reduced]);

  const scanning = phase === "scanning";
  const done = phase === "unlocked";

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        type="button"
        onClick={() => phase === "idle" && onScan()}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        disabled={phase !== "idle"}
        aria-label={LABEL[phase]}
        whileTap={phase === "idle" ? { scale: 0.96 } : undefined}
        className={[
          "group relative grid size-20 place-items-center overflow-hidden rounded-full",
          "border border-white/20 bg-white/10 backdrop-blur-2xl backdrop-saturate-150",
          "shadow-[0_8px_32px_-8px_rgb(0_0_0/0.6)] outline-none transition-colors",
          "hover:bg-white/16 focus-visible:ring-2 focus-visible:ring-white/70",
          "disabled:cursor-default",
        ].join(" ")}
      >
        {/* Shimmer: a diagonal highlight swept across on hover. */}
        {!reduced && (
          <motion.span
            aria-hidden
            initial={false}
            animate={hovered && phase === "idle" ? { x: ["-120%", "120%"] } : { x: "-120%" }}
            transition={
              hovered
                ? { duration: 0.9, repeat: Infinity, repeatDelay: 0.5, ease: "easeInOut" }
                : { duration: 0 }
            }
            className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/35 to-transparent"
          />
        )}

        {/* The sensor ring fills as the print is read. */}
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          className="absolute inset-0 size-full -rotate-90"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgb(255 255 255 / 0.16)"
            strokeWidth="3"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke={done ? "#3DDC7F" : "#FF6B93"}
            strokeWidth="3"
            strokeLinecap="round"
            pathLength={1}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: scanning || done ? 1 : 0 }}
            transition={{ duration: reduced ? 0.2 : SCAN_MS / 1000, ease: "easeInOut" }}
          />
        </svg>

        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.span
              key="done"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[#3DDC7F]"
            >
              <Check className="size-8" strokeWidth={2.5} />
            </motion.span>
          ) : (
            <motion.span
              key="print"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                // A gentle pulse while reading, so it looks live.
                scale: scanning && !reduced ? [1, 1.08, 1] : 1,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={
                scanning
                  ? { scale: { duration: 0.5, repeat: Infinity } }
                  : { duration: 0.2 }
              }
              className="text-white/85"
            >
              <Fingerprint className="size-9" strokeWidth={1.6} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <motion.p
        key={phase}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-medium text-white/70"
      >
        {LABEL[phase]}
      </motion.p>
    </div>
  );
}
