"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Lightbulb, X } from "lucide-react";
import { useIsTouch } from "@/lib/useMediaQuery";

const SEEN_KEY = "portfolio-tip-seen";
/** Long enough to read twice, short enough not to linger. */
const VISIBLE_MS = 6500;
/** Let the desktop settle before something slides in over it. */
const DELAY_MS = 900;

/**
 * The macOS notification that tells a first-time visitor the desktop is
 * interactive.
 *
 * Shown once per browser, then never again — a hint that reappears on every
 * visit stops being a hint and becomes chrome. It reads `localStorage` in an
 * effect rather than during render: this only mounts after the user has
 * unlocked, so there is no paint to block and no hydration to mismatch.
 */
export function FirstRunTip() {
  const [open, setOpen] = useState(false);
  const isTouch = useIsTouch();

  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* storage blocked — treat as unseen and just don't persist */
    }
    if (seen) return;

    const show = setTimeout(() => {
      setOpen(true);
      try {
        localStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* nothing to do */
      }
    }, DELAY_MS);

    const hide = setTimeout(() => setOpen(false), DELAY_MS + VISIBLE_MS);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          // Notifications slide in from the trailing edge on macOS.
          initial={{ opacity: 0, x: 40, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          role="status"
          className="material-thick rim fixed right-3 top-9 z-9500 flex w-[min(20rem,calc(100vw-1.5rem))] items-start gap-2.5 rounded-2xl p-3 elevate-panel"
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
            <Lightbulb className="size-4" />
          </span>
          <p className="min-w-0 flex-1 text-[13px] leading-snug text-foreground">
            <span className="font-semibold">Tip</span>
            {" — "}
            {isTouch
              ? "Tap any icon to open it. Drag a sheet down by its handle to close."
              : "Double-click a desktop icon, or use the Dock at the bottom, to open an app."}
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Dismiss tip"
            className="-m-1 grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
