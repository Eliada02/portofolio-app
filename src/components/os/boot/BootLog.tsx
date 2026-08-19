"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { firstName, topSkills } from "@/lib/data";

/** Milliseconds per character, and the beat between finished lines. */
const CHAR_MS = 18;
const LINE_PAUSE_MS = 260;

/**
 * The stack line is derived from the same `skills` data the Skills app reads,
 * so a boot log that claims a stack can't drift from the one on the CV.
 */
const stackLine = [...topSkills("Frontend", 3), ...topSkills("Backend", 2)].join(
  ", "
);

const LINES = [
  "Initializing EliadaOS…",
  `Mounting /Users/${firstName.toLowerCase()}`,
  `Stack: ${stackLine}`,
  "All services ready.",
];

/**
 * The translucent boot log in the corner: lines typed out one character at a
 * time, the way a verbose boot scrolls past.
 *
 * Runs on one timer that advances a single cursor through the joined text,
 * rather than a timer per line — the whole widget is then one interval and one
 * piece of state.
 */
export function BootLog() {
  const reduced = useReducedMotion();
  const [line, setLine] = useState(0);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    // Reduced motion is handled by deriving the finished state below rather
    // than by setting it here — a setState in an effect body just triggers a
    // second render to reach a value we already know.
    if (reduced) return;
    if (line >= LINES.length) return;

    const current = LINES[line];
    if (chars < current.length) {
      const t = setTimeout(() => setChars((c) => c + 1), CHAR_MS);
      return () => clearTimeout(t);
    }
    // Line finished — hold, then start the next one.
    if (line < LINES.length - 1) {
      const t = setTimeout(() => {
        setLine((l) => l + 1);
        setChars(0);
      }, LINE_PAUSE_MS);
      return () => clearTimeout(t);
    }
  }, [line, chars, reduced]);

  // With reduced motion the log is simply shown complete.
  const lastIndex = LINES.length - 1;
  const shownLine = reduced ? lastIndex : line;
  const shownChars = reduced ? LINES[lastIndex].length : chars;
  const done = shownLine === lastIndex && shownChars === LINES[lastIndex].length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduced ? 0 : 0.4 }}
      // aria-live so the log is announced rather than silently ticking.
      aria-live="polite"
      className="pointer-events-none absolute bottom-4 left-4 z-20 max-w-[min(80vw,22rem)] rounded-xl border border-white/15 bg-black/30 px-3 py-2 font-mono text-[11px] leading-relaxed text-white/70 backdrop-blur-xl"
    >
      {LINES.slice(0, shownLine).map((text) => (
        <p key={text} className="truncate">
          <span className="text-[#7fd6a2]">✓</span> {text}
        </p>
      ))}
      <p className="truncate">
        <span className="text-[#f2758f]">›</span>{" "}
        {LINES[Math.min(shownLine, lastIndex)].slice(0, shownChars)}
        {!done && (
          <motion.span
            aria-hidden
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.55, repeat: Infinity, repeatType: "reverse" }}
            className="ml-0.5 inline-block h-3 w-1.5 translate-y-px bg-white/70"
          />
        )}
      </p>
    </motion.div>
  );
}
